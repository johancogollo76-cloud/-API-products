import jwt from "jsonwebtoken";

export function verificarToken(req, res, next) {
    const header = req.headers.authorization ?? "";
    const [tipo, token] = header.split(" ");

    if (tipo !== "Bearer" || !token) {
        return res.status(401).json({ error: "Falta el token" });
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o vencido" });
    }
}

export function soloAdmin(req, res, next) {
    if (req.usuario.rol !== "admin") {
        return res.status(403).json({ error: "Solo administradores" });
    }
    next();
}