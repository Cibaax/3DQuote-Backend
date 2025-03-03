const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false } // A veces es necesario para Supabase
});

client.connect()
  .then(() => console.log("✅ Conexión exitosa a Supabase"))
  .catch(err => console.error("❌ Error de conexión:", err))
  .finally(() => client.end());
