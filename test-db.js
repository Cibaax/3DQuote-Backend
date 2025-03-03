import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Necesario en Supabase
});

client.connect()
  .then(() => console.log("✅ Conexión exitosa a Supabase"))
  .catch(err => console.error("❌ Error de conexión:", err))
  .finally(() => client.end());
