// Gestor de interfaz de autenticación para Panel de Impresión 3D
class AuthUI {
    constructor() {
        this.isVisible = false;
    }

    // Mostrar la pantalla de login
    showLoginScreen() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = 'authOverlay';
        overlay.className = 'auth-overlay';
        
        overlay.innerHTML = `
            <div class="auth-container">
                <div class="auth-header">
                    <h1>🚀 Panel de Impresión 3D</h1>
                    <p>Acceso al sistema</p>
                </div>
                
                <div class="auth-tabs">
                    <button class="auth-tab active" onclick="authUI.showTab('login')">Iniciar Sesión</button>
                    <button class="auth-tab" onclick="authUI.showTab('register')">Registrarse</button>
                </div>

                <!-- Formulario de Login -->
                <div id="loginForm" class="auth-form active">
                    <h3>🔐 Iniciar Sesión</h3>
                    <div class="form-group">
                        <label>Usuario:</label>
                        <input type="text" id="loginUsername" placeholder="Tu nombre de usuario" autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label>Contraseña:</label>
                        <input type="password" id="loginPassword" placeholder="Tu contraseña" autocomplete="current-password">
                    </div>
                    <button class="btn btn-primary" onclick="authUI.handleLogin()">🚀 Iniciar Sesión</button>
                    <div class="auth-demo-info">
                        <small>💡 <strong>Demo:</strong> Si no tienes cuenta, créate una nueva en "Registrarse"</small>
                    </div>
                </div>

                <!-- Formulario de Registro -->
                <div id="registerForm" class="auth-form">
                    <h3>📝 Crear Cuenta</h3>
                    <div class="form-group">
                        <label>Usuario:</label>
                        <input type="text" id="registerUsername" placeholder="Elige un nombre de usuario (mín. 3 caracteres)" autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label>Email (opcional):</label>
                        <input type="email" id="registerEmail" placeholder="tu@email.com (opcional)" autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label>Contraseña:</label>
                        <input type="password" id="registerPassword" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label>Confirmar Contraseña:</label>
                        <input type="password" id="registerPasswordConfirm" placeholder="Repite tu contraseña" autocomplete="new-password">
                    </div>
                    <button class="btn btn-success" onclick="authUI.handleRegister()">✨ Crear Cuenta</button>
                    <div class="auth-demo-info">
                        <small>🔒 Tus datos se guardan localmente en tu navegador</small>
                    </div>
                </div>

                <div id="authMessage" class="auth-message"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Event listeners para Enter
        this.setupEventListeners();
        
        // Focus en el primer campo
        setTimeout(() => {
            document.getElementById('loginUsername')?.focus();
        }, 100);
    }

    // Ocultar la pantalla de login
    hideLoginScreen() {
        const overlay = document.getElementById('authOverlay');
        if (overlay) {
            overlay.remove();
        }
        this.isVisible = false;
    }

    // Cambiar entre tabs de login y registro
    showTab(tabName) {
        // Actualizar tabs activos
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');

        // Mostrar formulario correspondiente
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        if (tabName === 'login') {
            document.getElementById('loginForm').classList.add('active');
            setTimeout(() => document.getElementById('loginUsername')?.focus(), 100);
        } else if (tabName === 'register') {
            document.getElementById('registerForm').classList.add('active');
            setTimeout(() => document.getElementById('registerUsername')?.focus(), 100);
        }

        this.clearMessage();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Enter para enviar formularios
        document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        document.getElementById('registerPasswordConfirm')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleRegister();
        });

        // Validación en tiempo real para registro
        document.getElementById('registerPassword')?.addEventListener('input', (e) => {
            const confirmField = document.getElementById('registerPasswordConfirm');
            if (confirmField.value && confirmField.value !== e.target.value) {
                confirmField.setCustomValidity('Las contraseñas no coinciden');
            } else {
                confirmField.setCustomValidity('');
            }
        });

        document.getElementById('registerPasswordConfirm')?.addEventListener('input', (e) => {
            const passwordField = document.getElementById('registerPassword');
            if (passwordField.value !== e.target.value) {
                e.target.setCustomValidity('Las contraseñas no coinciden');
            } else {
                e.target.setCustomValidity('');
            }
        });
    }

    // Manejar login
    async handleLogin() {
        const username = document.getElementById('loginUsername')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;

        if (!username || !password) {
            this.showMessage('Por favor completa todos los campos', 'error');
            return;
        }

        try {
            const user = authManager.login(username, password);
            this.showMessage(`¡Bienvenido/a ${user.username}! 🎉`, 'success');
            
            setTimeout(() => {
                this.hideLoginScreen();
                // Recargar la aplicación con los datos del usuario
                if (window.app) {
                    window.app.onUserLogin();
                }
            }, 1000);

        } catch (error) {
            this.showMessage(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Manejar registro
    async handleRegister() {
        const username = document.getElementById('registerUsername')?.value.trim();
        const email = document.getElementById('registerEmail')?.value.trim();
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('registerPasswordConfirm')?.value;

        if (!username || !password || !confirmPassword) {
            this.showMessage('Por favor completa los campos obligatorios', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            authManager.register(username, password, email);
            
            this.showMessage(`✅ Cuenta creada exitosamente para ${username}!`, 'success');
            
            // Hacer login automático después del registro
            setTimeout(() => {
                const user = authManager.login(username, password);
                this.showMessage(`🚀 Iniciando sesión...`, 'success');
                
                setTimeout(() => {
                    this.hideLoginScreen();
                    if (window.app) {
                        window.app.onUserLogin();
                    }
                }, 1000);
            }, 1500);

        } catch (error) {
            this.showMessage(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Mostrar mensaje
    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('authMessage');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `auth-message ${type}`;
        }
    }

    // Limpiar mensaje
    clearMessage() {
        const messageDiv = document.getElementById('authMessage');
        if (messageDiv) {
            messageDiv.textContent = '';
            messageDiv.className = 'auth-message';
        }    }
    
    // Mostrar panel de configuración de usuario
    showUserPanel() {
        console.log('🔧 Abriendo panel de usuario...');
        
        // Verificar si el usuario está logueado
        if (!authManager.isLoggedIn()) {
            console.warn('❌ No hay usuario logueado');
            return;
        }

        // Evitar múltiples aperturas - cerrar si ya existe
        const existingOverlay = document.getElementById('userPanelOverlay');
        if (existingOverlay) {
            console.log('⚠️ Panel de usuario ya está abierto, cerrando...');
            this.hideUserPanel();
            return;
        }

        const user = authManager.getCurrentUser();
        const overlay = document.createElement('div');
        overlay.id = 'userPanelOverlay';
        overlay.className = 'auth-overlay';
        
        overlay.innerHTML = `
            <div class="auth-container">
                <div class="auth-header">
                    <h1>👤 Mi Cuenta</h1>
                    <p>Gestión de usuario</p>
                </div>

