import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

const { Pool } = pkg;
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

app.get("/api/models", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM models");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener modelos:", error);
    res.status(500).json({ message: "Error en el servidor al obtener modelos" });
  }
});

// Adaptación para Serverless Functions en Vercel
import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req, res) {
  return app(req, res);
}
