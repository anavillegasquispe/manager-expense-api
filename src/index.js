import app from './app.js';
import { connectMongo } from './infrastructure/database/mongo/connection.js';
import { connectMysql } from './infrastructure/database/mysql/connection.js';
import CurrencyMongoRepository from './infrastructure/database/mongo/currency.mongo.repository.js';
import CategoryMySQLRepository from './infrastructure/database/mysql/category.mysql.repository.js';
import UserMongoRepository from './infrastructure/database/mongo/user.mongo.repository.js';
import AuthService from './application/use-cases/auth.service.js';

await connectMongo();
await connectMysql();

// Ejecución de datos semilla para monedas (MongoDB) y categorías (MySQL)
const currencyRepo = new CurrencyMongoRepository();
const categoryRepo = new CategoryMySQLRepository();
await currencyRepo.seedCurrencies();
await categoryRepo.seedCategories();

// AVQ: usuario administrador inicial (ADMIN_EMAIL / ADMIN_PASSWORD en el .env)
const authService = new AuthService(new UserMongoRepository());
await authService.seedAdmin({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

