// Funciones de sincronización rápida para el footer
// Sistema mejorado con autenticación automática y sincronización inteligente

class QuickSyncManager {
    constructor() {
        this.isInitialized = false;
        this.autoAuthAttempted = false;
        this.syncInProgress = false;
    }

    // Inicializar sistema de sincronización rápida
    async init() {
        try {
            // Intentar autenticación automática al inicio
            await this.attemptAutoAuth();
            this.updateButtonStates();
            this.isInitialized = true;
            console.log('✅ QuickSyncManager inicializado');
        } catch (error) {
            console.error('❌ Error inicializando QuickSyncManager:', error);
        }
    }

    // Intentar autenticación automática usando credenciales guardadas
    async attemptAutoAuth() {
        if (this.autoAuthAttempted) return;
        this.autoAuthAttempted = true;

        try {
            // Verificar si hay configuración de Firebase guardada
            const savedConfig = localStorage.getItem('firebaseConfig');
            const savedCredentials = localStorage.getItem('firebaseUserCredentials');
            
            if (!savedConfig || !savedCredentials) {
                console.log('ℹ️ No hay credenciales guardadas para auto-login');
                return false;
            }

            const config = JSON.parse(savedConfig);
            const credentials = JSON.parse(savedCredentials);

            // Inicializar Firebase si no está inicializado
            if (!window.firebaseStorage || !window.firebaseStorage.isInitialized) {
                if (window.cloudSyncManager) {
                    window.cloudSyncManager.firebaseConfig = config;
                    await window.cloudSyncManager.initializeFirebase();
                }
            }

            // Intentar login automático
            if (window.firebaseStorage && window.firebaseStorage.auth) {
                const result = await window.firebaseStorage.auth.signInWithEmailAndPassword(
                    credentials.email, 
                    credentials.password
                );
                
                if (result.user) {
                    window.firebaseStorage.user = result.user;
                    console.log('✅ Login automático exitoso:', credentials.email);
                    
                    // Actualizar estado en CloudSyncManager si existe
                    if (window.cloudSyncManager) {
                        window.cloudSyncManager.connectionStatus = 'authenticated';
                        window.cloudSyncManager.updateConnectionStatus();
                    }
                    
                    return true;
                }
            }
        } catch (error) {
            console.warn('⚠️ Error en login automático:', error);
            // Limpiar credenciales inválidas
            localStorage.removeItem('firebaseUserCredentials');
        }

        return false;
    }

    // Guardar credenciales para auto-login futuro
    saveCredentialsForAutoAuth(email, password) {
        try {
            const credentials = { email, password };
            localStorage.setItem('firebaseUserCredentials', JSON.stringify(credentials));
            console.log('💾 Credenciales guardadas para auto-login');
        } catch (error) {
            console.error('❌ Error guardando credenciales:', error);
        }
    }

    // Verificar si hay conexión a Firebase y usuario autenticado
    isFirebaseReady() {
        return window.firebaseStorage && 
               window.firebaseStorage.isInitialized && 
               window.firebaseStorage.user;
    }

    // Subir datos a la nube (función rápida)
    async uploadToCloud() {
        if (this.syncInProgress) {
            this.showToast('⏳ Sincronización en progreso...', 'warning');
            return;
        }

        try {
            this.syncInProgress = true;
            this.updateButtonStates();

            // Verificar conexión
            if (!this.isFirebaseReady()) {
                await this.promptForAuth('Para subir datos necesitas estar conectado a la nube.');
                return;
            }

            // Verificar que hay datos para subir
            if (!window.app || !window.app.data) {
                this.showToast('❌ No hay datos para subir', 'error');
                return;
            }

            this.showToast('⬆️ Subiendo datos...', 'info');

            // Subir datos
            const success = await window.firebaseStorage.saveUserData(window.app.data);
            
            if (success) {
                this.showToast('✅ Datos subidos a la nube', 'success');
            } else {
                this.showToast('❌ Error subiendo datos', 'error');
            }

        } catch (error) {
            console.error('Error subiendo a la nube:', error);
            this.showToast('❌ Error en la sincronización', 'error');
        } finally {
            this.syncInProgress = false;
            this.updateButtonStates();
        }
    }

    // Descargar datos de la nube (función rápida)
    async downloadFromCloud() {
        if (this.syncInProgress) {
            this.showToast('⏳ Sincronización en progreso...', 'warning');
            return;
        }

        try {
            this.syncInProgress = true;
            this.updateButtonStates();

            // Verificar conexión
            if (!this.isFirebaseReady()) {
                await this.promptForAuth('Para descargar datos necesitas estar conectado a la nube.');
                return;
            }

            this.showToast('⬇️ Descargando datos...', 'info');

            // Descargar datos
            const cloudData = await window.firebaseStorage.loadUserData();
            
            if (!cloudData) {
                this.showToast('ℹ️ No hay datos en la nube', 'info');
                return;
            }

            // Preguntar antes de reemplazar datos locales
            const confirmMessage = '¿Reemplazar datos locales con los de la nube?\n\n' +
                `Última actualización: ${cloudData.lastUpdated?.toDate?.()?.toLocaleString() || 'Desconocida'}`;
            
            if (!confirm(confirmMessage)) {
                this.showToast('❌ Descarga cancelada', 'warning');
                return;
            }

            // Actualizar datos locales
            Object.assign(window.app.data, cloudData);
            await window.storageManager.guardarTodo(window.app.data);
            window.app.updateAllDisplays();

            this.showToast('✅ Datos descargados desde la nube', 'success');

        } catch (error) {
            console.error('Error descargando de la nube:', error);
            this.showToast('❌ Error en la descarga', 'error');
        } finally {
            this.syncInProgress = false;
            this.updateButtonStates();
        }
    }

