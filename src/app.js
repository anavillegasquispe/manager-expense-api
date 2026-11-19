import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import morgan from 'morgan';
import { loggerMiddleware } from './presentation/middlewares/logger.middleware.js';
import { setupSwagger } from './infrastructure/config/swagger.config.js';

import authRoutes from './presentation/routes/auth.routes.js';
import currencyRoutes from './presentation/routes/currency.routes.js';
import categoryRoutes from './presentation/routes/category.routes.js';
import transactionRoutes from './presentation/routes/transaction.routes.js';
import budgetRoutes from './presentation/routes/budget.routes.js';
import reportRoutes from './presentation/routes/report.routes.js';
import walletRoutes from './presentation/routes/wallet.routes.js'; // AVQ

const app = express();

app.use(cors());
app.use(express.json());
setupSwagger(app);
app.use(loggerMiddleware);
app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/currencies', currencyRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/wallets', walletRoutes); // AVQ

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API de Gestor de Gastos activa' });
});

// Middleware de manejo de errores global
// AVQ: respeta el statusCode de los AppError (400, 401, 403, 404, 409) y devuelve 500 en errores no controlados
app.use((err, req, res, next) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({ error: err.message, code: err.code, details: err.details });
    }
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
