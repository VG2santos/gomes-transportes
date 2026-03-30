const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("frontend"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.post("/viagem", async (req,res)=>{
 const v = req.body;
 const pendente = (Number(v.valor_frete)||0) - (Number(v.valor_recebido)||0);

 await pool.query(
`INSERT INTO viagens
(data,caminhao,numero_carga,cliente,origem,destino,distancia_km,
hora_carga,hora_descarga,valor_frete,valor_recebido,valor_pendente,data_receber,status)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
[
v.data,
v.caminhao,
v.numero_carga,
v.cliente,
v.origem,
v.destino,
v.distancia_km,
v.hora_carga,
v.hora_descarga,
v.valor_frete,
v.valor_recebido,
pendente,
v.data_receber,
v.status
]);

 res.json({ok:true});
});

app.get("/dashboard", async(req,res)=>{
 const total = await pool.query("SELECT SUM(valor_frete) as total FROM viagens");
 const recebido = await pool.query("SELECT SUM(valor_recebido) as recebido FROM viagens");
 const pendente = await pool.query("SELECT SUM(valor_pendente) as pendente FROM viagens");
 const cargas = await pool.query("SELECT COUNT(*) FROM viagens");

 res.json({
  faturamento: total.rows[0].total || 0,
  recebido: recebido.rows[0].recebido || 0,
  pendente: pendente.rows[0].pendente || 0,
  total_cargas: cargas.rows[0].count
 });
});

app.listen(3000, ()=> console.log("Rodando..."));
