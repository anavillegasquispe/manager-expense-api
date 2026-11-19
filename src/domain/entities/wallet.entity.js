// AVQ: entidad Wallet (billetera o cuenta financiera del usuario)
export const WALLET_TYPES = ["EFECTIVO", "BANCO", "TARJETA_DEBITO", "TARJETA_CREDITO", "OTRO"];

export default class WalletEntity {
    constructor({ id, name, type, currency, initialBalance, description, userId }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.currency = currency || "BOB";
        this.initialBalance = initialBalance ?? 0;
        this.description = description || null;
        this.userId = userId;
    }
}
