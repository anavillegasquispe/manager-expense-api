// AVQ: casos de uso de Wallet (crear, listar y eliminar billeteras del usuario)
import WalletEntity, { WALLET_TYPES } from "../../domain/entities/wallet.entity.js";

export default class WalletService {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }

    async createWallet(data) {
        if (!data.name || !data.type) {
            throw new Error("Name and type are required");
        }
        if (!WALLET_TYPES.includes(data.type)) {
            throw new Error(`Invalid wallet type. Must be one of: ${WALLET_TYPES.join(", ")}`);
        }
        if (data.currency && !/^[A-Z]{3}$/.test(data.currency)) {
            throw new Error("Currency must be a 3-letter ISO code (e.g. BOB, USD)");
        }
        if (data.initialBalance !== undefined && isNaN(Number(data.initialBalance))) {
            throw new Error("Initial balance must be a number");
        }

        const wallet = new WalletEntity(data);
        return await this.walletRepository.save(wallet);
    }

    async getWallets(userId) {
        return await this.walletRepository.findByUserId(userId);
    }

    async deleteWallet(id, userId) {
        const wallet = await this.walletRepository.findById(id);
        if (!wallet) throw new Error("Wallet not found");
        if (wallet.userId !== userId) throw new Error("Unauthorized: You can only delete your own wallets");

        await this.walletRepository.delete(id);
        return { message: "Wallet deleted successfully" };
    }
}
