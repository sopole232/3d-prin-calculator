// Sistema de configuración para sincronización en la nube
class CloudSyncManager {
    constructor() {
        this.isConfigured = false;
        this.firebaseConfig = null;
        this.connectionStatus = 'disconnected';
    }

    // Método principal para renderizar la interfaz (requerido por ConfigManager)
    render() {
        const container = document.getElementById('cloudSyncSection');
        if (!container) {
            console.warn('Container cloudSyncSection no encontrado');
            return;
        }
        
        container.innerHTML = this.getConfigHTML();
        this.loadFirebaseConfig();
        this.updateConnectionStatus();
    }

    // Generar HTML de configuración
    getConfigHTML() {
        return `
            <div class="cloud-sync-config">
                <h4>⚙️ Configuración de Firebase</h4>
                <p>Introduce tus credenciales de Firebase para habilitar sincronización:</p>
                
                <div class="sync-status" id="syncStatus">
                    <span id="syncStatusText">❌ No configurado</span>
                </div>
                
                <div class="config-section">
                    <div class="form-group">
                        <label>API Key:</label>
                        <input type="text" id="firebase_apiKey" placeholder="AIza..." style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label>Auth Domain:</label>
                        <input type="text" id="firebase_authDomain" placeholder="tu-proyecto.firebaseapp.com" style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label>Project ID:</label>
                        <input type="text" id="firebase_projectId" placeholder="tu-proyecto-id" style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label>Storage Bucket:</label>
                        <input type="text" id="firebase_storageBucket" placeholder="tu-proyecto.appspot.com" style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label>Messaging Sender ID:</label>
                        <input type="text" id="firebase_messagingSenderId" placeholder="123456789" style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label>App ID:</label>
                        <input type="text" id="firebase_appId" placeholder="1:123:web:abc..." style="width: 100%;">
                    </div>
                    
                    <div class="form-group">
                        <button onclick="window.cloudSyncManager.saveFirebaseConfig()" class="btn btn-primary">
                            💾 Guardar Configuración
                        </button>
                        <button onclick="window.cloudSyncManager.initializeFirebase()" class="btn btn-success">
                            🔥 Conectar Firebase
                        </button>
                    </div>
                </div>
                
                <div class="config-section">
                    <h4>👤 Cuenta de Usuario</h4>
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" id="userEmail" placeholder="tu-email@ejemplo.com" style="width: 100%;">
                    </div>
                    <div class="form-group">
                        <label>Contraseña:</label>
                        <input type="password" id="userPassword" placeholder="Contraseña segura" style="width: 100%;">
                    </div>
                    
                    <div class="form-group">
                        <button onclick="window.cloudSyncManager.loginUser()" class="btn btn-info">
                            🔐 Iniciar Sesión
                        </button>
                        <button onclick="window.cloudSyncManager.registerUser()" class="btn btn-warning">
                            👤 Registrar Usuario
                        </button>
                    </div>
                </div>
                  <div class="sync-actions">
                    <h4>🔄 Sincronización</h4>
                    <button onclick="smartSyncQuick()" class="btn btn-primary" disabled id="syncNowBtn">
                        🔄 Sincronizar Ahora
                    </button>
                    <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
                        <small>💡 Usa los botones compactos en la parte inferior para subir/descargar</small>
                    </p>
                </div>
                  <div class="sync-info">
                    <h4>ℹ️ Configuración Rápida</h4>
                    <p style="font-size: 0.85em; margin: 5px 0;">
                        1. Crea proyecto en <a href="https://console.firebase.google.com" target="_blank">Firebase</a><br>
                        2. Habilita Authentication + Firestore<br>
                        3. Copia credenciales aquí<br>
                        4. Conecta y registra usuario
                    </p>
                    <p><small>🔗 Para instrucciones detalladas, revisa el archivo <code>FIREBASE_SETUP.md</code></small></p>
                </div>
            </div>
        `;
    }

