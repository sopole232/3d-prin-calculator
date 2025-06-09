// Este archivo mantiene compatibilidad con versiones anteriores
// La funcionalidad real está en storage.js

class Database {
    static async init() {
        console.warn('Database.init() está deprecado. Usa storageManager.init()');
        return storageManager.init();
    }

    static async save(data) {
        console.warn('Database.save() está deprecado. Usa storageManager.guardarTodo()');
        return storageManager.guardarTodo(data);
    }

    static async load() {
        console.warn('Database.load() está deprecado. Usa storageManager.cargarTodo()');
        return storageManager.cargarTodo();
    }

    static async clear() {
        console.warn('Database.clear() está deprecado. Usa storageManager.limpiarTodo()');
        return storageManager.limpiarTodo();
    }
}

// Para compatibilidad hacia atrás
window.Database = Database;