                <div class="user-info">
                    <h3>📋 Información de la Cuenta</h3>
                    <div class="info-grid">
                        <div><strong>Usuario:</strong> ${user.username}</div>
                        <div><strong>Email:</strong> ${user.email || 'No especificado'}</div>
                        <div><strong>Cuenta creada:</strong> ${new Date(user.createdAt).toLocaleDateString('es-ES')}</div>
                        <div><strong>Último acceso:</strong> ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Primera vez'}</div>
                    </div>
                </div>

                <div class="user-actions">
                    <h3>🔧 Acciones</h3>
                    <button class="btn btn-secondary" onclick="authUI.showChangePassword()">🔑 Cambiar Contraseña</button>
                    <button class="btn btn-warning" onclick="authUI.handleLogout()">🚪 Cerrar Sesión</button>
                </div>

                <div id="changePasswordSection" class="change-password-section hidden">
                    <h4>🔑 Cambiar Contraseña</h4>
                    <div class="form-group">
                        <label>Contraseña actual:</label>
                        <input type="password" id="currentPassword" placeholder="Tu contraseña actual">
                    </div>
                    <div class="form-group">
                        <label>Nueva contraseña:</label>
                        <input type="password" id="newPassword" placeholder="Nueva contraseña (mín. 6 caracteres)">
                    </div>
                    <div class="form-group">
                        <label>Confirmar nueva contraseña:</label>
                        <input type="password" id="confirmNewPassword" placeholder="Repite la nueva contraseña">
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-success" onclick="authUI.handleChangePassword()">✅ Cambiar</button>
                        <button class="btn btn-secondary" onclick="authUI.hideChangePassword()">❌ Cancelar</button>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="authUI.hideUserPanel()">❌ Cerrar</button>
                </div>

