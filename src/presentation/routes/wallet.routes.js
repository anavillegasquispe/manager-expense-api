// AVQ: rutas de Wallet (billeteras o cuentas financieras)
import { Router } from "express";
import WalletController from "../controllers/wallet.controller.js";
import WalletService from "../../application/use-cases/wallet.service.js";
import WalletMySQLRepository from "../../infrastructure/database/mysql/wallet.mysql.repository.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

// Inyección de dependencias
const walletRepository = new WalletMySQLRepository();
const walletService = new WalletService(walletRepository);
const walletController = new WalletController(walletService);

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Wallet:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Banco Nacional"
 *         type:
 *           type: string
 *           enum: [CASH, BANK, DEBIT_CARD, CREDIT_CARD, OTHER]
 *           example: "BANK"
 *         currency:
 *           type: string
 *           example: "BOB"
 *         initialBalance:
 *           type: string
 *           example: "1500.00"
 *         description:
 *           type: string
 *           example: "Cuenta de ahorro"
 *         userId:
 *           type: string
 *           example: "6afbae07af94de4190a22c4a"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /wallets:
 *   get:
 *     summary: Listar las billeteras o cuentas del usuario autenticado
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de billeteras del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Wallet'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/", authMiddleware, walletController.getWallets);

/**
 * @swagger
 * /wallets:
 *   post:
 *     summary: Crear una billetera o cuenta (efectivo, banco, tarjeta de débito...)
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Banco Nacional"
 *               type:
 *                 type: string
 *                 enum: [CASH, BANK, DEBIT_CARD, CREDIT_CARD, OTHER]
 *                 example: "BANK"
 *               currency:
 *                 type: string
 *                 example: "BOB"
 *               initialBalance:
 *                 type: number
 *                 example: 1500
 *               description:
 *                 type: string
 *                 example: "Cuenta de ahorro"
 *     responses:
 *       201:
 *         description: Billetera creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Datos inválidos (nombre o tipo faltante, tipo o moneda inválidos)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post("/", authMiddleware, walletController.createWallet);

/**
 * @swagger
 * /wallets/{id}:
 *   delete:
 *     summary: Eliminar una billetera propia
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Billetera eliminada
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: La billetera pertenece a otro usuario
 *       404:
 *         description: Billetera no encontrada
 */
router.delete("/:id", authMiddleware, walletController.deleteWallet);

export default router;
