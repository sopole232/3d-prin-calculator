class App {
    constructor() {
        this.data = {
            filamentos: [],
            perfilesCostos: [],
            historico: [],
            configuracion: {
                gananciaPorDefecto: 30,
                redondeoPrecios: 0.01,
                recargoMultiMaterial: 15,
                tarifaOperadorDefecto: 15
            },
            perfilActivoId: null
        };
        this.managers = {};
    }    async init() {
        try {
            console.log('🚀 Iniciando aplicación...');
            
            // Inicializar sistema de autenticación
            console.log('🔐 Inicializando autenticación...');
            const hasActiveSession = authManager.init();
            
            if (!hasActiveSession) {
                // No hay sesión activa, mostrar pantalla de login
                console.log('🔑 No hay sesión activa, mostrando login...');
                authUI.showLoginScreen();
                return; // Salir hasta que el usuario se loguee
            }
            
            console.log('✅ Usuario logueado:', authManager.getCurrentUser().username);
            
            // Continuar con la inicialización normal
            await this.initializeApp();
            
        } catch (error) {
            console.error('❌ Error iniciando aplicación:', error);
            UI.showAlert('Error iniciando la aplicación. Por favor recarga la página.');
        }
    }

    async initializeApp() {
        try {
            // Inicializar storage
            await storageManager.init();
            console.log('💾 Storage inicializado');
            
            // Cargar datos específicos del usuario
            const loadedData = await storageManager.cargarTodo();
            Object.assign(this.data, loadedData);
            console.log('📊 Datos cargados para usuario:', authManager.getCurrentUser().username);            // Inicializar CloudSync Manager
            if (window.CloudSyncManager) {
                window.cloudSyncManager = new CloudSyncManager();
                console.log('☁️ CloudSyncManager inicializado');
            } else {
                console.warn('⚠️ CloudSyncManager no disponible');
            }

            // Inicializar QuickSync Manager para auto-autenticación
            if (window.QuickSyncManager) {
                window.quickSyncManager = new QuickSyncManager();
                console.log('⚡ QuickSyncManager inicializado');
                
                // Intentar auto-autenticación
                try {
                    await quickSyncManager.tryAutoAuthentication();
                    console.log('🔐 Auto-autenticación completada');
                } catch (error) {
                    console.log('ℹ️ Auto-autenticación no disponible:', error.message);
                }
            } else {
                console.warn('⚠️ QuickSyncManager no disponible');
            }

            // Migrar datos antiguos si es necesario
            this.migrarDatosAmortizacion();

            // Inicializar managers - CON BACKEND EDITOR
            console.log('👥 Inicializando managers...');
            this.managers = {
                filament: new FilamentManager(this.data),
                profile: new ProfileManager(this.data),
                calculator: new Calculator(this.data),
                history: new HistoryManager(this.data),
                config: new ConfigManager(this.data)
            };
            
            // Agregar backend editor si está disponible
            if (window.BackendEditor) {
                this.managers.backend = new BackendEditor(this.data);
                console.log('🔧 BackendEditor agregado a managers');
            } else {
                console.warn('⚠️ BackendEditor no disponible');
            }
            
            console.log('✅ Managers inicializados:', Object.keys(this.managers));

            // Hacer managers disponibles globalmente para debugging
            window.appManagers = this.managers;

            // Inicializar UI
            UI.init();
            console.log('🎨 UI inicializada');
            
            // Actualizar displays
            this.updateAllDisplays();
            console.log('📱 Displays actualizados');
            
            // Configurar listeners adicionales
            this.setupEventListeners();

            // Inicializar el selector de materiales
            setTimeout(() => {
                this.managers.config.actualizarSelectMateriales();
                console.log('🧪 Selector de materiales actualizado');
            }, 200);            console.log('🚀 Aplicación inicializada correctamente');
            this.updateDbStatus('success', this.getDbStatusText());
            
            // Mostrar indicador de usuario logueado
            authUI.updateUserIndicator();

        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.updateDbStatus('warning', '📁 localStorage');
            alert('❌ Error inicializando la aplicación. Revisa la consola para más detalles.');
        }
    }    // Método llamado cuando el usuario hace login
    onUserLogin() {
        console.log('🎉 Usuario logueado, reinicializando aplicación...');
        this.initializeApp();
        
        // Asegurarse de que el indicador de usuario se actualice después del login
        authUI.updateUserIndicator();
    }

    // Método para manejar logout
    onUserLogout() {
        console.log('👋 Usuario deslogueado');
        // Limpiar datos de la sesión actual
        this.data = {
            filamentos: [],
            perfilesCostos: [],
            historico: [],
            configuracion: {},
            perfilActivoId: null
        };
        
        // Limpiar managers
        if (this.managers) {
            this.managers = null;
        }
        
        // Mostrar pantalla de login
        authUI.showLoginScreen();
    }

    migrarDatosAmortizacion() {
        // Migrar perfiles antiguos que no tienen los nuevos campos
        let migrated = false;
        
        this.data.perfilesCostos.forEach(perfil => {
            if (!perfil.costoImpresora || !perfil.horasAmortizacion) {
                // Valores por defecto para perfiles antiguos
                perfil.costoImpresora = perfil.costoImpresora || 800;
                perfil.horasAmortizacion = perfil.horasAmortizacion || 1000;
                perfil.factorAmortizacion = perfil.costoImpresora / perfil.horasAmortizacion;
                migrated = true;
            }
            
            // Migrar campos de mantenimiento y buffer de errores
            if (!perfil.costoMantenimiento && !perfil.intervaloMantenimiento) {
                perfil.costoMantenimiento = 60;
                perfil.intervaloMantenimiento = 250;
                perfil.costoMantenimientoPorHora = 60 / 250;
                migrated = true;
            }
            
            if (!perfil.bufferErrores) {
                perfil.bufferErrores = 2;
                migrated = true;
            }
              // Asegurar que desperdicioMaterial existe
            if (perfil.desperdicioMaterial === undefined) {
                perfil.desperdicioMaterial = 5;
                migrated = true;
            }
            
            // Asegurar que recargoMultiPiezas existe
            if (perfil.recargoMultiPiezas === undefined) {
                perfil.recargoMultiPiezas = 10;
                migrated = true;
            }
            
            // Eliminar campo vidaUtilAnios si existe
            if (perfil.vidaUtilAnios !== undefined) {
                delete perfil.vidaUtilAnios;
                migrated = true;
            }
        });

        // Migrar datos antiguos de impresoras a perfiles de costos si existen
        if (this.data.impresoras && this.data.impresoras.length > 0) {
            this.data.impresoras.forEach(impresora => {
                const perfil = {
                    id: impresora.id || Date.now() + Math.random(),
                    nombre: impresora.nombre,
                    modelo: impresora.modelo,
                    costoImpresora: impresora.costoImpresora || 800,
                    horasAmortizacion: impresora.horasAmortizacion || 1000,
                    factorAmortizacion: impresora.factorAmortizacion || 0.8,
                    potencia: impresora.potencia || 200,
                    costoElectricidad: impresora.costoElectricidad || 0.15,
                    costoMantenimiento: impresora.costoMantenimiento || 60,
                    intervaloMantenimiento: impresora.intervaloMantenimiento || 250,
                    costoMantenimientoPorHora: impresora.costoMantenimientoPorHora || 0.24,
                    desperdicioMaterial: 5,
                    bufferErrores: impresora.bufferErrores || 2,
                    margenGanancia: 30,
                    fechaCreacion: impresora.fechaCreacion || new Date().toLocaleString('es-ES')
                };
                this.data.perfilesCostos.push(perfil);
            });
            
            // Eliminar datos antiguos de impresoras
            delete this.data.impresoras;
            migrated = true;
        }

        if (migrated) {
            console.log('📦 Datos migrados automáticamente');
            this.save();
        }
    }

    async save() {
        try {
            // Validar datos antes de guardar
            this.validarDatosAntesDeGuardar();
            await storageManager.guardarTodo(this.data);
            console.log('✅ Datos guardados correctamente');
        } catch (error) {
            console.error('Error guardando datos:', error);
            UI.showAlert('⚠️ Error al guardar los datos. Se usará localStorage como respaldo.');
            
            // Intentar fallback a localStorage
            try {
                await storageManager.guardarLocalStorage(this.data);
                console.log('📁 Guardado en localStorage como respaldo');
            } catch (fallbackError) {
                console.error('Error en fallback a localStorage:', fallbackError);
            }
        }
    }

    validarDatosAntesDeGuardar() {
        // Validar y corregir filamentos
        if (!this.data.filamentos || !Array.isArray(this.data.filamentos)) {
            this.data.filamentos = storageManager.getDefaultFilaments();
        } else {
            this.data.filamentos.forEach((filamento, index) => {
                if (!filamento.id) {
                    filamento.id = Date.now() + index;
                }
                // Asegurar campos requeridos
                if (!filamento.nombre) filamento.nombre = `Filamento ${index + 1}`;
                if (!filamento.tipo) filamento.tipo = 'PLA';
                if (!filamento.precioPorKg) filamento.precioPorKg = 25;
            });
        }

        // Validar y corregir perfiles de costos
        if (!this.data.perfilesCostos || !Array.isArray(this.data.perfilesCostos)) {
            this.data.perfilesCostos = [];
        } else {
            this.data.perfilesCostos.forEach((perfil, index) => {
                if (!perfil.id) {
                    perfil.id = Date.now() + index + 1000;
                }
                // Asegurar campos requeridos
                if (!perfil.nombre) perfil.nombre = `Impresora ${index + 1}`;
                if (!perfil.modelo) perfil.modelo = 'Modelo desconocido';
                if (!perfil.factorAmortizacion) perfil.factorAmortizacion = 0.8;
            });
        }

        // Validar y corregir histórico
        if (!this.data.historico || !Array.isArray(this.data.historico)) {
            this.data.historico = [];
        } else {
            this.data.historico.forEach((calculo, index) => {
                if (!calculo.id) {
                    calculo.id = Date.now() + index + 2000;
                }
            });
        }

        // Validar configuración
        if (!this.data.configuracion || typeof this.data.configuracion !== 'object') {
            this.data.configuracion = storageManager.getDefaultConfig();
        } else {
            // Asegurar campos de configuración por defecto
            const defaultConfig = storageManager.getDefaultConfig();
            Object.keys(defaultConfig).forEach(key => {
                if (this.data.configuracion[key] === undefined) {
                    this.data.configuracion[key] = defaultConfig[key];
                }
            });
        }

        // Validar perfil activo
        if (this.data.perfilActivoId && this.data.perfilesCostos.length > 0) {
            const perfilExiste = this.data.perfilesCostos.some(p => p.id === this.data.perfilActivoId);
            if (!perfilExiste) {
                this.data.perfilActivoId = null;
            }
        }

        console.log('✅ Datos validados antes del guardado');
    }

    updateAllDisplays() {
        this.managers.filament.updateDisplay();
        this.managers.filament.updateSelects();
        this.managers.profile.updateDisplay();
        this.managers.profile.updateSelects();
        this.managers.history.updateDisplay();
        this.managers.config.updateDisplay();
        
        // Actualizar perfil activo si existe
        if (this.data.perfilActivoId) {
            this.managers.profile.actualizarPerfilActivo();
        }
        
        UI.updateCounters(this.data);
    }

    setupEventListeners() {
        // Configurar listeners después de que todo esté cargado
        setTimeout(() => {
            // Calcular precio por kg automáticamente
            const precioTotal = document.getElementById('precioTotal');
            const pesoRollo = document.getElementById('pesoRollo');
            
            if (precioTotal) {
                precioTotal.addEventListener('input', () => {
                    this.calcularPrecioPorKg();
                });
            }
            if (pesoRollo) {
                pesoRollo.addEventListener('input', () => {
                    this.calcularPrecioPorKg();
                });
            }

            // Listener para el factor de amortización
            const costoImpresora = document.getElementById('costoImpresora');
            const tiempoAmortizacion = document.getElementById('tiempoAmortizacion');
            
            if (costoImpresora && this.managers.profile) {
                costoImpresora.addEventListener('input', () => {
                    this.managers.profile.calcularFactorAmortizacion();
                });
            }
            if (tiempoAmortizacion && this.managers.profile) {
                tiempoAmortizacion.addEventListener('input', () => {
                    this.managers.profile.calcularFactorAmortizacion();
                });
            }
        }, 300);
    }

    calcularPrecioPorKg() {
        const precioTotal = parseFloat(document.getElementById('precioTotal').value) || 0;
        const pesoRollo = parseFloat(document.getElementById('pesoRollo').value) || 1;
        const precioPorKg = precioTotal / pesoRollo;
        const precioPorKgElement = document.getElementById('precioPorKg');
        if (precioPorKgElement) {
            precioPorKgElement.value = precioPorKg.toFixed(2);
        }
    }

    updateDbStatus(type, text) {
        UI.updateDbStatus(type, text);
    }

    getDbStatusText() {
        return storageManager.useIndexedDB ? '💾 IndexedDB' : '📁 localStorage';
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new App();
    await app.init();
});

// Funciones globales para compatibilidad con HTML
function showTab(tabName) {
    UI.showTab(tabName);
}
