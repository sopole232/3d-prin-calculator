// Extensión del StorageManager para soportar múltiples usuarios
class UserStorageManager extends StorageManager {
    constructor() {
        super();
        this.userPrefix = '';
        this.useCloudSync = false; // Flag para usar sincronización en la nube
        this.cloudSyncEnabled = false;
    }

    // Inicializar con soporte para Firebase
    async init() {
        await super.init();
        
        // Intentar inicializar Firebase si está disponible
        if (window.firebaseStorage) {
            try {
                this.cloudSyncEnabled = await window.firebaseStorage.init();
                if (this.cloudSyncEnabled) {
                    console.log('☁️ Sincronización en la nube habilitada');
                }
            } catch (error) {
                console.warn('⚠️ No se pudo inicializar sincronización en la nube:', error);
            }
        }
        
        return this.useIndexedDB;
    }

    // Actualizar prefijo de usuario
    updateUserPrefix() {
        if (authManager && authManager.isLoggedIn()) {
            const user = authManager.getCurrentUser();
            this.userPrefix = `_user_${user.username}`;
        } else {
            this.userPrefix = '';
        }
    }

    // Obtener clave de almacenamiento con prefijo de usuario
    getUserKey(baseKey) {
        this.updateUserPrefix();
        return baseKey + this.userPrefix;
    }

    // Override del método de guardado para incluir usuario y Firebase
    async guardarTodo(data) {
        this.lastSave = Date.now();
        
        try {
            // Guardar localmente primero
            if (this.useIndexedDB) {
                await this.saveToIndexedDBUser(data);
            } else {
                await this.guardarLocalStorageUser(data);
            }
            
            // Sincronizar con Firebase si está habilitado
            if (this.cloudSyncEnabled && window.firebaseStorage && window.firebaseStorage.user) {
                try {
                    await window.firebaseStorage.saveUserData(data);
                    console.log('☁️ Datos sincronizados con la nube');
                } catch (error) {
                    console.warn('⚠️ Error sincronizando con la nube:', error);
                }
            }
            
            // Crear backup automático por usuario
            this.crearBackupAutomaticoUser(data);
            
        } catch (error) {
            console.error('Error guardando datos del usuario:', error);
            // Fallback a localStorage
            await this.guardarLocalStorageUser(data);
            throw error;
        }
    }

    // Guardar en localStorage con prefijo de usuario
    async guardarLocalStorageUser(data) {
        try {
            const dataToSave = {
                ...data,
                timestamp: Date.now(),
                version: '2.0.0',
                user: authManager.isLoggedIn() ? authManager.getCurrentUser().username : 'anonymous'
            };
            
            const key = this.getUserKey('printerAdmin3D');
            localStorage.setItem(key, JSON.stringify(dataToSave));
            console.log('📁 Datos guardados para usuario:', authManager.getCurrentUser()?.username || 'anonymous');
        } catch (error) {
            console.error('Error guardando en localStorage para usuario:', error);
            throw error;
        }
    }