    // Guardar configuración de Firebase
    saveFirebaseConfig() {
        const config = {
            apiKey: document.getElementById('firebase_apiKey').value,
            authDomain: document.getElementById('firebase_authDomain').value,
            projectId: document.getElementById('firebase_projectId').value,
            storageBucket: document.getElementById('firebase_storageBucket').value,
            messagingSenderId: document.getElementById('firebase_messagingSenderId').value,
            appId: document.getElementById('firebase_appId').value
        };

        // Validar que todos los campos estén completos
        const emptyFields = Object.keys(config).filter(key => !config[key]);
        if (emptyFields.length > 0) {
            alert(`❌ Faltan los siguientes campos: ${emptyFields.join(', ')}`);
            return;
        }

        // Guardar configuración localmente
        localStorage.setItem('firebaseConfig', JSON.stringify(config));
        this.firebaseConfig = config;
        
        alert('✅ Configuración de Firebase guardada');
        this.updateConnectionStatus();
    }

    // Cargar configuración guardada
    loadFirebaseConfig() {
        const saved = localStorage.getItem('firebaseConfig');
        if (saved) {
            this.firebaseConfig = JSON.parse(saved);
            
            // Rellenar los campos si la interfaz está disponible
            if (document.getElementById('firebase_apiKey')) {
                document.getElementById('firebase_apiKey').value = this.firebaseConfig.apiKey || '';
                document.getElementById('firebase_authDomain').value = this.firebaseConfig.authDomain || '';
                document.getElementById('firebase_projectId').value = this.firebaseConfig.projectId || '';
                document.getElementById('firebase_storageBucket').value = this.firebaseConfig.storageBucket || '';
                document.getElementById('firebase_messagingSenderId').value = this.firebaseConfig.messagingSenderId || '';
                document.getElementById('firebase_appId').value = this.firebaseConfig.appId || '';
            }
        }
    }

