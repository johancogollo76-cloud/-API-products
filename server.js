import express from "express";
import { db } from "./db.js";
import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  {verificarToken, soloAdmin} from "./middlewares.js";

const app = express();
app.set("json spaces", 2);
app.use(express.json());

// GET /productos  (opcional: ?max=50000)
app.get("/productos", async function (req, res) {
    try {
        const max = req.query.max;

        if (max === undefined) {
            const resultado = await db.query("SELECT * FROM productos");
            return res.status(200).json(resultado[0]);
        }

        if (isNaN(Number(max))) {
            return res.status(400).json({ error: "max debe ser un número" });
        }

        const resultado = await db.query(
            "SELECT * FROM productos WHERE precio <= ?",
            [Number(max)]
        );
        res.status(200).json(resultado[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// GET /productos/:id
app.get("/productos/:id", async function (req, res) {
    try {
        const id = Number(req.params.id);

        const resultado = await db.query(
            "SELECT * FROM productos WHERE id = ?",
            [id]
        );
        const filas = resultado[0];

        if (filas.length === 0) {
            return res.status(404).json({ error: "No existe" });
        }
        res.status(200).json(filas[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});
// POST /registro
app.post("/registro", async function (req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;
        if (!email || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }
        const existe = await db.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );
        if (existe[0].length > 0) {
            return res.status(409).json({ error: "El email ya está registrado" });
        }
        const hash = await bcrypt.hash(password, 10);
        const resultado = await db.query(
            "INSERT INTO usuarios (email, password_hash) VALUES (?, ?)",
            [email, hash]
        );
        res.status(201).json({ id: resultado[0].insertId, email: email, rol: "usuario" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// POST /login
app.post("/login", async function (req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;
        if (!email || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }
        const resultado = await db.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );
        const filas = resultado[0];
        if (filas.length === 0) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }
        const usuario = filas[0];
        const coincide = await bcrypt.compare(password, usuario.password_hash);
        if (!coincide) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ token: token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});



// POST /productos
app.post("/productos", verificarToken, async function (req, res) {
    try {
        const nombre = req.body.nombre;
        const precio = req.body.precio;

        if (!nombre || typeof precio !== "number" || precio < 0) {
            return res.status(400).json({ error: "Faltan datos o no son válidos" });
        }

        const resultado = await db.query(
            "INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, 0)",
            [nombre, precio]
        );

        const nuevo = {
            id: resultado[0].insertId,
            nombre: nombre,
            precio: precio,
            stock: 0
        };
        res.status(201).json(nuevo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});



// PUT /productos/:id  (reemplaza todo el producto)
app.put("/productos/:id", verificarToken, async function (req, res) {
    try {
        const id = Number(req.params.id);
        const nombre = req.body.nombre;
        const precio = req.body.precio;
        const stock = req.body.stock;

        const existe = await db.query(
            "SELECT * FROM productos WHERE id = ?",
            [id]
        );
        if (existe[0].length === 0) {
            return res.status(404).json({ error: "No existe" });
        }

        if (!nombre || typeof precio !== "number" || precio < 0 || typeof stock !== "number" || stock < 0) {
            return res.status(400).json({ error: "Faltan datos o no son válidos" });
        }

        await db.query(
            "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?",
            [nombre, precio, stock, id]
        );

        res.status(200).json({ id: id, nombre: nombre, precio: precio, stock: stock });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// PATCH /productos/:id  (cambia solo los campos enviados)
app.patch("/productos/:id", verificarToken, async function (req, res) {
    try {
        const id = Number(req.params.id);
        const nombre = req.body.nombre;
        const precio = req.body.precio;
        const stock = req.body.stock;

        const existe = await db.query(
            "SELECT * FROM productos WHERE id = ?",
            [id]
        );
        if (existe[0].length === 0) {
            return res.status(404).json({ error: "No existe" });
        }

        if (nombre === undefined && precio === undefined && stock === undefined) {
            return res.status(400).json({ error: "No enviaste ningún campo" });
        }
        if (nombre !== undefined && !nombre) {
            return res.status(400).json({ error: "Nombre no válido" });
        }
        if (precio !== undefined && (typeof precio !== "number" || precio < 0)) {
            return res.status(400).json({ error: "Precio no válido" });
        }
        if (stock !== undefined && (typeof stock !== "number" || stock < 0)) {
            return res.status(400).json({ error: "Stock no válido" });
        }

        // Partimos del producto que ya existe y cambiamos lo que llegó
        const producto = existe[0][0];
        if (nombre !== undefined) {
            producto.nombre = nombre;
        }
        if (precio !== undefined) {
            producto.precio = precio;
        }
        if (stock !== undefined) {
            producto.stock = stock;
        }

        await db.query(
            "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?",
            [producto.nombre, producto.precio, producto.stock, id]
        );

        res.status(200).json(producto);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// DELETE /productos/:id
app.delete("/productos/:id", verificarToken,soloAdmin, async function (req, res) {
    try {
        const id = Number(req.params.id);

        const resultado = await db.query(
            "DELETE FROM productos WHERE id = ?",
            [id]
        );

        if (resultado[0].affectedRows === 0) {
            return res.status(404).json({ error: "No existe" });
        }
        res.status(204).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});



app.listen(3000, function () {
    console.log("Servidor listo");
});
