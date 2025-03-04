import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

const { Pool } = pkg;
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const formatTime = (totalMinutes) => {
  const minutes = parseInt(totalMinutes, 10) || 0;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} h ${remainingMinutes} m`;
};

app.get("/", (req, res) => {
  res.send("¡Servidor 3dQuote-backend corriendo correctamente!");
});

app.get("/models/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM models WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Modelo no encontrado" });
    }
    const model = result.rows[0];
    model.time = formatTime(model.time);
    res.json(model);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el modelo" });
  }
});

app.get("/models-preview", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM models_preview");

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener modelos de preview" });
  }
});


app.get("/projects", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener proyectos:", error.message);
    res.status(500).json({ message: "Error al obtener proyectos" });
  }
});

app.get("/models/project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM models WHERE project_id = $1 ORDER BY id ASC",
      [projectId]
    );

    const models = result.rows.map((model) => ({
      ...model,
      time: formatTime(model.time),
    }));
    res.json(models);
  } catch (error) {
    console.error("Error al obtener modelos por proyecto:", error.message);
    res.status(500).json({ message: "Error al obtener modelos por proyecto" });
  }
});

app.get("/project-summary/:id", async (req, res) => {
  const { id: projectId } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
          p.description,
          COALESCE(SUM(m.price), 0) AS total_price,
          COALESCE(SUM(m.time), 0) AS total_time,
          COALESCE(SUM(m.weight), 0) AS total_weight,
          COUNT(m.id) AS total_count
        FROM projects p
        LEFT JOIN models m ON p.id = m.project_id
        WHERE p.id = $1
        GROUP BY p.id`,
      [projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    const projectSummary = result.rows[0];
    projectSummary.total_time = formatTime(projectSummary.total_time);

    res.json(projectSummary);
  } catch (error) {
    console.error("Error en /project-summary:", error.message);
    res.status(500).json({ message: "Error al obtener el resumen del proyecto" });
  }
});

app.post("/models", async (req, res) => {
  const {
    name,
    price,
    supports,
    position,
    project_id,
    time,
    weight,
    model_path,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO models (name, price, supports, position, project_id, time, weight, model_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, price, supports, JSON.stringify(position), project_id, time, weight, model_path]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al insertar modelo:", error.message);
    res.status(500).json({ message: "Error al guardar el modelo" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