    // Inicializar Firebase
    async initializeFirebase() {
        if (!this.firebaseConfig) {
            alert('❌ Primero guarda la configuración de Firebase');
            return;
        }

        try {
            // Verificar que Firebase esté disponible
            if (typeof firebase === 'undefined') {
                alert('❌ Firebase SDK no está cargado');
                return;
            }

            // Inicializar Firebase si no está inicializado
            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
            }

            // Configurar FirebaseStorage
            if (window.firebaseStorage) {
                window.firebaseStorage.config = this.firebaseConfig;
                await window.firebaseStorage.init();
                this.connectionStatus = 'connected';
                this.updateConnectionStatus();
                alert('✅ Firebase inicializado correctamente');
            } else {
                alert('❌ FirebaseStorage no está disponible');
            }

        } catch (error) {
            console.error('Error inicializando Firebase:', error);
            alert(`❌ Error inicializando Firebase: ${error.message}`);
        }
    }    // Registrar nuevo usuario
    async registerUser() {
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('userPassword').value;

        if (!email || !password) {
            alert('❌ Por favor ingresa email y contraseña');
            return;
        }

        if (password.length < 6) {
            alert('❌ La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            if (!window.firebaseStorage || !window.firebaseStorage.auth) {
                alert('❌ Primero inicializa Firebase');
                return;
            }

            const result = await window.firebaseStorage.auth.createUserWithEmailAndPassword(email, password);
            window.firebaseStorage.user = result.user;
            
            this.connectionStatus = 'authenticated';
            this.updateConnectionStatus();
            this.enableSyncButtons();
            
            // Guardar credenciales para auto-login futuro
            if (window.quickSyncManager) {
                window.quickSyncManager.saveCredentialsForAutoAuth(email, password);
            }
            
            alert('✅ Usuario registrado e iniciado sesión correctamente');
        } catch (error) {
            console.error('Error registrando usuario:', error);
            alert(`❌ Error registrando usuario: ${error.message}`);
        }
    }// Iniciar sesión
    async loginUser() {
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('userPassword').value;

        if (!email || !password) {
            alert('❌ Por favor ingresa email y contraseña');
            return;
        }

        try {
            if (!window.firebaseStorage || !window.firebaseStorage.auth) {
                alert('❌ Primero inicializa Firebase');
                return;
            }

            const result = await window.firebaseStorage.auth.signInWithEmailAndPassword(email, password);
            window.firebaseStorage.user = result.user;
            
            this.connectionStatus = 'authenticated';
            this.updateConnectionStatus();
            this.enableSyncButtons();
            
            // Guardar credenciales para auto-login futuro
            if (window.quickSyncManager) {
                window.quickSyncManager.saveCredentialsForAutoAuth(email, password);
            }
            
            alert('✅ Sesión iniciada correctamente');
        } catch (error) {
            console.error('Error iniciando sesión:', error);
            alert(`❌ Error iniciando sesión: ${error.message}`);
        }
    }

    // Actualizar estado de conexión
    updateConnectionStatus() {
        const statusEl = document.getElementById('syncStatusText');
        if (!statusEl) return;

        let status = '❌ No configurado';
        let className = 'sync-status-disconnected';

        if (this.firebaseConfig) {
            if (this.connectionStatus === 'authenticated') {
                status = '🟢 Conectado y autenticado';
                className = 'sync-status-connected';
            } else if (this.connectionStatus === 'connected') {
                status = '🟡 Firebase conectado - Falta autenticación';
                className = 'sync-status-partial';
            } else {
                status = '🔧 Firebase configurado - Falta conexión';
                className = 'sync-status-configured';
            }
        }

        statusEl.textContent = status;
        statusEl.className = className;
    }    // Habilitar botones de sincronización
    enableSyncButtons() {
        const syncBtn = document.getElementById('syncNowBtn');
        if (syncBtn) syncBtn.disabled = false;
    }

    // Sincronizar datos ahora
    async syncNow() {
        try {
            if (!window.app || !window.app.data) {
                alert('❌ No hay datos para sincronizar');
                return;
            }

            if (!window.firebaseStorage || !window.firebaseStorage.user) {
                alert('❌ Primero inicia sesión');
                return;
            }

            await window.firebaseStorage.saveUserData(window.app.data);
            alert('✅ Datos sincronizados correctamente');
        } catch (error) {
            console.error('Error sincronizando:', error);
            alert('❌ Error sincronizando datos');
        }
    }

    // Descargar datos desde la nube
    async downloadFromCloud() {
        try {
            if (!window.firebaseStorage || !window.firebaseStorage.user) {
                alert('❌ Primero inicia sesión');
                return;
            }

            const cloudData = await window.firebaseStorage.loadUserData();
            
            if (!cloudData) {
                alert('ℹ️ No hay datos en la nube');
                return;
            }

            const confirmMessage = `¿Descargar datos desde la nube?
            
Esto reemplazará todos tus datos locales con los datos de la nube.
Fecha de la nube: ${cloudData.lastUpdated?.toDate?.()?.toLocaleString() || 'Desconocida'}

¿Continuar?`;

            if (confirm(confirmMessage)) {
                // Actualizar datos de la app
                Object.assign(window.app.data, cloudData);
                await window.storageManager.guardarTodo(window.app.data);
                window.app.updateAllDisplays();
                
                alert('✅ Datos descargados desde la nube');
            }
        } catch (error) {
            console.error('Error descargando desde la nube:', error);
            alert('❌ Error descargando datos');
        }
    }

    // Subir datos a la nube
    async uploadToCloud() {
        try {
            if (!window.app || !window.app.data) {
                alert('❌ No hay datos para subir');
                return;
            }

            if (!window.firebaseStorage || !window.firebaseStorage.user) {
                alert('❌ Primero inicia sesión');
                return;
            }

            const confirmMessage = `¿Subir datos locales a la nube?
            
Esto reemplazará los datos en la nube con tus datos locales.

¿Continuar?`;

            if (confirm(confirmMessage)) {
                await window.firebaseStorage.saveUserData(window.app.data);
                alert('✅ Datos subidos a la nube');
            }
        } catch (error) {
            console.error('Error subiendo a la nube:', error);
            alert('❌ Error subiendo datos');
        }
    }

    // Configurar listeners para cambios en tiempo real
    setupRealtimeSync() {
        if (window.firebaseStorage && window.firebaseStorage.user) {
            return window.firebaseStorage.onUserDataChanged((cloudData) => {
                if (window.app && window.app.data) {
                    const localTime = window.app.data.timestamp || 0;
                    const cloudTime = cloudData.lastUpdated?.toMillis?.() || 0;
                    
                    if (cloudTime > localTime) {
                        const message = `Se detectaron cambios desde otro dispositivo.
                        
¿Quieres sincronizar los cambios?`;
                        
                        if (confirm(message)) {
                            Object.assign(window.app.data, cloudData);
                            window.app.updateAllDisplays();
                            alert('✅ Datos sincronizados desde otro dispositivo');
                        }
                    }
                }
            });
        }
    }
}

// Instancia global
window.cloudSyncManager = new CloudSyncManager();