    // Sincronización inteligente bidireccional
    async smartSync() {
        if (this.syncInProgress) {
            this.showToast('⏳ Sincronización en progreso...', 'warning');
            return;
        }

        try {
            this.syncInProgress = true;
            this.updateButtonStates();

            // Verificar conexión
            if (!this.isFirebaseReady()) {
                await this.promptForAuth('Para sincronizar necesitas estar conectado a la nube.');
                return;
            }

            this.showToast('🔄 Sincronizando datos...', 'info');

            // Obtener datos locales y de la nube
            const localData = window.app.data;
            const cloudData = await window.firebaseStorage.loadUserData();

            if (!cloudData) {
                // No hay datos en la nube, subir datos locales
                await window.firebaseStorage.saveUserData(localData);
                this.showToast('✅ Datos locales subidos a la nube', 'success');
                return;
            }

            // Comparar timestamps
            const localTime = localData.timestamp || 0;
            const cloudTime = cloudData.lastUpdated?.toMillis?.() || 0;

            if (Math.abs(cloudTime - localTime) < 1000) {
                this.showToast('✅ Datos ya sincronizados', 'success');
                return;
            }

            if (cloudTime > localTime) {
                // Datos de la nube son más recientes
                const confirmMessage = 'Los datos en la nube son más recientes.\n¿Descargar y reemplazar datos locales?';
                if (confirm(confirmMessage)) {
                    Object.assign(window.app.data, cloudData);
                    await window.storageManager.guardarTodo(window.app.data);
                    window.app.updateAllDisplays();
                    this.showToast('✅ Datos actualizados desde la nube', 'success');
                }
            } else {
                // Datos locales son más recientes
                await window.firebaseStorage.saveUserData(localData);
                this.showToast('✅ Datos locales subidos a la nube', 'success');
            }

        } catch (error) {
            console.error('Error en sincronización inteligente:', error);
            this.showToast('❌ Error en la sincronización', 'error');
        } finally {
            this.syncInProgress = false;
            this.updateButtonStates();
        }
    }

    // Prompt para autenticación
    async promptForAuth(message) {
        const goToConfig = confirm(`${message}\n\n¿Ir a configuración para conectarse?`);
        if (goToConfig) {
            // Abrir pestaña de configuración
            if (window.showTab) {
                window.showTab('configuracion');
            }
        }
    }

    // Actualizar estado visual de los botones
    updateButtonStates() {
        const uploadBtn = document.getElementById('uploadCloudBtn');
        const downloadBtn = document.getElementById('downloadCloudBtn');
        
        if (!uploadBtn || !downloadBtn) return;

        const isReady = this.isFirebaseReady();
        const isOffline = !navigator.onLine;
        
        if (this.syncInProgress) {
            uploadBtn.disabled = true;
            downloadBtn.disabled = true;
            uploadBtn.title = 'Sincronización en progreso...';
            downloadBtn.title = 'Sincronización en progreso...';
        } else if (!isReady) {
            uploadBtn.disabled = true;
            downloadBtn.disabled = true;
            uploadBtn.classList.add('offline');
            downloadBtn.classList.add('offline');
            uploadBtn.title = 'Conectarse a la nube primero';
            downloadBtn.title = 'Conectarse a la nube primero';
        } else if (isOffline) {
            uploadBtn.disabled = true;
            downloadBtn.disabled = true;
            uploadBtn.classList.add('offline');
            downloadBtn.classList.add('offline');
            uploadBtn.title = 'Sin conexión a internet';
            downloadBtn.title = 'Sin conexión a internet';
        } else {
            uploadBtn.disabled = false;
            downloadBtn.disabled = false;
            uploadBtn.classList.remove('offline');
            downloadBtn.classList.remove('offline');
            uploadBtn.title = 'Subir datos a la nube';
            downloadBtn.title = 'Descargar datos de la nube';
        }
    }

    // Mostrar notificaciones toast
    showToast(message, type = 'info') {
        // Crear elemento toast si no existe
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }

        // Crear toast
        const toast = document.createElement('div');
        toast.textContent = message;
        
        const bgColor = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        }[type] || '#2196F3';

        toast.style.cssText = `
            background: ${bgColor};
            color: white;
            padding: 12px 20px;
            margin-bottom: 10px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: toastSlideIn 0.3s ease;
            pointer-events: auto;
        `;

        // Agregar animación CSS si no existe
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                @keyframes toastSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes toastSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        toastContainer.appendChild(toast);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Crear instancia global
const quickSyncManager = new QuickSyncManager();
window.quickSyncManager = quickSyncManager;

// Funciones globales para los botones del footer
async function uploadToCloudQuick() {
    await quickSyncManager.uploadToCloud();
}

async function downloadFromCloudQuick() {
    await quickSyncManager.downloadFromCloud();
}

async function smartSyncQuick() {
    await quickSyncManager.smartSync();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        quickSyncManager.init();
    }, 1000); // Esperar a que otros sistemas se inicialicen
});

// Monitorear cambios en conexión
window.addEventListener('online', () => {
    quickSyncManager.updateButtonStates();
    quickSyncManager.showToast('🌐 Conexión restaurada', 'success');
});

window.addEventListener('offline', () => {
    quickSyncManager.updateButtonStates();
    quickSyncManager.showToast('📱 Trabajando sin conexión', 'warning');
});
