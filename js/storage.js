class StorageManager {
    constructor() {
        this.useIndexedDB = false;
        this.dbName = 'PrinterAdmin3D';
        this.dbVersion = 1;
        this.storeName = 'data';
        this.lastSave = null;
    }

    async init() {
        console.log('💾 Inicializando StorageManager...');
        
        try {
            // Intentar inicializar IndexedDB
            await this.initIndexedDB();
            this.useIndexedDB = true;
            console.log('✅ IndexedDB inicializado correctamente');
        } catch (error) {
            console.warn('⚠️ IndexedDB no disponible, usando localStorage:', error.message);
            this.useIndexedDB = false;
        }
        
        // Configurar auto-guardado cada 30 segundos
        this.setupAutoSave();
        
        return this.useIndexedDB;
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                reject(new Error('Error abriendo IndexedDB'));
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });
    }

    setupAutoSave() {
        // Auto-guardado cada 30 segundos
        setInterval(() => {
            if (window.app && window.app.data && this.lastSave) {
                const ahora = Date.now();
                if (ahora - this.lastSave > 25000) { // 25 segundos desde último guardado
                    this.autoSave();
                }
            }
        }, 30000);
    }

    async autoSave() {
        if (window.app && window.app.data) {
            try {
                await this.guardarTodo(window.app.data);
                console.log('💾 Auto-guardado completado');
                this.updateStatusIndicator('success');
            } catch (error) {
                console.error('❌ Error en auto-guardado:', error);
                this.updateStatusIndicator('warning');
            }
        }
    }

    updateStatusIndicator(status) {
        const indicator = document.getElementById('dbStatus');
        if (indicator) {
            const timestamp = new Date().toLocaleTimeString('es-ES');
            switch (status) {
                case 'success':
                    indicator.textContent = `✅ Guardado ${timestamp}`;
                    indicator.className = 'db-status db-status-success';
                    break;
                case 'warning':
                    indicator.textContent = `⚠️ localStorage ${timestamp}`;
                    indicator.className = 'db-status db-status-warning';
                    break;
                case 'error':
                    indicator.textContent = `❌ Error ${timestamp}`;
                    indicator.className = 'db-status db-status-error';
                    break;
            }
        }
    }

    async guardarTodo(data) {
        this.lastSave = Date.now();
        
        try {
            if (this.useIndexedDB) {
                await this.saveToIndexedDB(data);
            } else {
                await this.guardarLocalStorage(data);
            }
            
            // Crear backup automático cada 5 minutos
            this.crearBackupAutomatico(data);
            
        } catch (error) {
            console.error('Error guardando datos:', error);
            // Fallback a localStorage
            await this.guardarLocalStorage(data);
            throw error;
        }
    }

    async saveToIndexedDB(data) {
        if (!this.db) throw new Error('IndexedDB no inicializado');
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const saveData = {
                id: 'appData',
                data: data,
                timestamp: Date.now()
            };
            
            const request = store.put(saveData);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Error guardando en IndexedDB'));
        });
    }

    async guardarLocalStorage(data) {
        try {
            const dataToSave = {
                ...data,
                timestamp: Date.now(),
                version: '2.0.0'
            };
            
            localStorage.setItem('printerAdmin3D', JSON.stringify(dataToSave));
            console.log('📁 Datos guardados en localStorage');
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            throw error;
        }
    }

    async cargarTodo() {
        try {
            let data = null;
            
            if (this.useIndexedDB) {
                data = await this.loadFromIndexedDB();
            }
            
            // Si no hay datos en IndexedDB o falla, cargar de localStorage
            if (!data) {
                data = this.cargarLocalStorage();
            }
            
            // Si no hay datos en ningún lado, usar datos por defecto
            if (!data) {
                data = this.getDefaultData();
            }
            
            // Asegurar estructura correcta
            return this.validateAndFixData(data);
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            return this.getDefaultData();
        }
    }

    async loadFromIndexedDB() {
        if (!this.db) return null;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get('appData');
            
            request.onsuccess = (event) => {
                const result = event.target.result;
                resolve(result ? result.data : null);
            };
            
            request.onerror = () => resolve(null);
        });
    }

    cargarLocalStorage() {
        try {
            const data = localStorage.getItem('printerAdmin3D');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error cargando de localStorage:', error);
            return null;
        }
    }

    getDefaultData() {
        return {
            filamentos: this.getDefaultFilaments(),
            perfilesCostos: [],
            historico: [],
            configuracion: this.getDefaultConfig(),
            perfilActivoId: null
        };
    }

    getDefaultFilaments() {
        return [
            {
                id: 1,
                nombre: "PLA Básico",
                tipo: "PLA",
                color: "Natural",
                peso: 1,
                precioTotal: 20,
                precioPorKg: 20,
                dificultad: 2,
                desgaste: 2,
                requiereSecado: false,
                urlCompra: "",
                fechaCreacion: new Date().toLocaleString('es-ES')
            }
        ];
    }

    getDefaultConfig() {
        return {
            gananciaPorDefecto: 30,
            redondeoPrecios: 0.01,
            tarifaOperadorDefecto: 15,
            formulasPersonalizadas: null,
            formulasFinales: null,
            materialesPersonalizados: null
        };
    }

    validateAndFixData(data) {
        // Asegurar que todas las propiedades existen
        const defaultData = this.getDefaultData();
        
        return {
            filamentos: Array.isArray(data.filamentos) ? data.filamentos : defaultData.filamentos,
            perfilesCostos: Array.isArray(data.perfilesCostos) ? data.perfilesCostos : [],
            historico: Array.isArray(data.historico) ? data.historico : [],
            configuracion: { ...defaultData.configuracion, ...data.configuracion },
            perfilActivoId: data.perfilActivoId || null
        };
    }

    crearBackupAutomatico(data) {
        try {
            const backups = JSON.parse(localStorage.getItem('printerAdmin3D_backups') || '[]');
            const backup = {
                fecha: new Date().toISOString(),
                data: data,
                size: JSON.stringify(data).length
            };
            
            backups.unshift(backup);
            
            // Mantener solo los últimos 5 backups
            if (backups.length > 5) {
                backups.splice(5);
            }
            
            localStorage.setItem('printerAdmin3D_backups', JSON.stringify(backups));
            console.log('📦 Backup automático creado');
            
        } catch (error) {
            console.error('Error creando backup automático:', error);
        }
    }

    getBackupInfo() {
        try {
            const backups = JSON.parse(localStorage.getItem('printerAdmin3D_backups') || '[]');
            if (backups.length > 0) {
                const ultimo = backups[0];
                return {
                    exists: true,
                    date: new Date(ultimo.fecha).toLocaleString('es-ES'),
                    size: `${Math.round(ultimo.size / 1024)} KB`,
                    count: backups.length
                };
            }
        } catch (error) {
            console.error('Error obteniendo info de backup:', error);
        }
        
        return { exists: false };
    }

    exportarBackupManual() {
        try {
            const data = this.cargarLocalStorage() || this.getDefaultData();
            data.exportDate = new Date().toISOString();
            data.exportType = 'manual';
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_printer_admin_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📤 Backup manual exportado');
            
        } catch (error) {
            console.error('Error exportando backup manual:', error);
            throw error;
        }
    }

    async limpiarTodo() {
        try {
            // Limpiar IndexedDB
            if (this.useIndexedDB && this.db) {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                await new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(new Error('Error limpiando IndexedDB'));
                });
            }
            
            // Limpiar localStorage
            localStorage.removeItem('printerAdmin3D');
            localStorage.removeItem('printerAdmin3D_backups');
            
            console.log('🗑️ Todos los datos eliminados');
            
        } catch (error) {
            console.error('Error limpiando datos:', error);
            throw error;
        }
    }
}

// Instancia global
const storageManager = new StorageManager();
window.storageManager = storageManager;
