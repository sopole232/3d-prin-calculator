class FileStorageManager {
    constructor() {
        this.enabled = false; // Desactivado por defecto
        this.useFileAPI = 'showSaveFilePicker' in window;
    }

    async guardar(data) {
        // No hacer nada automáticamente - solo para exportación manual
        console.log('📁 FileStorageManager: guardado automático desactivado');
        return false;
    }

    async cargar() {
        // Solo para importación manual
        console.log('📁 FileStorageManager: carga automática desactivada');
        return null;
    }

    async exportarManual(data) {
        try {
            console.log('💾 Exportando datos manualmente...');
            
            const dataWithMeta = {
                ...data,
                exportDate: new Date().toISOString(),
                version: '2.0.0',
                type: 'manual-export'
            };

            const jsonData = JSON.stringify(dataWithMeta, null, 2);
            
            // Siempre usar descarga automática para simplicidad
            this.descargarArchivo(jsonData, `printer-export-${new Date().toISOString().split('T')[0]}.json`);
            
            console.log('✅ Datos exportados manualmente');
            return true;
            
        } catch (error) {
            console.error('❌ Error exportando manualmente:', error);
            throw error;
        }
    }

    async importarManual() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = JSON.parse(e.target.result);
                            resolve(data);
                        } catch (error) {
                            console.error('Error parseando archivo:', error);
                            alert('❌ Error al leer el archivo JSON');
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

    descargarArchivo(jsonData, filename) {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
}

// Instancia global
const fileStorageManager = new FileStorageManager();
window.fileStorageManager = fileStorageManager;
