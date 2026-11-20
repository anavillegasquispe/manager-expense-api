import TransactionEntity from "../../domain/entities/transaction.entity.js";
import AuditEntity from "../../domain/entities/audit.entity.js";

export default class TransactionService {
    constructor(transactionRepository, currencyRepository, categoryRepository, budgetRepository = null, auditRepository = null, walletRepository = null) {
        this.transactionRepository = transactionRepository;
        this.currencyRepository = currencyRepository;
        this.categoryRepository = categoryRepository;
        this.budgetRepository = budgetRepository;
        this.auditRepository = auditRepository;
        this.walletRepository = walletRepository; // AVQ
    }

    // AVQ: valida que la billetera exista y pertenezca al usuario.
    // walletId es opcional: si no viene (undefined) o es null, no se valida.
    async validateWallet(walletId, userId) {
        if (walletId === undefined || walletId === null) return;
        if (!Number.isInteger(Number(walletId))) {
            throw new Error("walletId debe ser un número entero");
        }
        const wallet = await this.walletRepository.findById(walletId);
        if (!wallet) throw new Error("Billetera no encontrada");
        if (wallet.userId !== userId) {
            throw new Error("No autorizado: la billetera no pertenece al usuario");
        }
    }

    async createTransaction(data) {
        if (!data.type || !data.amount || !data.categoryId || !data.userId) {
            throw new Error("El tipo, el monto, categoryId y userId son obligatorios");
        }
        if (Number(data.amount) <= 0) {
            throw new Error("El monto debe ser mayor a cero");
        }

        const category = await this.categoryRepository.findById(data.categoryId);
        if (!category) {
            throw new Error("Categoría no encontrada");
        }
        if (category.type !== data.type) {
            throw new Error(`El tipo no coincide con la categoría: la categoría es de tipo ${category.type}`);
        }

        await this.validateWallet(data.walletId, data.userId); // AVQ

        const txDate = data.date || new Date().toISOString().split("T")[0];
        const currencyCode = (data.currency || "BOB").toUpperCase();

        const rateRecord = await this.currencyRepository.findByCodeAndDate(currencyCode, txDate);
        if (!rateRecord) {
            throw new Error(`No se encontró el tipo de cambio de ${currencyCode} para la fecha ${txDate}`);
        }

        const transaction = new TransactionEntity({
            ...data,
            currency: currencyCode,
            date: txDate,
            exchangeRate: rateRecord.exchangeRate,
            exchangeRateDate: rateRecord.date,
            currencyRateId: String(rateRecord._id || rateRecord.id)
        });

        const savedTransaction = await this.transactionRepository.save(transaction);

        if (this.auditRepository) {
            const audit = new AuditEntity({
                action: "CREATE_TRANSACTION",
                entity: "TRANSACTION",
                entityId: savedTransaction.id,
                details: savedTransaction,
                userId: data.userId
            });
            await this.auditRepository.save(audit);
        }

        let budgetAlert = null;
        if (transaction.type === "EXPENSE" && this.budgetRepository) {
            const [year, month] = txDate.split("-").map(Number);
            const budget = await this.budgetRepository.findByCategoryAndPeriod(
                data.userId,
                data.categoryId,
                month,
                year
            );
            if (budget) {
                const totalSpent = await this.transactionRepository.sumExpensesByCategoryAndMonth(
                    data.userId,
                    data.categoryId,
                    month,
                    year
                );
                budgetAlert = {
                    amountLimit: Number(budget.amountLimit),
                    totalSpent: Number(totalSpent),
                    exceeded: Number(totalSpent) > Number(budget.amountLimit)
                };
            }
        }

        return {
            ...savedTransaction,
            budgetAlert
        };
    }

    async getTransactionsByUserId(userId) {
        return await this.transactionRepository.findByUserId(userId);
    }

    async updateTransaction(id, data, userId) {
        const existing = await this.transactionRepository.findById(id);
        if (!existing) throw new Error("Transacción no encontrada");
        if (existing.userId !== userId) {
            throw new Error("No autorizado: solo puedes modificar tus propias transacciones");
        }

        // AVQ: permite asignar, cambiar o quitar (walletId: null) la billetera
        await this.validateWallet(data.walletId, userId);

        const txDate = data.date || existing.date;
        const currencyCode = (data.currency || existing.currency).toUpperCase();
        const amount = data.amount !== undefined ? Number(data.amount) : Number(existing.amount);

        const rateRecord = await this.currencyRepository.findByCodeAndDate(currencyCode, txDate);
        if (!rateRecord) {
            throw new Error(`No se encontró el tipo de cambio de ${currencyCode} para la fecha ${txDate}`);
        }

        const updatedPayload = {
            ...data,
            amount,
            currency: currencyCode,
            date: txDate,
            exchangeRate: rateRecord.exchangeRate,
            exchangeRateDate: rateRecord.date,
            currencyRateId: String(rateRecord._id || rateRecord.id),
            convertedAmount: Number((amount * Number(rateRecord.exchangeRate)).toFixed(2))
        };

        const updated = await this.transactionRepository.update(id, updatedPayload);

        if (this.auditRepository) {
            await this.auditRepository.save(new AuditEntity({
                action: "UPDATE_TRANSACTION",
                entity: "TRANSACTION",
                entityId: id,
                details: { previous: existing, updated },
                userId
            }));
        }

        return updated;
    }

    async deleteTransaction(id, userId) {
        const existing = await this.transactionRepository.findById(id);
        if (!existing) throw new Error("Transacción no encontrada");
        if (existing.userId !== userId) {
            throw new Error("No autorizado: solo puedes eliminar tus propias transacciones");
        }

        await this.transactionRepository.delete(id);

        if (this.auditRepository) {
            await this.auditRepository.save(new AuditEntity({
                action: "DELETE_TRANSACTION",
                entity: "TRANSACTION",
                entityId: id,
                details: existing,
                userId
            }));
        }

        return { message: "Transacción eliminada correctamente" };
    }
}

