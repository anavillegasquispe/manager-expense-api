import UserEntity from "../../domain/entities/user.entity.js";
import AuditEntity from "../../domain/entities/audit.entity.js";
import HashService from "../../infrastructure/security/hash.service.js";
import JwtService from "../../infrastructure/security/jwt.service.js";

export default class AuthService {
    constructor(userRepository, auditRepository = null) {
        this.userRepository = userRepository;
        this.auditRepository = auditRepository;
    }

    async register(data) {
        if (!data.name || !data.email || !data.password) {
            throw new Error("Name, email and password are required");
        }

        const exist = await this.userRepository.findByEmail(data.email);
        if (exist) {
            throw new Error("Email already in use");
        }

        data.password = await HashService.hash(data.password);
        // AVQ: el rol nunca se toma del body; todo registro público es "user"
        // (evita que cualquiera se registre como admin enviando role: "admin")
        const newUser = new UserEntity({ ...data, role: "user" });
        const savedUser = await this.userRepository.save(newUser);

        if (this.auditRepository && savedUser) {
            const userId = String(savedUser._id || savedUser.id || "new_user");
            await this.auditRepository.save(new AuditEntity({
                action: "REGISTER",
                entity: "USER",
                entityId: userId,
                details: { email: newUser.email, baseCurrency: newUser.baseCurrency },
                userId
            }));
        }

        return { message: "User registered successfully" };
    }

    // AVQ: crea el usuario administrador inicial desde variables de entorno (si no existe)
    async seedAdmin({ name = "Administrador", email, password }) {
        if (!email || !password) return;
        const exist = await this.userRepository.findByEmail(email);
        if (exist) return;
        const hashed = await HashService.hash(password);
        await this.userRepository.save(new UserEntity({ name, email, password: hashed, role: "admin" }));
        console.log(`Seeded admin user ${email}`);
    }

    async login({ email, password }) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isMatch = await HashService.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        const token = JwtService.generateToken({
            id: user._id || user.id,
            email: user.email,
            role: user.role,
            baseCurrency: user.baseCurrency || "BOB"
        });

        return { token };
    }
}

