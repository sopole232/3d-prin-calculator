class UI {
    static init() {
        console.log('🎨 UI inicializada');
        this.setupTabListeners();
        this.updateCounters();
        this.updateDatetime();
    }

    static setupTabListeners() {
        // Los listeners de tabs se configuran desde el HTML directamente
        console.log('📋 Tab listeners configurados');
    }

    static showTab(tabName) {
        // Ocultar todas las pestañas
        const allTabs = document.querySelectorAll('.tab-content');
        const allTabButtons = document.querySelectorAll('.tab');
        
        allTabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        allTabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Mostrar la pestaña seleccionada
        const selectedTab = document.getElementById(tabName);
        const selectedButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
        
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
        
        console.log(`📱 Mostrando pestaña: ${tabName}`);
    }

    static showAlert(message) {
        alert(message);
    }

    static showConfirm(message) {
        return confirm(message);
    }    static updateScale(type, value) {
        if (type === 'dificultad') {
            const element = document.getElementById('dificultadValue');
            if (element) {
                element.textContent = value;
                element.className = 'scale-value ' + (value <= 3 ? 'scale-success' : value <= 6 ? 'scale-warning' : 'scale-danger');
            }
        } else if (type === 'desgaste') {
            const element = document.getElementById('desgasteValue');
            if (element) {
                element.textContent = value;
                element.className = 'scale-value ' + (value <= 3 ? 'scale-success' : value <= 6 ? 'scale-warning' : 'scale-danger');
            }
        }
    }

    static updateCounters(data) {
        if (!data) return;
        
        const contadorFilamentos = document.getElementById('contadorFilamentos');
        const contadorImpresoras = document.getElementById('contadorImpresoras');
        const contadorCalculos = document.getElementById('contadorCalculos');
        
        if (contadorFilamentos) {
            contadorFilamentos.textContent = data.filamentos?.length || 0;
        }
        
        if (contadorImpresoras) {
            contadorImpresoras.textContent = data.perfilesCostos?.length || 0;
        }
        
        if (contadorCalculos) {
            contadorCalculos.textContent = data.historico?.length || 0;
        }
    }

    static updateDatetime() {
        const fechaElement = document.getElementById('fechaActualizacion');
        if (fechaElement) {
            fechaElement.textContent = new Date().toLocaleString('es-ES');
        }
    }

    static updateDbStatus(type, text) {
        const statusElement = document.getElementById('dbStatus');
        if (statusElement) {
            statusElement.textContent = text;
            statusElement.className = `db-status db-status-${type}`;
        }
    }
}

// Funciones globales para compatibilidad
function showTab(tabName) {
    UI.showTab(tabName);
}

window.UI = UI;
