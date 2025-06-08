class UI {
    static init() {
        console.log('🎨 Inicializando UI...');
        this.setupTabNavigation();
        this.setupAlerts();
    }

    static setupTabNavigation() {
        // Configurar navegación de pestañas
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const onclick = tab.getAttribute('onclick');
                if (onclick) {
                    const match = onclick.match(/showTab\('([^']+)'\)/);
                    if (match) {
                        this.showTab(match[1]);
                    }
                }
            });
        });
    }

    static setupAlerts() {
        // Configurar sistema de alertas básico
        if (!window.alert) {
            window.alert = (message) => {
                console.log('ALERT:', message);
            };
        }
    }

    static showTab(tabName) {
        console.log(`📱 Cambiando a pestaña: ${tabName}`);

        // Ocultar todas las pestañas
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Desactivar todos los botones de pestaña
        const tabButtons = document.querySelectorAll('.tab');
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });

        // Mostrar la pestaña seleccionada
        const targetContent = document.getElementById(tabName);
        if (targetContent) {
            targetContent.classList.add('active');
        } else {
            console.error(`❌ Pestaña ${tabName} no encontrada`);
        }

        // Activar el botón correspondiente
        const targetButton = Array.from(tabButtons).find(button => {
            const onclick = button.getAttribute('onclick');
            return onclick && onclick.includes(tabName);
        });
        
        if (targetButton) {
            targetButton.classList.add('active');
        }

        // Actualizar displays específicos si es necesario
        if (tabName === 'configuracion' && window.app?.managers?.config) {
            setTimeout(() => {
                window.app.managers.config.updateDisplay();
            }, 100);
        }
    }

    static showAlert(message) {
        // Usar alert nativo primero, luego custom
        alert(message);
        
        // Crear alerta visual mejorada
        const alertDiv = document.createElement('div');
        alertDiv.className = 'custom-alert';
        alertDiv.innerHTML = `
            <div class="alert-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        // Agregar estilos si no existen
        if (!document.getElementById('alert-styles')) {
            const style = document.createElement('style');
            style.id = 'alert-styles';
            style.textContent = `
                .custom-alert {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #bbb;
                    border: 1px solid #aaa;
                    border-radius: 8px;
                    padding: 15px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                    max-width: 400px;
                    animation: slideIn 0.3s ease;
                }
                .alert-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                }
                .alert-content button {
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    color: #666;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(alertDiv);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
        
        console.log('📢 Alert:', message);
    }

    static showConfirm(message) {
        return confirm(message);
    }

    static updateScale(type, value) {
        const valueElements = {
            'dificultad': 'dificultadValue',
            'desgaste': 'desgasteValue'
        };
        
        const elementId = valueElements[type];
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value;
            }
        }
    }

    static updateCounters(data) {
        const counters = {
            'contadorFilamentos': data.filamentos?.length || 0,
            'contadorImpresoras': data.perfilesCostos?.length || 0,
            'contadorCalculos': data.historico?.length || 0
        };

        Object.entries(counters).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Actualizar fecha
        const fechaElement = document.getElementById('fechaActualizacion');
        if (fechaElement) {
            fechaElement.textContent = new Date().toLocaleString('es-ES');
        }
    }

    static updateDbStatus(type, text) {
        const statusElement = document.getElementById('dbStatus');
        if (statusElement) {
            statusElement.textContent = text;
            statusElement.className = `db-status ${type}`;
        }
    }
}

// Funciones globales
window.showTab = function(tabName) {
    UI.showTab(tabName);
};

window.updateScale = function(type, value) {
    UI.updateScale(type, value);
};