    // Guardar en IndexedDB con prefijo de usuario  
    async saveToIndexedDBUser(data) {
        if (!this.db) throw new Error('IndexedDB no inicializado');
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const saveData = {
                id: this.getUserKey('appData'),
                data: data,
                timestamp: Date.now(),
                user: authManager.isLoggedIn() ? authManager.getCurrentUser().username : 'anonymous'
            };
            
            const request = store.put(saveData);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Error guardando en IndexedDB para usuario'));
        });
    }

    // Override del método de carga para incluir usuario y Firebase
    async cargarTodo() {
        try {
            let data = null;
            
            // Si Firebase está habilitado, sincronizar primero
            if (this.cloudSyncEnabled && window.firebaseStorage && window.firebaseStorage.user) {
                try {
                    // Cargar datos locales
                    let localData = null;
                    if (this.useIndexedDB) {
                        localData = await this.loadFromIndexedDBUser();
                    } else {
                        localData = this.cargarLocalStorageUser();
                    }
                    
                    // Sincronizar con Firebase
                    data = await window.firebaseStorage.syncWithLocal(localData || this.getDefaultData());
                    
                    // Guardar datos sincronizados localmente
                    if (data && data !== localData) {
                        await this.guardarLocalStorageUser(data);
                    }
                    
                } catch (error) {
                    console.warn('⚠️ Error sincronizando con Firebase, usando datos locales:', error);
                    data = null;
                }
            }
            
            // Si no hay datos de Firebase, cargar localmente
            if (!data) {
                if (this.useIndexedDB) {
                    data = await this.loadFromIndexedDBUser();
                }
                
                if (!data) {
                    data = this.cargarLocalStorageUser();
                }
            }
            
            // Si no hay datos específicos del usuario, intentar migrar datos generales
            if (!data && authManager.isLoggedIn()) {
                console.log('🔄 Intentando migrar datos existentes...');
                data = this.migrateUserData();
            }
            
            // Si aún no hay datos, usar datos por defecto
            if (!data) {
                data = this.getDefaultData();
            }
            
            // Asegurar estructura correcta
            return this.validateAndFixData(data);
            
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
            return this.getDefaultData();
        }
    }

    // Cargar desde localStorage con prefijo de usuario
    cargarLocalStorageUser() {
        try {
            const key = this.getUserKey('printerAdmin3D');
            const data = localStorage.getItem(key);
            
            if (data) {
                const parsed = JSON.parse(data);
                console.log('📊 Datos cargados para usuario:', authManager.getCurrentUser()?.username || 'anonymous');
                return parsed;
            }
            
            return null;
        } catch (error) {
            console.error('Error cargando de localStorage para usuario:', error);
            return null;
        }
    }

    // Cargar desde IndexedDB con prefijo de usuario
    async loadFromIndexedDBUser() {
        if (!this.db) return null;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const key = this.getUserKey('appData');
            const request = store.get(key);
            
            request.onsuccess = (event) => {
                const result = event.target.result;
                resolve(result ? result.data : null);
            };
            
            request.onerror = () => resolve(null);
        });
    }

    // Migrar datos existentes al usuario actual
    migrateUserData() {
        try {
            // Intentar cargar datos sin prefijo de usuario (datos antiguos)
            const oldData = localStorage.getItem('printerAdmin3D');
            if (oldData) {
                const parsed = JSON.parse(oldData);
                console.log('📦 Migrando datos existentes al usuario:', authManager.getCurrentUser().username);
                
                // Guardar los datos bajo la clave del usuario
                this.guardarLocalStorageUser(parsed);
                
                return parsed;
            }
        } catch (error) {
            console.error('Error migrando datos de usuario:', error);
        }
        
        return null;
    }

    // Crear backup automático por usuario
    crearBackupAutomaticoUser(data) {
        try {
            const backupKey = this.getUserKey('printerAdmin3D_backups');
            const backups = JSON.parse(localStorage.getItem(backupKey) || '[]');
            
            const backup = {
                fecha: new Date().toISOString(),
                data: data,
                size: JSON.stringify(data).length,
                user: authManager.isLoggedIn() ? authManager.getCurrentUser().username : 'anonymous'
            };
            
            backups.unshift(backup);
            
            // Mantener solo los últimos 5 backups por usuario
            if (backups.length > 5) {
                backups.splice(5);
            }
            
            localStorage.setItem(backupKey, JSON.stringify(backups));
            console.log('📦 Backup automático creado para usuario:', backup.user);
            
        } catch (error) {
            console.error('Error creando backup automático para usuario:', error);
        }
    }

    // Obtener información de backup por usuario
    getBackupInfoUser() {
        try {
            const backupKey = this.getUserKey('printerAdmin3D_backups');
            const backups = JSON.parse(localStorage.getItem(backupKey) || '[]');
            
            if (backups.length > 0) {
                const ultimo = backups[0];
                return {
                    exists: true,
                    date: new Date(ultimo.fecha).toLocaleString('es-ES'),
                    size: `${Math.round(ultimo.size / 1024)} KB`,
                    count: backups.length,
                    user: ultimo.user
                };
            }
        } catch (error) {
            console.error('Error obteniendo info de backup para usuario:', error);
        }
        
        return { exists: false };
    }

    // Exportar backup manual por usuario
    exportarBackupManualUser() {
        try {
            const data = this.cargarLocalStorageUser() || this.getDefaultData();
            data.exportDate = new Date().toISOString();
            data.exportType = 'manual';
            data.exportUser = authManager.isLoggedIn() ? authManager.getCurrentUser().username : 'anonymous';
            
            const username = authManager.getCurrentUser()?.username || 'anonymous';
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_printer_${username}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📤 Backup manual exportado para usuario:', username);
            
        } catch (error) {
            console.error('Error exportando backup manual para usuario:', error);
            throw error;
        }
    }

    // Limpiar datos específicos del usuario
    async limpiarTodoUser() {
        try {
            this.updateUserPrefix();
            
            // Limpiar IndexedDB para el usuario
            if (this.useIndexedDB && this.db) {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const key = this.getUserKey('appData');
                
                await new Promise((resolve, reject) => {
                    const request = store.delete(key);
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(new Error('Error limpiando IndexedDB del usuario'));
                });
            }
            
            // Limpiar localStorage para el usuario
            const dataKey = this.getUserKey('printerAdmin3D');
            const backupKey = this.getUserKey('printerAdmin3D_backups');
            
            localStorage.removeItem(dataKey);
            localStorage.removeItem(backupKey);
            
            const username = authManager.getCurrentUser()?.username || 'anonymous';
            console.log('🗑️ Datos eliminados para usuario:', username);
            
        } catch (error) {
            console.error('Error limpiando datos del usuario:', error);
            throw error;
        }
    }

    // Obtener estadísticas de almacenamiento por usuario
    getUserStorageStats() {
        try {
            const dataKey = this.getUserKey('printerAdmin3D');
            const backupKey = this.getUserKey('printerAdmin3D_backups');
            
            const data = localStorage.getItem(dataKey);
            const backups = localStorage.getItem(backupKey);
            
            const dataSize = data ? JSON.stringify(JSON.parse(data)).length : 0;
            const backupSize = backups ? JSON.stringify(JSON.parse(backups)).length : 0;
            
            return {
                user: authManager.getCurrentUser()?.username || 'anonymous',
                dataSize: `${Math.round(dataSize / 1024)} KB`,
                backupSize: `${Math.round(backupSize / 1024)} KB`,
                totalSize: `${Math.round((dataSize + backupSize) / 1024)} KB`,
                hasData: dataSize > 0,
                hasBackups: backupSize > 0
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas de almacenamiento:', error);
            return null;
        }
    }
}
