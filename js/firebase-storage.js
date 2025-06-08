// Sistema de almacenamiento con Firebase para sincronización entre dispositivos
class FirebaseStorage {
    constructor() {
        this.isInitialized = false;
        this.db = null;
        this.auth = null;
        this.user = null;
    }

    async init() {
        console.log('🔥 Inicializando Firebase...');
        
        try {
            // Configuración de Firebase (reemplaza con tus credenciales)
            const firebaseConfig = {
                apiKey: "tu-api-key",
                authDomain: "tu-proyecto.firebaseapp.com",
                projectId: "tu-proyecto-id",
                storageBucket: "tu-proyecto.appspot.com",
                messagingSenderId: "123456789",
                appId: "tu-app-id"
            };

            // Inicializar Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            // Configurar persistencia offline
            await this.db.enablePersistence({ synchronizeTabs: true });
            
            this.isInitialized = true;
            console.log('✅ Firebase inicializado correctamente');
            
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            return false;
        }
    }

    // Autenticar usuario con email/password
    async authenticateUser(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.user = userCredential.user;
            console.log('✅ Usuario autenticado en Firebase:', this.user.email);
            return true;
        } catch (error) {
            console.error('❌ Error autenticando usuario:', error);
            return false;
        }
    }

    // Registrar nuevo usuario
    async registerUser(email, password) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            this.user = userCredential.user;
            console.log('✅ Usuario registrado en Firebase:', this.user.email);
            return true;
        } catch (error) {
            console.error('❌ Error registrando usuario:', error);
            return false;
        }
    }

    // Guardar datos del usuario en Firebase
    async saveUserData(data) {
        if (!this.isInitialized || !this.user) {
            console.warn('⚠️ Firebase no inicializado o usuario no autenticado');
            return false;
        }

        try {
            const userData = {
                ...data,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                userId: this.user.uid,
                email: this.user.email
            };

            await this.db.collection('users').doc(this.user.uid).set(userData, { merge: true });
            console.log('✅ Datos guardados en Firebase');
            return true;
        } catch (error) {
            console.error('❌ Error guardando en Firebase:', error);
            return false;
        }
    }

    // Cargar datos del usuario desde Firebase
    async loadUserData() {
        if (!this.isInitialized || !this.user) {
            console.warn('⚠️ Firebase no inicializado o usuario no autenticado');
            return null;
        }

        try {
            const doc = await this.db.collection('users').doc(this.user.uid).get();
            
            if (doc.exists) {
                const data = doc.data();
                console.log('✅ Datos cargados desde Firebase');
                return data;
            } else {
                console.log('📝 No hay datos existentes en Firebase para este usuario');
                return null;
            }
        } catch (error) {
            console.error('❌ Error cargando desde Firebase:', error);
            return null;
        }
    }

    // Escuchar cambios en tiempo real
    onUserDataChanged(callback) {
        if (!this.isInitialized || !this.user) {
            console.warn('⚠️ Firebase no inicializado o usuario no autenticado');
            return null;
        }

        return this.db.collection('users').doc(this.user.uid).onSnapshot((doc) => {
            if (doc.exists) {
                console.log('🔄 Datos actualizados desde otro dispositivo');
                callback(doc.data());
            }
        });
    }

    // Cerrar sesión
    async signOut() {
        try {
            await this.auth.signOut();
            this.user = null;
            console.log('✅ Sesión cerrada en Firebase');
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
        }
    }

    // Verificar si está conectado
    isOnline() {
        return navigator.onLine;
    }

    // Sincronizar datos locales con Firebase
    async syncWithLocal(localData) {
        if (!this.isOnline()) {
            console.log('📱 Sin conexión - trabajando offline');
            return localData;
        }

        try {
            // Cargar datos de Firebase
            const firebaseData = await this.loadUserData();
            
            if (!firebaseData) {
                // No hay datos en Firebase, subir datos locales
                await this.saveUserData(localData);
                return localData;
            }

            // Comparar timestamps para decidir qué datos usar
            const localTime = localData.timestamp || 0;
            const firebaseTime = firebaseData.lastUpdated?.toMillis() || 0;

            if (firebaseTime > localTime) {
                console.log('🔄 Usando datos de Firebase (más recientes)');
                return firebaseData;
            } else {
                console.log('📤 Subiendo datos locales a Firebase');
                await this.saveUserData(localData);
                return localData;
            }
        } catch (error) {
            console.error('❌ Error sincronizando datos:', error);
            return localData; // Fallback a datos locales
        }
    }
}

// Instancia global
const firebaseStorage = new FirebaseStorage();
window.firebaseStorage = firebaseStorage;
