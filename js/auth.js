// Sistema de autenticación para Panel de Impresión 3D
class AuthManager {
    constructor() {
        this.storageKey = 'printerAdmin3D_users';
        this.sessionKey = 'printerAdmin3D_session';
        this.currentUser = null;
    }

    // Inicializar el sistema de autenticación
    init() {
        console.log('🔐 Inicializando AuthManager...');
        
        // Verificar si hay una sesión activa
        const session = this.getSession();
        if (session && this.validateSession(session)) {
            this.currentUser = session.user;
            console.log('✅ Sesión activa encontrada:', this.currentUser.username);
            return true;
        } else {
            this.clearSession();
            return false;
        }
    }

    // Hash simple para contraseñas (para desarrollo local)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32-bit
        }
        return Math.abs(hash).toString(16);
    }

    // Obtener usuarios registrados
    getUsers() {
        try {
            const users = localStorage.getItem(this.storageKey);
            return users ? JSON.parse(users) : {};
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            return {};
        }
    }

    // Guardar usuarios
    saveUsers(users) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Error guardando usuarios:', error);
            return false;
        }
    }

    // Registrar nuevo usuario
    register(username, password, email) {
        if (!username || !password) {
            throw new Error('Usuario y contraseña son requeridos');
        }

        if (username.length < 3) {
            throw new Error('El usuario debe tener al menos 3 caracteres');
        }

        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        const users = this.getUsers();
        
        if (users[username]) {
            throw new Error('El usuario ya existe');
        }

        const newUser = {
            username: username,
            email: email || '',
            passwordHash: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        users[username] = newUser;
        
        if (this.saveUsers(users)) {
            console.log('✅ Usuario registrado:', username);
            return true;
        } else {
            throw new Error('Error al guardar el usuario');
        }
    }

    // Iniciar sesión
    login(username, password) {
        if (!username || !password) {
            throw new Error('Usuario y contraseña son requeridos');
        }

        const users = this.getUsers();
        const user = users[username];

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const passwordHash = this.hashPassword(password);
        if (user.passwordHash !== passwordHash) {
            throw new Error('Contraseña incorrecta');
        }

        // Actualizar último login
        user.lastLogin = new Date().toISOString();
        users[username] = user;
        this.saveUsers(users);

        // Crear sesión
        const session = {
            user: {
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            },
            loginTime: Date.now(),
            expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
        };

        this.saveSession(session);
        this.currentUser = session.user;
        
        console.log('✅ Login exitoso:', username);
        return session.user;
    }

    // Cerrar sesión
    logout() {
        this.clearSession();
        this.currentUser = null;
        console.log('👋 Sesión cerrada');
    }

    // Guardar sesión
    saveSession(session) {
        try {
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
        } catch (error) {
            console.error('Error guardando sesión:', error);
        }
    }

    // Obtener sesión actual
    getSession() {
        try {
            const session = localStorage.getItem(this.sessionKey);
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Error cargando sesión:', error);
            return null;
        }
    }

    // Validar sesión
    validateSession(session) {
        if (!session || !session.expires || !session.user) {
            return false;
        }

        // Verificar si la sesión ha expirado
        if (Date.now() > session.expires) {
            console.log('⏰ Sesión expirada');
            return false;
        }

        return true;
    }

    // Limpiar sesión
    clearSession() {
        try {
            localStorage.removeItem(this.sessionKey);
        } catch (error) {
            console.error('Error limpiando sesión:', error);
        }
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar si hay usuario logueado
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Cambiar contraseña
    changePassword(currentPassword, newPassword) {
        if (!this.isLoggedIn()) {
            throw new Error('Debes estar logueado para cambiar la contraseña');
        }

        if (!currentPassword || !newPassword) {
            throw new Error('Contraseña actual y nueva son requeridas');
        }

        if (newPassword.length < 6) {
            throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
        }

        const users = this.getUsers();
        const user = users[this.currentUser.username];

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const currentHash = this.hashPassword(currentPassword);
        if (user.passwordHash !== currentHash) {
            throw new Error('Contraseña actual incorrecta');
        }

        user.passwordHash = this.hashPassword(newPassword);
        users[this.currentUser.username] = user;

        if (this.saveUsers(users)) {
            console.log('✅ Contraseña cambiada para:', this.currentUser.username);
            return true;
        } else {
            throw new Error('Error al guardar la nueva contraseña');
        }
    }

    // Obtener clave de almacenamiento específica del usuario
    getUserStorageKey(baseKey) {
        if (!this.isLoggedIn()) {
            return baseKey; // Fallback si no hay usuario
        }
        return `${baseKey}_user_${this.currentUser.username}`;
    }

    // Migrar datos existentes al usuario actual (para upgrade desde versión sin login)
    migrateExistingData() {
        if (!this.isLoggedIn()) return false;

        try {
            // Obtener datos existentes sin prefijo de usuario
            const existingData = localStorage.getItem('printerAdmin3D');
            
            if (existingData) {
                // Guardar datos bajo la clave del usuario actual
                const userKey = this.getUserStorageKey('printerAdmin3D');
                const userDataExists = localStorage.getItem(userKey);
                
                if (!userDataExists) {
                    localStorage.setItem(userKey, existingData);
                    console.log('📦 Datos migrados al usuario:', this.currentUser.username);
                    
                    // Opcional: limpiar datos sin prefijo después de migrar
                    // localStorage.removeItem('printerAdmin3D');
                }
                
                return true;
            }
        } catch (error) {
            console.error('Error migrando datos:', error);
        }
        
        return false;
    }

    // Obtener estadísticas de usuarios (para administración)
    getUserStats() {
        const users = this.getUsers();
        const userCount = Object.keys(users).length;
        const userList = Object.values(users).map(user => ({
            username: user.username,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }));

        return {
            totalUsers: userCount,
            users: userList
        };
    }
}
