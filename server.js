const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static("public"));

const conexion = mysql.createConnection({
  host: "b5ib0hs8xofvoy3oxoop-mysql.services.clever-cloud.com",
  user: "ukdu8sdatn3ilynd",       
  password: "EXivM1Q4LGihxkbK9DUs",       
  database: "b5ib0hs8xofvoy3oxoop",
  port: 3306
});

conexion.connect((error) => {
  if (error) {
    console.error(" Error al conectar a MySQL:", error);
    return;
  }
  console.log(" Conectado al servidor MySQL");

  conexion.query("CREATE DATABASE IF NOT EXISTS ordenamilista", (err) => {
    if (err) {
      console.error(" Error al crear la base de datos:", err);
      return;
    }
    console.log(" Base de datos  verificada o creada.");

    conexion.changeUser({ database: "ordenamilista" }, (err2) => {
      if (err2) {
        console.error(" Error al seleccionar la base de datos:", err2);
        return;
      }

      const crearTabla = `
        CREATE TABLE IF NOT EXISTS items (
          id_item INT AUTO_INCREMENT PRIMARY KEY,
          id_lista INT,
          nombre_item VARCHAR(100),
          cantidad INT,
          comprado BOOLEAN DEFAULT 0
        );
      `;

      conexion.query(crearTabla, (err3) => {
        if (err3) {
          console.error(" Error al crear tabla:", err3);
        } else {
          console.log(" Tabla 'items' verificada o creada correctamente.");
        }
      });
    });
  });
});

app.get("/", (req, res) => {
  res.send("Servidor  funcionando ");
});

app.get("/items", (req, res) => {
  conexion.query("SELECT * FROM items", (error, resultados) => {
    if (error) {
      console.error("Error al obtener items:", error);
      res.status(500).json({ error: "Error al obtener los items" });
    } else {
      res.json(resultados);
    }
  });
});

app.post("/items", (req, res) => {
  const { nombre_item, cantidad } = req.body;
  const nuevoItem = { id_lista: 1, nombre_item, cantidad };

  conexion.query("INSERT INTO items SET ?", nuevoItem, (error, resultado) => {
    if (error) {
      console.error("Error al insertar item:", error);
      res.status(500).json({ error: "Error al insertar el item" });
    } else {
      res.json({ id: resultado.insertId, ...nuevoItem });
    }
  });
});

app.delete("/items/:id", (req, res) => {
  const id = req.params.id;
  conexion.query("DELETE FROM items WHERE id_item = ?", [id], (error) => {
    if (error) {
      console.error("Error al eliminar item:", error);
      res.status(500).json({ error: "Error al eliminar el item" });
    } else {
      res.json({ mensaje: "Item eliminado correctamente" });
    }
  });
});

app.listen(3000, () => {
  console.log(" Servidor iniciado en http://localhost:3000");
});

