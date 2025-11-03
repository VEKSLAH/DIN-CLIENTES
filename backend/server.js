import express from "express";
import axios from "axios";
import AdmZip from "adm-zip";
import XLSX from "xlsx";
import cors from "cors";
import cron from "node-cron";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

// 🧩 Conexión a MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ Error: falta la variable MONGO_URI en el archivo .env");
  process.exit(1);
}

try {
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    family: 4,
  });
  console.log("✅ Conectado a MongoDB Atlas");
} catch (err) {
  console.error("❌ Error al conectar a MongoDB:", err.message);
  process.exit(1);
}

// 🧱 Esquema y modelos
const articuloSchema = new mongoose.Schema({
  codigo: String,
  descripcion: String,
  precio: Number,
  stock: mongoose.Schema.Types.Mixed,
  rubro: String,
  marca: String,
  lista: String,
  equivalente: String,
});
const Articulo = mongoose.model("Articulo", articuloSchema);

const statusSchema = new mongoose.Schema({
  _id: { type: String, default: "status_articulos" },
  fuente: String,
  ultima_actualizacion: Date,
  estado: String,
  detalles: String,
});
const Status = mongoose.model("Status", statusSchema);

// 🧠 Cache local y flag de actualización
let articulosCache = [];
let isUpdating = false;

