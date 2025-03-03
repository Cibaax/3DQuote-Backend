import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pkg;

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false } // Necesario para conexiones seguras con Supabase
});

client.connect()
  .then(() => {
    console.log("✅ Conexión exitosa a Supabase");
    return client.end();
  })
  .catch(err => {
    console.error("❌ Error de conexión:", err);
  });
