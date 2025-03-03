import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Configuración SSL
  }
});

// Manejo de rutas
export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      if (req.url === "/api/models") {
        // Consulta para obtener todos los modelos
        const result = await pool.query("SELECT * FROM models");

        const models = result.rows.map(model => {
          const totalMinutes = parseInt(model.time, 10) || 0;
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;

          return {
            id: model.id,
            name: model.name,
            price: model.price,
            supports: model.supports,
            position: model.position,
            project_id: model.project_id,
            time: `${hours} h ${minutes} m`,
            weight: model.weight,
            model_path: model.model_path ? `data:model/stl;base64,${model.model_path}` : null,
            mirrored: model.mirrored
          };
        });

        return res.json(models);
      } else if (req.url.match(/\/api\/models\/\d+/)) {
        // Obtener un modelo por su id
        const id = req.url.split('/')[3]; // Captura el id
        const result = await pool.query("SELECT * FROM models WHERE id = $1", [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ message: "Modelo no encontrado" });
        }

        const model = result.rows[0];
        const totalMinutes = parseInt(model.time, 10) || 0;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        model.time = `${hours} h ${minutes} m`;

        return res.json(model);
      }
      // Otros endpoints GET pueden ser agregados aquí
    } else {
      res.status(405).json({ message: "Método no permitido" });
    }
  } catch (error) {
    console.error("Error en la conexión o consulta a la base de datos:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ message: "Error en el servidor. Verifique los registros para más detalles." });
  }
}
