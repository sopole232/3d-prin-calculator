// Este archivo ya no es necesario porque la funcionalidad está integrada en profiles.js
// Mantenemos solo funciones de compatibilidad hacia atrás

// Funciones de compatibilidad para el archivo test.html si se sigue usando
function agregarImpresora() {
    console.warn('agregarImpresora() está deprecado. Usa crearPerfil() en su lugar.');
    if (window.app && window.app.managers.profile) {
        window.app.managers.profile.crear();
    }
}

function mostrarImpresoras() {
    console.warn('mostrarImpresoras() está deprecado. Usa la funcionalidad de perfiles.');
    if (window.app && window.app.managers.profile) {
        window.app.managers.profile.updateDisplay();
    }
}

function editarImpresora(id) {
    console.warn('editarImpresora() está deprecado. Usa editarPerfil() en su lugar.');
    if (window.app && window.app.managers.profile) {
        window.app.managers.profile.editar(id);
    }
}

function eliminarImpresora(id) {
    console.warn('eliminarImpresora() está deprecado. Usa eliminarPerfil() en su lugar.');
    if (window.app && window.app.managers.profile) {
        window.app.managers.profile.eliminar(id);
    }
}

function actualizarSelectImpresoras() {
    console.warn('actualizarSelectImpresoras() está deprecado. Usa la funcionalidad de perfiles.');
    if (window.app && window.app.managers.profile) {
        window.app.managers.profile.updateSelects();
    }
}

// Clase vacía para mantener compatibilidad
class PrinterManager {
    constructor(data) {
        console.warn('PrinterManager está deprecado. Usa ProfileManager en su lugar.');
        this.data = data;
    }

    updateDisplay() {
        // Redirigir a ProfileManager
        if (window.app && window.app.managers.profile) {
            window.app.managers.profile.updateDisplay();
        }
    }
}
