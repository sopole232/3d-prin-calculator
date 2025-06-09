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
            lista.innerHTML = '<p>No hay filamentos registrados</p>';
            return;
        }

        lista.innerHTML = this.data.filamentos.map(filament => `
            <div class="filament-item">
                <div>
                    <strong>${filament.nombre}</strong> (${filament.tipo})
                    <br><small>Color: ${filament.color || 'N/A'} | ${filament.precioPorKg.toFixed(2)} €/kg | ${filament.peso}kg</small>
                    <br><small>Dificultad: ${filament.dificultad}/10 | Desgaste: ${filament.desgaste}/10</small>
                    ${filament.urlCompra ? `<br><small>🔗 <a href="${filament.urlCompra}" target="_blank" style="color: #007bff; text-decoration: none;">Ver en tienda</a></small>` : ''}
                </div>
                <div>
                    ${filament.urlCompra ? `<button class="btn" onclick="window.open('${filament.urlCompra}', '_blank')" title="Abrir enlace de compra">🔗</button>` : ''}
                    <button class="btn" onclick="app.managers.filament.editar(${filament.id})">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="app.managers.filament.eliminar(${filament.id})">🗑️</button>
                </div>
            </div>
        `).join('');
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
