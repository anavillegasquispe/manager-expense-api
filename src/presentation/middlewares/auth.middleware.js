import JwtService from "../../infrastructure/security/jwt.service.js";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Falta el encabezado Authorization o no es válido" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = JwtService.verifyToken(token);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};

