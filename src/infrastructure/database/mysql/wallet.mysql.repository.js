// AVQ: repositorio MySQL (Sequelize) para Wallet
import { DataTypes } from "sequelize";
import sequelize from "./connection.js";
import { WALLET_TYPES } from "../../../domain/entities/wallet.entity.js";

export const WalletModel = sequelize.define("Wallet", {
    name: { type: DataTypes.STRING(100), allowNull: false },
    type: { type: DataTypes.ENUM(...WALLET_TYPES), allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "BOB" },
    initialBalance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    description: { type: DataTypes.STRING },
    userId: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

export default class WalletMySQLRepository {
    async save(walletEntity) {
        const wallet = await WalletModel.create({
            name: walletEntity.name,
            type: walletEntity.type,
            currency: walletEntity.currency,
            initialBalance: walletEntity.initialBalance,
            description: walletEntity.description,
            userId: walletEntity.userId
        });
        return wallet.toJSON();
    }

    async findByUserId(userId) {
        return await WalletModel.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]]
        });
    }

    async findById(id) {
        const wallet = await WalletModel.findByPk(id);
        return wallet ? wallet.toJSON() : null;
    }

    async delete(id) {
        const wallet = await WalletModel.findByPk(id);
        if (!wallet) return null;
        await wallet.destroy();
        return true;
    }
}
