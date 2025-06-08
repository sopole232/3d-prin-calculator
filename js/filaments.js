class FilamentManager {
    constructor(data) {
        this.data = data;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Usar setTimeout para asegurar que los elementos están disponibles
        setTimeout(() => {
            const precioTotal = document.getElementById('precioTotal');
            const pesoRollo = document.getElementById('pesoRollo');
            
            if (precioTotal) {
                precioTotal.addEventListener('input', () => this.calcularPrecioPorKg());
            }
            if (pesoRollo) {
                pesoRollo.addEventListener('input', () => this.calcularPrecioPorKg());
            }
        }, 100);
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

    agregar() {
        const filamento = {
            id: Date.now(),
            nombre: document.getElementById('nombreFilamento').value,
            tipo: document.getElementById('tipoMaterial').value,
            color: document.getElementById('colorFilamento').value,
            peso: parseFloat(document.getElementById('pesoRollo').value),
            precioTotal: parseFloat(document.getElementById('precioTotal').value),
            precioPorKg: parseFloat(document.getElementById('precioPorKg').value),
            dificultad: parseInt(document.getElementById('dificultadImpresion').value),
            desgaste: parseInt(document.getElementById('desgasteImpresora').value),
            requiereSecado: document.getElementById('requiereSecado').value === 'si',
            urlCompra: document.getElementById('urlFilamento').value.trim() || '', // Nuevo campo
            fechaCreacion: new Date().toLocaleString('es-ES')
        };

        if (!filamento.nombre || !filamento.precioTotal) {
            UI.showAlert('Por favor completa al menos el nombre y el precio total');
            return;
        }

        // Validar URL si se proporciona
        if (filamento.urlCompra && !this.validarURL(filamento.urlCompra)) {
            UI.showAlert('La URL proporcionada no es válida. Corrige el formato o déjala vacía.');
            return;
        }

        this.data.filamentos.push(filamento);
        app.save();
        this.limpiarFormulario();
        this.updateDisplay();
        this.updateSelects();
        UI.showAlert('✅ Filamento agregado correctamente');
    }

    validarURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    editar(id) {
        const filamento = this.data.filamentos.find(f => f.id === id);
        if (!filamento) return;

        // Rellenar formulario con datos existentes
        document.getElementById('nombreFilamento').value = filamento.nombre;
        document.getElementById('tipoMaterial').value = filamento.tipo;
        document.getElementById('colorFilamento').value = filamento.color || '';
        document.getElementById('pesoRollo').value = filamento.peso;
        document.getElementById('precioTotal').value = filamento.precioTotal;
        document.getElementById('precioPorKg').value = filamento.precioPorKg;
        document.getElementById('dificultadImpresion').value = filamento.dificultad;
        document.getElementById('desgasteImpresora').value = filamento.desgaste;
        document.getElementById('requiereSecado').value = filamento.requiereSecado ? 'si' : 'no';
        document.getElementById('urlFilamento').value = filamento.urlCompra || ''; // Nuevo campo

        // Actualizar valores mostrados
        UI.updateScale('dificultad', filamento.dificultad);
        UI.updateScale('desgaste', filamento.desgaste);

        // Eliminar filamento para actualizar
        this.data.filamentos = this.data.filamentos.filter(f => f.id !== id);
        app.save();
        this.updateDisplay();
        this.updateSelects();
        
        UI.showAlert('📝 Filamento cargado para edición');
    }

    eliminar(id) {
        if (UI.showConfirm('¿Estás seguro de eliminar este filamento?')) {
            this.data.filamentos = this.data.filamentos.filter(f => f.id !== id);
            app.save();
            this.updateDisplay();
            this.updateSelects();
            UI.showAlert('🗑️ Filamento eliminado');
        }
    }

    updateDisplay() {
        const lista = document.getElementById('listaFilamentos');
        if (!lista) return;

        if (this.data.filamentos.length === 0) {
            lista.innerHTML = '<p>No hay filamentos registrados. Agrega uno arriba para comenzar.</p>';
            return;
        }

        let html = '';        this.data.filamentos.forEach(filamento => {
            // Calcular indicadores visuales para dificultad y desgaste usando colores galácticos
            const dificultadColor = filamento.dificultad <= 3 ? 'var(--color-success)' : filamento.dificultad <= 6 ? 'var(--color-warning)' : 'var(--color-danger)';
            const desgasteColor = filamento.desgaste <= 3 ? 'var(--color-success)' : filamento.desgaste <= 6 ? 'var(--color-warning)' : 'var(--color-danger)';
            
            const dificultadTexto = filamento.dificultad <= 3 ? 'Fácil' : filamento.dificultad <= 6 ? 'Moderada' : 'Difícil';
            const desgasteTexto = filamento.desgaste <= 3 ? 'Bajo' : filamento.desgaste <= 6 ? 'Moderado' : 'Alto';

            // Calcular multiplicadores para mostrar al usuario
            const multiplicadorDificultad = 1 + ((filamento.dificultad - 1) / 9);
            const multiplicadorDesgaste = 1 + ((filamento.desgaste - 1) / 9 * 0.5);

            html += `
                <div class="filament-item">
                    <div style="flex: 1;">
                        <h4>${filamento.nombre}</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 8px 0;">
                            <div><strong>Tipo:</strong> ${filamento.tipo}</div>
                            ${filamento.color ? `<div><strong>Color:</strong> ${filamento.color}</div>` : ''}
                            <div><strong>Peso:</strong> ${filamento.peso}kg</div>
                            <div><strong>Precio total:</strong> €${filamento.precioTotal?.toFixed(2) || 'N/A'}</div>
                            <div><strong>Precio/kg:</strong> €${filamento.precioPorKg?.toFixed(2) || 'N/A'}</div>
                        </div>
                          <!-- Características del filamento con efectos visuales -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 10px 0; padding: 10px; background: rgba(26, 26, 46, 0.6); border-radius: 5px; border: 1px solid rgba(159, 168, 218, 0.3);">
                            <div style="text-align: center;">
                                <strong style="color: ${dificultadColor};">🎲 Dificultad: ${filamento.dificultad}/10</strong><br>
                                <small style="color: ${dificultadColor}; font-weight: bold;">${dificultadTexto}</small><br>
                                <small style="color: var(--color-cosmic-mist);">Factor errores: ×${multiplicadorDificultad.toFixed(2)}</small>
                            </div>
                            <div style="text-align: center;">
                                <strong style="color: ${desgasteColor};">⚙️ Desgaste: ${filamento.desgaste}/10</strong><br>
                                <small style="color: ${desgasteColor}; font-weight: bold;">${desgasteTexto}</small><br>
                                <small style="color: var(--color-cosmic-mist);">Factor mantenimiento: ×${multiplicadorDesgaste.toFixed(2)}</small>
                            </div>
                        </div>                          <!-- Información adicional -->
                        <div style="font-size: 0.9em; color: var(--color-cosmic-mist); margin-top: 8px;">
                            ${filamento.requiereSecado ? '<span style="color: var(--color-warning);">🌡️ Requiere secado</span>' : '<span style="color: var(--color-success);">✅ No requiere secado</span>'}
                            ${filamento.urlCompra ? `<br><a href="${filamento.urlCompra}" target="_blank" style="color: var(--color-nebula-blue);">🛒 Ver tienda</a>` : ''}
                            <br><small>Agregado: ${filamento.fechaCreacion}</small>
                        </div>
                          <!-- Explicación de efectos -->
                        <div style="margin-top: 10px; margin-bottom: 10px; padding: 8px; background: rgba(26, 26, 46, 0.6); border-radius: 4px; font-size: 0.8em; border: 1px solid rgba(159, 168, 218, 0.3); color: var(--color-cosmic-mist);">
                            <strong style="color: var(--color-nebula-blue);">💡 Efectos en el cálculo:</strong><br>
                            • <strong>Dificultad:</strong> Multiplica el factor de seguridad (más errores de impresión)<br>
                            • <strong>Desgaste:</strong> Multiplica el costo de mantenimiento de la impresora
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px; margin-left: 15px;">
                        <button class="btn btn-small" onclick="editarFilamento(${filamento.id})" title="Editar filamento">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-small btn-danger" onclick="eliminarFilamento(${filamento.id})" title="Eliminar filamento">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `;
        });

        lista.innerHTML = html;
    }

    updateSelects() {
        const select = document.getElementById('filamentoSeleccionado');
        if (!select) return;

        select.innerHTML = '<option value="">Selecciona un filamento</option>';
        
        this.data.filamentos.forEach(filament => {
            const option = document.createElement('option');
            option.value = filament.id;
            option.textContent = `${filament.nombre} (${filament.tipo}) - ${filament.precioPorKg.toFixed(2)} €/kg`;
            select.appendChild(option);
        });
    }

    limpiarFormulario() {
        const campos = [
            { id: 'nombreFilamento', valor: '' },
            { id: 'colorFilamento', valor: '' },
            { id: 'precioTotal', valor: '' },
            { id: 'precioPorKg', valor: '' },
            { id: 'pesoRollo', valor: '1' },
            { id: 'dificultadImpresion', valor: '3' },
            { id: 'desgasteImpresora', valor: '3' },
            { id: 'urlFilamento', valor: '' } // Nuevo campo
        ];

        campos.forEach(campo => {
            const elemento = document.getElementById(campo.id);
            if (elemento) elemento.value = campo.valor;
        });

        // Resetear valores mostrados en las escalas
        UI.updateScale('dificultad', 3);
        UI.updateScale('desgaste', 3);
    }

    exportarFilamentos() {
        if (this.data.filamentos.length === 0) {
            UI.showAlert('No hay filamentos para exportar');
            return;
        }

        const csvData = this.generarCSVFilamentos();
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `filamentos_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UI.showAlert('✅ Filamentos exportados a CSV');
    }

    generarCSVFilamentos() {
        const headers = [
            'Nombre', 'Tipo', 'Color', 'Peso (kg)', 'Precio Total (€)', 
            'Precio por kg (€/kg)', 'Dificultad', 'Desgaste', 'Requiere Secado', 
            'URL de Compra', 'Fecha Creación'
        ];

        const filas = this.data.filamentos.map(filament => [
            filament.nombre,
            filament.tipo,
            filament.color || '',
            filament.peso,
            filament.precioTotal.toFixed(2),
            filament.precioPorKg.toFixed(2),
            filament.dificultad,
            filament.desgaste,
            filament.requiereSecado ? 'Sí' : 'No',
            filament.urlCompra || '',
            filament.fechaCreacion
        ]);

        return [headers, ...filas]
            .map(fila => fila.map(celda => `"${celda}"`).join(','))
            .join('\n');
    }
}

// Funciones globales para compatibilidad con HTML
function agregarFilamento() {
    if (window.app && window.app.managers.filament) {
        window.app.managers.filament.agregar();
    }
}

function editarFilamento(id) {
    if (window.app && window.app.managers.filament) {
        window.app.managers.filament.editar(id);
    }
}

function eliminarFilamento(id) {
    if (window.app && window.app.managers.filament) {
        window.app.managers.filament.eliminar(id);
    }
}

function updateScale(type, value) {
    UI.updateScale(type, value);
}
