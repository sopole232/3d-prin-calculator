class ProfileManager {
    constructor(data) {
        this.data = data;
        this.setupEventListeners();
    }

    setupEventListeners() {
        setTimeout(() => {
            // Listener para cálculo automático del factor de amortización
            const costoImpresora = document.getElementById('costoImpresora');
            const tiempoAmortizacion = document.getElementById('tiempoAmortizacion');
            const bufferErrores = document.getElementById('bufferErroresPerfil');
            
            if (costoImpresora) {
                costoImpresora.addEventListener('input', () => this.calcularFactorAmortizacion());
            }
            if (tiempoAmortizacion) {
                tiempoAmortizacion.addEventListener('input', () => this.calcularFactorAmortizacion());
            }
            if (bufferErrores) {
                bufferErrores.addEventListener('input', () => this.mostrarEstadisticasAmortizacion());
            }
            
            console.log('🖨️ ProfileManager event listeners configurados');
        }, 100);
    }

    crear() {
        const perfil = {
            id: Date.now(),
            nombre: document.getElementById('nombrePerfil').value,
            modelo: document.getElementById('modeloPerfil').value,
            costoImpresora: parseFloat(document.getElementById('costoImpresora').value) || 800,
            horasAmortizacion: parseFloat(document.getElementById('tiempoAmortizacion').value) || 1000,
            factorAmortizacion: parseFloat(document.getElementById('factorAmortizacionPerfil').value) || 0.8,
            potencia: parseFloat(document.getElementById('potenciaPerfil').value) || 200,
            costoElectricidad: parseFloat(document.getElementById('costoElectricidadPerfil').value) || 0.15,
            costoMantenimiento: parseFloat(document.getElementById('costoMantenimientoPerfil').value) || 60,
            intervaloMantenimiento: parseFloat(document.getElementById('intervaloMantenimientoPerfil').value) || 250,
            costoMantenimientoPorHora: 0,            desperdicioMaterial: parseFloat(document.getElementById('desperdicioMaterialPerfil').value) || 5,
            recargoMultiMaterial: parseFloat(document.getElementById('recargoMultiMaterialPerfil').value) || 15,
            recargoMultiPiezas: parseFloat(document.getElementById('recargoMultiPiezasPerfil').value) || 10,
            bufferErrores: parseFloat(document.getElementById('bufferErroresPerfil').value) || 2,
            fechaCreacion: new Date().toLocaleString('es-ES')
        };

        if (!perfil.nombre) {
            UI.showAlert('Por favor ingresa el nombre de la impresora');
            return;
        }

        // Calcular costo de mantenimiento por hora
        perfil.costoMantenimientoPorHora = perfil.costoMantenimiento / perfil.intervaloMantenimiento;

        this.data.perfilesCostos.push(perfil);
        app.save();
        this.limpiarFormulario();
        this.updateDisplay();
        this.updateSelects();
        
        UI.showAlert('✅ Perfil de impresora agregado correctamente');
    }

    editar(id) {
        const perfil = this.data.perfilesCostos.find(p => p.id === id);
        if (!perfil) return;

        // Rellenar formulario
        document.getElementById('nombrePerfil').value = perfil.nombre;
        document.getElementById('modeloPerfil').value = perfil.modelo;
        document.getElementById('costoImpresora').value = perfil.costoImpresora;
        document.getElementById('tiempoAmortizacion').value = perfil.horasAmortizacion;
        document.getElementById('factorAmortizacionPerfil').value = perfil.factorAmortizacion;
        document.getElementById('potenciaPerfil').value = perfil.potencia;
        document.getElementById('costoElectricidadPerfil').value = perfil.costoElectricidad;
        document.getElementById('costoMantenimientoPerfil').value = perfil.costoMantenimiento;
        document.getElementById('intervaloMantenimientoPerfil').value = perfil.intervaloMantenimiento;        document.getElementById('desperdicioMaterialPerfil').value = perfil.desperdicioMaterial;
        document.getElementById('recargoMultiMaterialPerfil').value = perfil.recargoMultiMaterial;
        document.getElementById('recargoMultiPiezasPerfil').value = perfil.recargoMultiPiezas || 10;
        document.getElementById('bufferErroresPerfil').value = perfil.bufferErrores;

        // Eliminar perfil para actualizar
        this.data.perfilesCostos = this.data.perfilesCostos.filter(p => p.id !== id);
        app.save();
        this.updateDisplay();
        this.updateSelects();
        
        UI.showAlert('📝 Perfil cargado para edición');
    }

    eliminar(id) {
        if (UI.showConfirm('¿Estás seguro de eliminar este perfil de impresora?')) {
            this.data.perfilesCostos = this.data.perfilesCostos.filter(p => p.id !== id);
            
            // Si era el perfil activo, limpiarlo
            if (this.data.perfilActivoId === id) {
                this.data.perfilActivoId = null;
                this.limpiarPerfilActivo();
            }
            
            app.save();
            this.updateDisplay();
            this.updateSelects();
            UI.showAlert('🗑️ Perfil eliminado');
        }
    }

    seleccionar(id) {
        this.data.perfilActivoId = id;
        app.save();
        this.actualizarPerfilActivo();
        UI.showAlert('✅ Perfil seleccionado');
    }

    cambiarPerfilActivo() {
        const perfilId = document.getElementById('perfilSeleccionado').value;
        if (perfilId) {
            this.data.perfilActivoId = parseInt(perfilId);
            app.save();
            this.actualizarPerfilActivo();
        } else {
            this.data.perfilActivoId = null;
            this.limpiarPerfilActivo();
        }
    }

    actualizarPerfilActivo() {
        const nombreElement = document.getElementById('nombrePerfilActivo');
        const resumenElement = document.getElementById('resumenPerfilActivo');
        
        if (!this.data.perfilActivoId) {
            this.limpiarPerfilActivo();
            return;
        }
        
        const perfil = this.data.perfilesCostos.find(p => p.id === this.data.perfilActivoId);
        if (!perfil) {
            this.limpiarPerfilActivo();
            return;
        }
        
        if (nombreElement) {
            nombreElement.textContent = perfil.nombre;
        }
        
        if (resumenElement) {
            resumenElement.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 10px;">
                    <div><strong>Modelo:</strong> ${perfil.modelo}</div>
                    <div><strong>Amortización:</strong> €${perfil.factorAmortizacion.toFixed(4)}/h</div>
                    <div><strong>Potencia:</strong> ${perfil.potencia}W</div>
                    <div><strong>Electricidad:</strong> €${perfil.costoElectricidad}/kWh</div>
                    <div><strong>Mantenimiento:</strong> €${perfil.costoMantenimiento} cada ${perfil.intervaloMantenimiento}h</div>
                    <div><strong>Factor seguridad:</strong> x${perfil.bufferErrores}</div>
                </div>
            `;
        }
        
        // Actualizar select en calculadora
        const selectCalculadora = document.getElementById('perfilSeleccionado');
        if (selectCalculadora) {
            selectCalculadora.value = this.data.perfilActivoId;
        }
    }

    limpiarPerfilActivo() {
        const nombreElement = document.getElementById('nombrePerfilActivo');
        const resumenElement = document.getElementById('resumenPerfilActivo');
        
        if (nombreElement) {
            nombreElement.textContent = 'Ninguno seleccionado';
        }
        
        if (resumenElement) {
            resumenElement.innerHTML = '';
        }
    }

    calcularFactorAmortizacion() {
        const costoImpresora = parseFloat(document.getElementById('costoImpresora').value) || 0;
        const tiempoAmortizacion = parseFloat(document.getElementById('tiempoAmortizacion').value) || 1;
        
        const factor = costoImpresora / tiempoAmortizacion;
        
        const factorElement = document.getElementById('factorAmortizacionPerfil');
        if (factorElement) {
            factorElement.value = factor.toFixed(4);
        }
        
        this.mostrarEstadisticasAmortizacion();
    }

    mostrarEstadisticasAmortizacion() {
        const container = document.getElementById('estadisticasAmortizacion');
        if (!container) return;
        
        const costoImpresora = parseFloat(document.getElementById('costoImpresora').value) || 800;
        const tiempoAmortizacion = parseFloat(document.getElementById('tiempoAmortizacion').value) || 1000;
        const bufferErrores = parseFloat(document.getElementById('bufferErroresPerfil').value) || 2;
        const factor = costoImpresora / tiempoAmortizacion;
        
        // Ejemplos de cálculo
        const ejemplos = [
            { horas: 1, descripcion: '1 hora' },
            { horas: 5, descripcion: '5 horas' },
            { horas: 10, descripcion: '10 horas' },
            { horas: 24, descripcion: '1 día (24h)' }
        ];
        
        let estadisticas = `
            <h6>📊 Estadísticas de Amortización</h6>
            <p><strong>Factor calculado:</strong> €${factor.toFixed(4)} por hora de impresión</p>
            <p><strong>Factor de seguridad:</strong> x${bufferErrores} (se aplica solo a costos variables)</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-top: 10px;">
        `;
        
        ejemplos.forEach(ejemplo => {
            const costo = factor * ejemplo.horas;
            estadisticas += `
                <div style="text-align: center; padding: 8px; background: white; border-radius: 5px;">
                    <strong>${ejemplo.descripcion}</strong><br>
                    <span style="color: #007bff;">€${costo.toFixed(2)}</span>
                </div>
            `;
        });
        
        estadisticas += `
            </div>
            <p style="margin-top: 10px; font-size: 0.9em; color: #6c757d;">
                💡 La amortización se calcula sobre las horas reales de impresión. 
                Con ${tiempoAmortizacion} horas totales, la impresora se habrá pagado a sí misma.
            </p>
        `;
        
        container.innerHTML = estadisticas;
    }

    updateDisplay() {
        const lista = document.getElementById('listaPerfiles');
        if (!lista) return;

        if (this.data.perfilesCostos.length === 0) {
            lista.innerHTML = '<p>No hay perfiles registrados. Agrega uno arriba para comenzar.</p>';
            return;
        }

        let html = '';
        this.data.perfilesCostos.forEach(perfil => {
            const esActivo = this.data.perfilActivoId === perfil.id;
            
            html += `
                <div class="profile-item ${esActivo ? 'active-profile' : ''}">
                    <div style="flex: 1;">
                        <h4>${perfil.nombre} ${esActivo ? '✅ (ACTIVO)' : ''}</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 8px 0;">
                            <div><strong>Modelo:</strong> ${perfil.modelo}</div>
                            <div><strong>Costo impresora:</strong> €${perfil.costoImpresora}</div>
                            <div><strong>Amortización:</strong> €${perfil.factorAmortizacion.toFixed(4)}/h</div>
                            <div><strong>Potencia:</strong> ${perfil.potencia}W</div>
                            <div><strong>Electricidad:</strong> €${perfil.costoElectricidad}/kWh</div>
                            <div><strong>Mantenimiento:</strong> €${perfil.costoMantenimiento} cada ${perfil.intervaloMantenimiento}h</div>                            <div><strong>Desperdicio:</strong> ${perfil.desperdicioMaterial}%</div>
                            <div><strong>Recargo multi-material:</strong> ${perfil.recargoMultiMaterial}%</div>
                            <div><strong>Recargo multi-piezas:</strong> ${perfil.recargoMultiPiezas || 10}%</div>
                            <div><strong>Factor seguridad:</strong> x${perfil.bufferErrores}</div>
                        </div>
                        <small style="color: #6c757d;">Creado: ${perfil.fechaCreacion}</small>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px; margin-left: 15px;">
                        ${!esActivo ? `<button class="btn btn-small" onclick="seleccionarPerfil(${perfil.id})" title="Usar este perfil">✅ Activar</button>` : ''}
                        <button class="btn btn-small" onclick="editarPerfil(${perfil.id})" title="Editar perfil">✏️ Editar</button>
                        <button class="btn btn-small btn-danger" onclick="eliminarPerfil(${perfil.id})" title="Eliminar perfil">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        });

        lista.innerHTML = html;
    }

    updateSelects() {
        const select = document.getElementById('perfilSeleccionado');
        if (!select) return;

        const valorActual = select.value;
        select.innerHTML = '<option value="">Selecciona un perfil</option>';
        
        this.data.perfilesCostos.forEach(perfil => {
            const option = document.createElement('option');
            option.value = perfil.id;
            option.textContent = `${perfil.nombre} (${perfil.modelo})`;
            if (this.data.perfilActivoId === perfil.id) {
                option.textContent += ' ✅';
            }
            select.appendChild(option);
        });

        // Restaurar valor si existe
        if (valorActual) {
            select.value = valorActual;
        } else if (this.data.perfilActivoId) {
            select.value = this.data.perfilActivoId;
        }
    }

    limpiarFormulario() {        const campos = [
            'nombrePerfil', 'modeloPerfil', 'costoImpresora', 'tiempoAmortizacion',
            'factorAmortizacionPerfil', 'potenciaPerfil', 'costoElectricidadPerfil',
            'costoMantenimientoPerfil', 'intervaloMantenimientoPerfil', 
            'desperdicioMaterialPerfil', 'recargoMultiMaterialPerfil', 'recargoMultiPiezasPerfil', 'bufferErroresPerfil'
        ];
        
        campos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                if (elemento.type === 'number') {
                    elemento.value = elemento.getAttribute('value') || '';
                } else {
                    elemento.value = '';
                }
            }
        });
        
        // Limpiar estadísticas
        const container = document.getElementById('estadisticasAmortizacion');
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Funciones globales para compatibilidad con HTML
function crearPerfil() {
    if (window.app && window.app.managers.profile) {
        window.app.managers.profile.crear();
    } else {
        console.error('❌ ProfileManager no disponible');
    }
}

