// import express from "express";
// import axios from "axios";
// import AdmZip from "adm-zip";
// import XLSX from "xlsx";
// import cors from "cors";

// const app = express();

// app.use(cors());

// app.get("/articulos", async (req, res) => {
//   try {
//     const url = "https://www.okawa.com.ar/tapice/datos/datos.zip";
//     const response = await axios.get(url, { responseType: "arraybuffer" });

//     const zip = new AdmZip(response.data);
//     const entry = zip.getEntry("okawa-completa.xls"); // Excel con productos
//     if (!entry) return res.json({ ok: false, error: "No se encontró okawa-completa.xls" });

//     const fileBuffer = entry.getData();
//     const workbook = XLSX.read(fileBuffer, { type: "buffer" });

//     // Tomamos la primera hoja
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];

//     // Convertimos a JSON
//     const data = XLSX.utils.sheet_to_json(sheet);

//     // Mapear campos principales
// const articulos = data.map((r) => ({
//   codigo: r.CODIGO || r.COD || r.codigo || "",
//   descripcion: r.DESCRIPCION || r.DESCRIP || r.DES || r.descripcion || "",
//   precio: parseFloat(r.PRECIO || r.PREC || r.price || 0),
//   stock: parseInt(r.STOCK || r.CANTIDAD || 0),
//   rubro: r.RUBRO || "",
//   marca: r.MARCA || "",
//   lista: r.LISTA || "",
// }));


//     // res.json({ ok: true, cantidad: articulos.length, articulos: articulos.slice(0, 50) }); // primeros 50
//     res.json({ ok: true, cantidad: articulos.length, articulos });
//   } catch (err) {
//     res.json({ ok: false, error: err.message });
//   }
// });

// app.listen(3000, () => console.log("Servidor activo en http://localhost:3000/articulos"));


/////////// OK //////////////

// import express from "express";
// import axios from "axios";
// import AdmZip from "adm-zip";
// import XLSX from "xlsx";
// import cors from "cors";

// const app = express();
// app.use(cors());

// let articulosCache = []; // Cache de artículos en memoria

// // Función para descargar y procesar el ZIP
// async function actualizarArticulos() {
//   try {
//     console.log("Descargando ZIP de Okawa...");
//     const url = "https://www.okawa.com.ar/tapice/datos/datos.zip";
//     const response = await axios.get(url, { responseType: "arraybuffer" });

//     const zip = new AdmZip(response.data);
//     const entry = zip.getEntry("okawa-completa.xls");
//     if (!entry) {
//       console.error("No se encontró okawa-completa.xls en el ZIP");
//       return;
//     }

//     const fileBuffer = entry.getData();
//     const workbook = XLSX.read(fileBuffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(sheet);

//     articulosCache = data.map((r) => ({
//       codigo: r.CODIGO || r.COD || r.codigo || "",
//       descripcion: r.DESCRIPCION || r.DESCRIP || r.DES || r.descripcion || "",
//       precio: parseFloat(r.PRECIO || r.PREC || r.price || 0),
//       stock: r.STOCK || r.CANTIDAD || null,
//       rubro: r.RUBRO || "",
//       marca: r.MARCA || "",
//       lista: r.LISTA || "",
//       // Guardamos todos los demás campos por si hacen falta
//       ...r,
//     }));

//     console.log(`Artículos cargados en cache: ${articulosCache.length}`);
//   } catch (err) {
//     console.error("Error al actualizar artículos:", err.message);
//   }
// }

// // Actualizar al iniciar el servidor
// actualizarArticulos();

// // Actualizar cada 12 horas (12 * 60 * 60 * 1000 ms)
// setInterval(actualizarArticulos, 12 * 60 * 60 * 1000);

// // Endpoint con paginación y búsqueda por código
// app.get("/articulos", (req, res) => {
//   const { page = 1, limit = 100, codigo } = req.query;

//   let resultados = articulosCache;

//   // Filtrar por código si se envía
//   if (codigo) {
//     const codigoStr = String(codigo).toUpperCase();
//     resultados = resultados.filter((a) => a.codigo.toUpperCase().includes(codigoStr));
//   }

//   // Paginación
//   const pageNum = parseInt(page, 10);
//   const limitNum = parseInt(limit, 10);
//   const start = (pageNum - 1) * limitNum;
//   const end = start + limitNum;
//   const paginado = resultados.slice(start, end);

//   res.json({
//     ok: true,
//     total: resultados.length,
//     page: pageNum,
//     limit: limitNum,
//     articulos: paginado,
//   });
// });

// app.listen(3000, () => {
//   console.log("Servidor activo en http://localhost:3000/articulos");
// });


///////////////////// OK 2 //////////////////

import express from "express";
import axios from "axios";
import AdmZip from "adm-zip";
import XLSX from "xlsx";
import cors from "cors";

const app = express();
app.use(cors());

let articulosCache = []; // Cache de artículos en memoria

// Función para descargar y procesar el ZIP
async function actualizarArticulos() {
  try {
    console.log("Descargando ZIP de Okawa...");
    const url = "https://www.okawa.com.ar/tapice/datos/datos.zip";
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const zip = new AdmZip(response.data);
    const entry = zip.getEntry("okawa-completa.xls");
    if (!entry) {
      console.error("No se encontró okawa-completa.xls en el ZIP");
      return;
    }

    const fileBuffer = entry.getData();
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    articulosCache = data.map((r) => ({
      codigo: r.CODIGO || r.COD || r.codigo || "",
      descripcion: r.DESCRIPCION || r.DESCRIP || r.DES || r.descripcion || "",
      precio: parseFloat(r.PRECIO || r.PREC || r.price || 0),
      stock: r.STOCK || r.CANTIDAD || null,
      rubro: r.RUBRO || "",
      marca: r.MARCA || "",
      lista: r.LISTA || "",
      stock: r.STOCK || "",
      equivalente:
    r.EQUIVALENTE ||
    r.EQUIVALENC ||
    r.equivalenc ||
    r.Equivalente ||
    r.Equivalenc ||
    r[" EQUIVALENTE"] ||
    r["EQUIVALENTE "] ||
    "",
      ...r,
    }));

    console.log(`Artículos cargados en cache: ${articulosCache.length}`);
  } catch (err) {
    console.error("Error al actualizar artículos:", err.message);
  }
}

// Actualizar al iniciar el servidor
actualizarArticulos();

// Actualizar cada 12 horas
setInterval(actualizarArticulos, 12 * 60 * 60 * 1000);

// Endpoint con paginación y búsqueda por código y descripción
app.get("/articulos", (req, res) => {
  const { page = 1, limit = 100, codigo, descripcion } = req.query;

  let resultados = articulosCache;

  // Filtrar por código si se envía
  if (codigo) {
    const codigoStr = String(codigo).toUpperCase();
    resultados = resultados.filter((a) => a.codigo.toUpperCase().includes(codigoStr));
  }

  // Filtrar por descripción si se envía
  if (descripcion) {
    const descStr = String(descripcion).toUpperCase();
    resultados = resultados.filter((a) => a.descripcion.toUpperCase().includes(descStr));
  }

  // Paginación
  const pageNum = parseInt(String(page), 10);
  const limitNum = parseInt(String(limit), 10);
  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;
  const paginado = resultados.slice(start, end);

  res.json({
    ok: true,
    total: resultados.length,
    page: pageNum,
    limit: limitNum,
    articulos: paginado,
  });
});

app.listen(3000, () => {
  console.log("Servidor activo en http://localhost:3000/articulos");
});