// 📦 Función principal: descarga y actualización segura
async function actualizarArticulos() {
  if (isUpdating) {
    console.log(
      "⚠️ Ya hay una actualización en curso, se omite esta ejecución."
    );
    return;
  }
  isUpdating = true;

  const fecha = new Date();

  try {
    console.log(`[${fecha.toLocaleString()}] 🔄 Descargando datos de Okawa...`);
    const url = "https://www.okawa.com.ar/tapice/datos/datos.zip";
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const zip = new AdmZip(response.data);
    const entry = zip.getEntry("okawa-completa.xls");
    if (!entry)
      throw new Error("No se encontró el archivo okawa-completa.xls en el ZIP");

    const workbook = XLSX.read(entry.getData(), { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const nuevosArticulos = data.map((r) => ({
      codigo: r.CODIGO || r.COD || "",
      descripcion: r.DESCRIPCION || r.DESCRIP || "",
      precio: parseFloat(r.PRECIO || r.PREC || 0),
      stock: r.STOCK || r.CANTIDAD || null,
      rubro: r.RUBRO || "",
      marca: r.MARCA || "",
      lista: r.LISTA || "",
      equivalente:
        r.EQUIVALENTE ||
        r.EQUIVALENC ||
        r.equivalenc ||
        r[" EQUIVALENTE"] ||
        r["EQUIVALENTE "] ||
        "",
    }));

    console.log(
      `🗂️ Procesando ${nuevosArticulos.length} artículos en lotes...`
    );

    // Insertar temporalmente
    const temp = mongoose.connection.collection("articulos_tmp");
    await temp.deleteMany({});
    const batchSize = 1000;
    for (let i = 0; i < nuevosArticulos.length; i += batchSize) {
      const batch = nuevosArticulos.slice(i, i + batchSize);
      await temp.insertMany(batch);
      console.log(
        `✅ Insertados ${Math.min(i + batchSize, nuevosArticulos.length)} / ${
          nuevosArticulos.length
        }`
      );
    }

    // Reemplazar colección antigua solo si todo fue exitoso
    await mongoose.connection
      .collection("articulos")
      .drop()
      .catch(() => {});
    await temp.rename("articulos");

    articulosCache = nuevosArticulos;

    await Status.updateOne(
      { _id: "status_articulos" },
      {
        $set: {
          fuente: "Okawa",
          ultima_actualizacion: fecha,
          estado: "OK",
          detalles: `Actualizado ${nuevosArticulos.length} artículos desde Okawa.`,
        },
      },
      { upsert: true }
    );

    console.log(
      `🎉 Base de datos actualizada con ${nuevosArticulos.length} artículos.`
    );
  } catch (err) {
    console.error("❌ Error al actualizar artículos:", err.message);

    await Status.updateOne(
      { _id: "status_articulos" },
      {
        $set: {
          fuente: "MongoDB (copia anterior)",
          ultima_actualizacion: fecha,
          estado: "ERROR",
          detalles: `Fallo al actualizar desde Okawa: ${err.message}`,
        },
      },
      { upsert: true }
    );
  } finally {
    isUpdating = false;
  }
}

// ⏰ Cron: actualización diaria a las 3:00 AM
cron.schedule(
  "0 3 * * *",
  async () => {
    console.log("🕒 Ejecutando actualización diaria (3 AM Argentina)...");
    await actualizarArticulos();
  },
  { timezone: "America/Argentina/Buenos_Aires" }
);

// 🔍 Endpoint principal con paginación y filtros
app.get("/articulos", async (req, res) => {
  const {
    page = 1,
    limit = 100,
    codigo,
    descripcion,
    disponibilidad,
  } = req.query;

  try {
    let resultados = articulosCache;

    if (!resultados.length) {
      resultados = await Articulo.find().lean();
      articulosCache = resultados;
      console.log(
        `📄 Cache cargada desde MongoDB (${resultados.length} artículos)`
      );
    }

    let filtrados = resultados;
    // 🔎 Filtro por código
    if (codigo) {
      const codigoStr = String(codigo).toUpperCase();
      filtrados = filtrados.filter((a) =>
        a.codigo?.toUpperCase().includes(codigoStr)
      );
    }

    if (descripcion) {
      const descStr = String(descripcion).toUpperCase();
      filtrados = filtrados.filter((a) =>
        a.descripcion?.toUpperCase().includes(descStr)
      );
    }

    if (disponibilidad) {
      const d = disponibilidad.toUpperCase();
      filtrados = filtrados.filter((a) => {
        const stockVal = a.stock?.toString().trim().toUpperCase();
        if (d === "S")
          return (
            (typeof a.stock === "number" && a.stock > 0) ||
            stockVal === "S" ||
            stockVal === "DISPONIBLE"
          );
        if (d === "N")
          return (
            a.stock === 0 ||
            stockVal === "N" ||
            stockVal === "NO DISPONIBLE" ||
            stockVal === "" ||
            stockVal === "0"
          );
        if (d === "C")
          return (
            stockVal === "C" ||
            stockVal === "CONSULTAR" ||
            stockVal === "CONSULTAR DISPONIBILIDAD"
          );
        return true;
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;

    res.json({
      ok: true,
      total: filtrados.length,
      page: pageNum,
      limit: limitNum,
      articulos: filtrados.slice(start, end),
    });
  } catch (err) {
    console.error("❌ Error en /articulos:", err.message);
    res.status(500).json({ ok: false, error: "Error interno del servidor" });
  }
});

// 🧾 Endpoint de estado
app.get("/status", async (req, res) => {
  const status = await Status.findOne({ _id: "status_articulos" }).lean();
  if (!status) return res.json({ estado: "Sin registros" });
  res.json(status);
});

// 🏓 Ping
app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

// 🚀 Inicialización del servidor
async function initServer() {
  try {
    const count = await Articulo.countDocuments();
    if (count === 0) {
      console.log("⚠️ No hay artículos. Descargando datos iniciales...");
      await actualizarArticulos();
    } else {
      articulosCache = await Articulo.find().lean();
      console.log(
        `🗂️ Cache inicial cargada (${articulosCache.length} artículos).`
      );
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
      console.log(`✅ Servidor activo en http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error al iniciar servidor:", err.message);
    process.exit(1);
  }
}

initServer();

// 🚨 Manejo de errores
process.on("unhandledRejection", (err) =>
  console.error("⚠️ Unhandled Rejection:", err)
);
process.on("uncaughtException", (err) =>
  console.error("⚠️ Uncaught Exception:", err)
);

// 🚀 Endpoint manual para forzar actualización
app.get("/actualizar", async (req, res) => {
  try {
    await actualizarArticulos();
    res.json({ ok: true, mensaje: "Actualización manual completada" });
  } catch (err) {
    console.error("❌ Error en actualización manual:", err.message);
    res.status(500).json({ ok: false, error: "Error al actualizar" });
  }
});

// 🔄 Cron para mantener la app activa (ping cada 7 min)
const BACKEND_URL =
  process.env.BACKEND_URL || "https://din-clientes.onrender.com";
cron.schedule("*/7 * * * *", async () => {
  try {
    await axios.get(`${BACKEND_URL}/ping`);
    console.log(`[${new Date().toLocaleTimeString()}] 🟢 Ping enviado`);
  } catch (err) {
    if (err.response?.status !== 429) {
      console.error(
        `[${new Date().toLocaleTimeString()}] 🔴 Error en ping:`,
        err.message
      );
    } else {
      console.log(
        `[${new Date().toLocaleTimeString()}] ⚠️ Ping rechazado (429)`
      );
    }
  }
});