function editarPerfil(id) {
    if (window.app && window.app.managers.profile) {
        window.app.managers.profile.editar(id);
    } else {
        console.error('❌ ProfileManager no disponible');
    }
}

function eliminarPerfil(id) {
    if (window.app && window.app.managers.profile) {
        window.app.managers.profile.eliminar(id);
    } else {
        console.error('❌ ProfileManager no disponible');
    }
}

function seleccionarPerfil(id) {
    if (window.app && window.app.managers.profile) {
        window.app.managers.profile.seleccionar(id);
    } else {
        console.error('❌ ProfileManager no disponible');
    }
}

function cambiarPerfilActivo() {
    if (window.app && window.app.managers.profile) {
        window.app.managers.profile.cambiarPerfilActivo();
    } else {
        console.error('❌ ProfileManager no disponible');
    }
}

function calcularFactorAmortizacion() {
    if (window.app && window.app.managers.profile) {
        window.app.managers.profile.calcularFactorAmortizacion();
    } else {
        console.error('❌ ProfileManager no disponible');
    }
}

function mostrarEstadisticasAmortizacion() {
    if (window.app && window.app.managers.profile) {
        window.app.managers.profile.mostrarEstadisticasAmortizacion();
    } else {
        console.error('❌ ProfileManager no disponible');
    }
}
