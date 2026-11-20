export class IUserRepository {
    async create(userEntity) {
        throw new Error('Método no implementado');
    }  
    async findById(id) {
        throw new Error('Método no implementado');
    }
    async findByEmail(email) {
        throw new Error('Método no implementado');
    }
    async updateBaseCurrency(id, baseCurrency) {
        throw new Error('Método no implementado');
    }
}