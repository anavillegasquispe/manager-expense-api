import CategoryEntity from "../../domain/entities/category.entity.js";

export default class CategoryService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    async createCategory(data) {
        if (!data.name || !data.type) {
            throw new Error("El nombre y el tipo (INCOME o EXPENSE) son obligatorios");
        }
        if (!["INCOME", "EXPENSE"].includes(data.type)) {
            throw new Error("Tipo de categoría inválido. Debe ser INCOME o EXPENSE");
        }

        const category = new CategoryEntity(data);
        return await this.categoryRepository.save(category);
    }

    async getCategories(userId) {
        return await this.categoryRepository.findByUserIdOrDefault(userId);
    }

    async updateCategory(id, data, userId) {
        const category = await this.categoryRepository.findById(id);
        if (!category) throw new Error("Categoría no encontrada");
        if (category.isDefault) throw new Error("No se puede modificar una categoría predeterminada del sistema");
        if (category.userId !== userId) throw new Error("No autorizado: solo puedes modificar tus propias categorías");

        return await this.categoryRepository.update(id, data);
    }

    async deleteCategory(id, userId) {
        const category = await this.categoryRepository.findById(id);
        if (!category) throw new Error("Categoría no encontrada");
        if (category.isDefault) throw new Error("No se puede eliminar una categoría predeterminada del sistema");
        if (category.userId !== userId) throw new Error("No autorizado: solo puedes eliminar tus propias categorías");

        await this.categoryRepository.delete(id);
        return { message: "Categoría eliminada correctamente" };
    }
}

