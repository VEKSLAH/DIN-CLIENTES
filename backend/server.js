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
  await mongoose.connect(MONGO_URI);
  console.log("✅ Conectado a MongoDB Atlas");
} catch (err) {
  console.error("❌ Error al conectar a MongoDB:", err.message);
  process.exit(1);
}

// 🧱 Esquema y modelo de artículo
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

// 🧠 Cache local y flag de actualización
let articulosCache = [];
let isUpdating = false;

// 📦 Función: descarga y actualiza artículos desde Okawa
async function actualizarArticulos() {
  if (isUpdating) {
    console.log(
      "⚠️ Ya hay una actualización en curso, se omite esta ejecución."
    );
    return;
  }

  isUpdating = true;

  try {
    console.log(
      `[${new Date().toLocaleString()}] 🔄 Descargando datos de Okawa...`
    );

    const url = "https://www.okawa.com.ar/tapice/datos/datos.zip";
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const zip = new AdmZip(response.data);
    const entry = zip.getEntry("okawa-completa.xls");

    if (!entry) {
      console.error(
        "❌ No se encontró el archivo okawa-completa.xls en el ZIP"
      );
      return;
    }

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

    await Articulo.deleteMany({});
    await Articulo.insertMany(nuevosArticulos);
    articulosCache = nuevosArticulos;

    console.log(
      `✅ Base de datos actualizada con ${nuevosArticulos.length} artículos`
    );
  } catch (err) {
    console.error("❌ Error al actualizar artículos:", err.message);
  } finally {
    isUpdating = false;
  }
}

// ⏰ Cron: ejecuta actualización diaria a las 3:00 AM
cron.schedule("0 3 * * *", async () => {
  console.log("🕒 Ejecutando actualización diaria (3 AM)...");
  await actualizarArticulos();
});

// 🔍 Endpoint principal con paginación y filtros
app.get("/articulos", async (req, res) => {
  const { page = 1, limit = 100, codigo, descripcion } = req.query;

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

// 🏓 Endpoint de ping para mantener la app despierta
app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

// 🚀 Inicialización del servidor
async function initServer() {
  try {
    const count = await Articulo.countDocuments();
    if (count === 0) {
      console.log(
        "⚠️ No hay artículos en la base. Descargando datos iniciales..."
      );
      await actualizarArticulos();
    } else {
      articulosCache = await Articulo.find().lean();
      console.log(
        `🗂️ Cache inicial cargada (${articulosCache.length} artículos)`
      );
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
      console.log(`✅ Servidor activo en http://localhost:${PORT}/articulos`)
    );
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err.message);
    process.exit(1);
  }
}

initServer();

// ⚠️ Manejadores globales de errores
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
    res.json({ ok: true, mensaje: "Artículos actualizados manualmente" });
  } catch (err) {
    console.error("❌ Error en actualización manual:", err.message);
    res.status(500).json({ ok: false, error: "Error al actualizar" });
  }
});

// 🔄 Cron interno para mantener la app despierta (ping cada 4 minutos)
const BACKEND_URL = process.env.BACKEND_URL || "https://din-clientes.onrender.com";
cron.schedule("*/4 * * * *", async () => {
  try {
    await axios.get(`${BACKEND_URL}/ping`);
    console.log(`[${new Date().toLocaleTimeString()}] 🟢 Ping enviado`);
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] 🔴 Error en ping:`, err.message);
  }
});
