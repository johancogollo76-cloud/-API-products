import { db } from "./db.js";
import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const authrouter = express.Router();

// POST /registro
authrouter.post("/registro", async function (req, res) {
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
authrouter.post("/login", async function (req, res) {
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
