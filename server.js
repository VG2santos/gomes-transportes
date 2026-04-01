const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("frontend"));

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized: false }
});

app.get("/", (req,res)=>{
 res.sendFile(__dirname + "/frontend/index.html");
});

app.post("/viagem", async (req,res)=>{
 try{
  const v = req.body;

  const pendente = (Number(v.valor_frete)||0) - (Number(v.valor_recebido)||0);

  await pool.query(
  `INSERT INTO viagens
  (data,caminhao,cliente,destino,valor_frete,valor_recebido,valor_pendente)
  VALUES ($1,$2,$3,$4,$5,$6,$7)`,
  [
   v.data,
   v.caminhao,
   v.cliente,
   v.destino,
   v.valor_frete,
   v.valor_recebido,
   pendente
  ]);

  res.json({ok:true});

 }catch(e){
  console.error(e);
  res.status(500).json({erro:"erro ao salvar"});
 }
});

app.get("/viagens", async (req,res)=>{
 try{
  const result = await pool.query("SELECT * FROM viagens ORDER BY id DESC");
  res.json(result.rows);
 }catch(e){
  console.error(e);
  res.status(500).json({erro:"erro ao buscar"});
 }
});

app.listen(3000, ()=>{
 console.log("Servidor rodando");
});