                <div id="userPanelMessage" class="auth-message"></div>
            </div>        `;
        
        // Agregar event listener para cerrar al hacer click fuera del modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hideUserPanel();
            }
        });

        // Agregar event listener para cerrar con la tecla Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideUserPanel();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        document.body.appendChild(overlay);
        
        // Aplicar foco al modal para accesibilidad
        setTimeout(() => {
            overlay.focus();
        }, 100);
    }

    // Mostrar sección de cambiar contraseña
    showChangePassword() {
        const section = document.getElementById('changePasswordSection');
        if (section) {
            section.classList.remove('hidden');
            document.getElementById('currentPassword')?.focus();
        }
    }

    // Ocultar sección de cambiar contraseña
    hideChangePassword() {
        const section = document.getElementById('changePasswordSection');
        if (section) {
            section.classList.add('hidden');
            // Limpiar campos
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
        }
    }

    // Manejar cambio de contraseña
    handleChangePassword() {
        const currentPassword = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmNewPassword')?.value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showUserPanelMessage('Por favor completa todos los campos', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showUserPanelMessage('Las nuevas contraseñas no coinciden', 'error');
            return;
        }

        try {
            authManager.changePassword(currentPassword, newPassword);
            this.showUserPanelMessage('✅ Contraseña cambiada exitosamente', 'success');
            this.hideChangePassword();
        } catch (error) {
            this.showUserPanelMessage(`❌ Error: ${error.message}`, 'error');
        }
    }    // Ocultar panel de usuario
    hideUserPanel() {
        const overlay = document.getElementById('userPanelOverlay');
        if (overlay) {
            // Agregar animación de salida
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            const container = overlay.querySelector('.auth-container');
            if (container) {
                container.style.animation = 'slideOut 0.3s ease-out';
            }
            
            // Remover después de la animación
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);
        }
    }

    // Mostrar mensaje en panel de usuario
    showUserPanelMessage(message, type = 'info') {
        const messageDiv = document.getElementById('userPanelMessage');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `auth-message ${type}`;
        }
    }

    // Manejar logout
    handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            authManager.logout();
            this.hideUserPanel();
            
            // Mostrar pantalla de login nuevamente
            setTimeout(() => {
                this.showLoginScreen();
            }, 300);
        }
    }    // Mostrar indicador de usuario logueado en la interfaz principal
    updateUserIndicator() {
        const userIndicator = document.getElementById('userIndicator');
        const currentUserSpan = document.getElementById('currentUser');
        const userMenuBtn = document.getElementById('userMenuBtn');
        
        if (!userIndicator || !currentUserSpan || !userMenuBtn) {
            console.warn('❌ Elementos del indicador de usuario no encontrados');
            return;
        }

        if (authManager.isLoggedIn()) {
            const user = authManager.getCurrentUser();
            currentUserSpan.textContent = `👤 ${user.username}`;
            userIndicator.style.display = 'flex';
            
            // Asignar el evento del botón de menú (siempre para asegurar que funcione)
            userMenuBtn.onclick = () => this.showUserPanel();
            console.log('✅ Indicador de usuario actualizado para:', user.username);
        } else {
            userIndicator.style.display = 'none';
            userMenuBtn.onclick = null;
        }
    }
}

// Función global para debugging del botón de configuración
window.debugSettingsButton = function() {
    console.log('🔍 Verificando estado del botón de configuración...');
    
    const userIndicator = document.getElementById('userIndicator');
    const currentUserSpan = document.getElementById('currentUser');
    const userMenuBtn = document.getElementById('userMenuBtn');
    
    console.log('📋 Estado de elementos:');
    console.log('  - userIndicator:', userIndicator ? '✅ Encontrado' : '❌ No encontrado');
    console.log('  - currentUserSpan:', currentUserSpan ? '✅ Encontrado' : '❌ No encontrado');
    console.log('  - userMenuBtn:', userMenuBtn ? '✅ Encontrado' : '❌ No encontrado');
    
    if (userMenuBtn) {
        console.log('  - userMenuBtn.onclick:', userMenuBtn.onclick ? '✅ Asignado' : '❌ No asignado');
        console.log('  - userMenuBtn.style.display:', userMenuBtn.style.display || 'default');
    }
    
    if (userIndicator) {
        console.log('  - userIndicator.style.display:', userIndicator.style.display || 'default');
    }
    
    console.log('👤 Estado de autenticación:');
    console.log('  - authManager.isLoggedIn():', authManager.isLoggedIn());
    if (authManager.isLoggedIn()) {
        console.log('  - Usuario actual:', authManager.getCurrentUser().username);
    }
    
    // Prueba del botón
    if (userMenuBtn && userMenuBtn.onclick) {
        console.log('🧪 Puedes probar el botón ejecutando: document.getElementById("userMenuBtn").click()');
    }
    
    return {
        userIndicator: !!userIndicator,
        userMenuBtn: !!userMenuBtn,
        hasOnClick: !!(userMenuBtn && userMenuBtn.onclick),
        isLoggedIn: authManager.isLoggedIn(),
        isVisible: userIndicator ? userIndicator.style.display !== 'none' : false
    };
};

// Crear instancia global
const authManager = new AuthManager();
const authUI = new AuthUI();
