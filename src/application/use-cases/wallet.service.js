// AVQ: casos de uso de Wallet (crear, listar y eliminar billeteras del usuario)
import WalletEntity, { WALLET_TYPES } from "../../domain/entities/wallet.entity.js";

export default class WalletService {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }

    async createWallet(data) {
        if (!data.name || !data.type) {
            throw new Error("El nombre y el tipo son obligatorios");
        }
        if (!WALLET_TYPES.includes(data.type)) {
            throw new Error(`Tipo de billetera inválido. Debe ser uno de: ${WALLET_TYPES.join(", ")}`);
        }
        if (data.currency && !/^[A-Z]{3}$/.test(data.currency)) {
            throw new Error("La moneda debe ser un código ISO de 3 letras (ej. BOB, USD)");
        }
        if (data.initialBalance !== undefined && isNaN(Number(data.initialBalance))) {
            throw new Error("El saldo inicial debe ser un número");
        }

        const wallet = new WalletEntity(data);
        return await this.walletRepository.save(wallet);
    }

    async getWallets(userId) {
        return await this.walletRepository.findByUserId(userId);
    }

    async deleteWallet(id, userId) {
        const wallet = await this.walletRepository.findById(id);
        if (!wallet) throw new Error("Billetera no encontrada");
        if (wallet.userId !== userId) throw new Error("No autorizado: solo puedes eliminar tus propias billeteras");

        await this.walletRepository.delete(id);
        return { message: "Billetera eliminada correctamente" };
    }
}
