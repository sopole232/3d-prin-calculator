class DataManager {
    static async exportar() {
        try {
            const datos = await storageManager.cargarTodo();
            datos.fecha = new Date().toLocaleString('es-ES');
            datos.version = '2.0.0';
            datos.tipoBaseDatos = 'localStorage (auto-guardado)';
            
            // Usar exportación manual del file storage
            if (window.fileStorageManager) {
                await window.fileStorageManager.exportarManual(datos);
            } else {
                // Fallback tradicional
                const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup_completo_impresion3d_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
            UI.showAlert('✅ Datos exportados correctamente');
            
        } catch (error) {
            console.error('Error exportando datos:', error);
            UI.showAlert('❌ Error al exportar los datos');
        }
    }

    static async importar() {
        try {
            let datos = null;
            
            // Usar importación manual del file storage
            if (window.fileStorageManager) {
                datos = await window.fileStorageManager.importarManual();
            } else {
                // Fallback tradicional
                datos = await new Promise((resolve) => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = function(event) {
                        const file = event.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                try {
                                    const data = JSON.parse(e.target.result);
                                    resolve(data);
                                } catch (error) {
                                    UI.showAlert('❌ Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.');
                                    resolve(null);
                                }
                            };
                            reader.readAsText(file);
                        } else {
                            resolve(null);
                        }
                    };
                    input.click();
                });
            }
            
            if (!datos) return; // Usuario canceló o error
            
            const confirmMessage = `¿Estás seguro de importar estos datos?

Tipo: ${datos.tipoBaseDatos || 'Desconocido'}
Fecha: ${datos.fecha || 'No disponible'}
Versión: ${datos.version || 'No disponible'}

Datos a importar:
• Filamentos: ${datos.filamentos?.length || 0}
• Impresoras: ${datos.perfilesCostos?.length || 0}
• Histórico: ${datos.historico?.length || 0}

⚠️ Se sobrescribirán todos los datos actuales.`;
            
            if (UI.showConfirm(confirmMessage)) {
                // Actualizar datos de la aplicación
                if (datos.filamentos) app.data.filamentos = datos.filamentos;
                if (datos.perfilesCostos) app.data.perfilesCostos = datos.perfilesCostos;
                if (datos.impresoras) app.data.impresoras = datos.impresoras;
                if (datos.historico) app.data.historico = datos.historico;
                if (datos.configuracion) app.data.configuracion = datos.configuracion;
                if (datos.perfilActivoId) app.data.perfilActivoId = datos.perfilActivoId;
                
                // Guardar automáticamente
                await app.save();
                
                // Actualizar interfaz
                app.updateAllDisplays();
                
                UI.showAlert('✅ Datos importados y guardados automáticamente');
            }
        } catch (error) {
            console.error('Error importando datos:', error);
            UI.showAlert('❌ Error al importar los datos');
        }
    }

    static async limpiarTodo() {
        const confirmMessage = `⚠️ ¿Estás ABSOLUTAMENTE SEGURO de que quieres ELIMINAR TODOS LOS DATOS?

Esto eliminará PERMANENTEMENTE:
• Todos los filamentos registrados
• Todas las impresoras
• Todos los perfiles de costos
• Todo el histórico de cálculos
• Toda la configuración personalizada

Esta acción NO se puede deshacer.

¿Continuar?`;

        if (UI.showConfirm(confirmMessage)) {
            try {
                // Limpiar almacenamiento
                await storageManager.limpiarTodo();
                
                // Reinicializar datos de la aplicación
                app.data = {
                    filamentos: storageManager.getDefaultFilaments(),
                    impresoras: [],
                    perfilesCostos: [],
                    historico: [],
                    configuracion: storageManager.getDefaultConfig(),
                    perfilActivoId: null
                };
                
                // Guardar automáticamente
                await app.save();
                
                // Actualizar interfaz
                app.updateAllDisplays();
                
                // Limpiar perfil activo
                const nombrePerfilActivo = document.getElementById('nombrePerfilActivo');
                const resumenPerfilActivo = document.getElementById('resumenPerfilActivo');
                if (nombrePerfilActivo) nombrePerfilActivo.textContent = 'Ninguno seleccionado';
                if (resumenPerfilActivo) resumenPerfilActivo.innerHTML = '';
                
                UI.showAlert('🗑️ Todos los datos han sido eliminados y guardado automáticamente');
                
            } catch (error) {
                console.error('Error limpiando datos:', error);
                UI.showAlert('❌ Error al limpiar los datos');
            }
        }
    }

    static async crearBackupAutomatico() {
        // Ahora maneja storageManager directamente
        if (window.app && window.app.data) {
            storageManager.crearBackupAutomatico(window.app.data);
        }
    }

    static mostrarInfoBackup() {
        const backupInfo = storageManager.getBackupInfo();
        
        if (backupInfo.exists) {
            UI.showAlert(`📦 Información del Backup Automático

Último backup: ${backupInfo.date}
Tamaño: ${backupInfo.size}

Los datos se guardan automáticamente cada 30 segundos en localStorage.
Se crean backups automáticos cada 5 minutos.`);
        } else {
            UI.showAlert(`📦 Información del Backup

No hay backups automáticos disponibles.
Los datos se guardan automáticamente en localStorage cada 30 segundos.`);
        }
    }

    static exportarBackupManual() {
        try {
            storageManager.exportarBackupManual();
            UI.showAlert('✅ Backup manual descargado correctamente');
        } catch (error) {
            console.error('Error exportando backup manual:', error);
            UI.showAlert('❌ Error al exportar el backup manual');
        }
    }
}

// Funciones globales para compatibilidad con HTML
function exportarDatos() {
    DataManager.exportar();
}

function importarDatos() {
    DataManager.importar();
}

// Auto-guardado cada 30 segundos
setInterval(() => {
    if (window.app && window.app.data) {
        storageManager.autoSave();
    }
}, 30000);

// Crear backup automático cada 5 minutos
setInterval(() => {
    if (window.app) {
        DataManager.crearBackupAutomatico();
    }
}, 300000);
