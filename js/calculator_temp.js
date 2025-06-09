// Calculator class for cost calculations - COMPLETE FIXED VERSION
class Calculator {
    constructor(data) {
        this.data = data;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Configurar valor por defecto de tarifa cuando cambie de pestaña
        setTimeout(() => {
            const tarifaOperador = document.getElementById('tarifaOperador');
            if (tarifaOperador && this.data.configuracion.tarifaOperadorDefecto) {
                tarifaOperador.value = this.data.configuracion.tarifaOperadorDefecto;
            }
            
            // Asegurar que los selectores de filamentos estén poblados
            this.inicializarSelectoresFilamentos();
        }, 200);
    }

    // Nueva función para inicializar todos los selectores de filamentos
    inicializarSelectoresFilamentos() {
        if (!this.data.filamentos || this.data.filamentos.length === 0) {
            console.warn('No hay filamentos disponibles para cargar en selectores');
            return;
        }

        // Selector principal
        const mainSelect = document.getElementById('filamentoSeleccionado');
        if (mainSelect && mainSelect.children.length <= 1) {
            this.populateFilamentSelect(mainSelect);
        }

        // Selectores de multicolor individual
        const multiSelects = document.querySelectorAll('.filamento-multicolor-individual');
        multiSelects.forEach(select => {
            if (select.children.length <= 1) {
                this.populateFilamentSelect(select);
            }
        });

        // Selectores de piezas múltiples
        const pieceSelects = document.querySelectorAll('.filamento-pieza-single, .filamento-multicolor-pieza');
        pieceSelects.forEach(select => {
            if (select.children.length <= 1) {
                this.populateFilamentSelect(select);
            }
        });
    }

    // Función auxiliar para popular un selector de filamentos
    populateFilamentSelect(select) {
        if (!select) return;
        
        const currentValue = select.value;
        select.innerHTML = '<option value="">Selecciona filamento</option>';
        
        this.data.filamentos.forEach(filament => {
            const option = document.createElement('option');
            option.value = filament.id;
            
            const colorInfo = filament.color ? ` [${filament.color}]` : '';
            option.textContent = `${filament.nombre} (${filament.tipo})${colorInfo} - ${filament.precioPorKg.toFixed(2)} €/kg`;
            
            select.appendChild(option);
        });
        
        // Restaurar valor si existía
        if (currentValue) {
            select.value = currentValue;
        }
    }

    // ========================================
    // COMPREHENSIVE CALCULATE FUNCTION WITH AUTO-PROFILE CREATION
    // ========================================
    calcular() {
        try {
            console.log('🧮 Starting calculate function...');
            
            // AUTO-CREATE DEFAULT PROFILE IF NONE EXISTS
            if (!this.data.perfilActivoId) {
                console.log('⚠️ No active printer profile found. Creating default profile...');
                
                const defaultProfile = {
                    id: Date.now().toString(),
                    nombre: 'Perfil por Defecto (Auto-creado)',
                    potencia: 200,
                    costoElectricidad: 0.15,
                    factorAmortizacion: 0.02,
                    desperdicioMaterial: 5,
                    costoMantenimiento: 60,
                    intervaloMantenimiento: 250,
                    margenGanancia: 30,
                    bufferErrores: 2,
                    recargoMultiMaterial: 15,
                    recargoMultiPiezas: 10
                };
                
                // Add to profiles and set as active
                this.data.perfilesCostos.push(defaultProfile);
                this.data.perfilActivoId = defaultProfile.id;
                
                // Save the data
                if (window.app && window.app.save) {
                    window.app.save();
                }
                
                console.log('✅ Default profile created and activated:', defaultProfile.nombre);
                UI.showAlert('Se ha creado automáticamente un perfil de impresora por defecto. Puedes configurarlo en la pestaña "Perfiles".');
            }

            const perfil = this.data.perfilesCostos.find(p => p.id === this.data.perfilActivoId);
            if (!perfil) {
                this.mostrarErroresValidacion(['No se pudo encontrar el perfil de impresora activo']);
                return;
            }

            const datosCalculo = this.obtenerDatosFormulario();
            if (!datosCalculo) {
                this.mostrarErroresValidacion(['Error al obtener los datos del formulario']);
                return;
            }

            const erroresValidacion = this.validarDatos(datosCalculo);
            if (erroresValidacion.length > 0) {
                this.mostrarErroresValidacion(erroresValidacion);
                return;
            }

            const filamento = this.data.filamentos.find(f => f.id == datosCalculo.filamentoId);
            if (!filamento) {
                this.mostrarErroresValidacion(['No se pudo encontrar el filamento seleccionado']);
                return;
            }
            
            // Calcular AMBOS métodos para comparación
            const resultadoTradicional = this.calcularCostosTradicional(perfil, filamento, datosCalculo);
            const resultado = this.calcularCostos(perfil, filamento, datosCalculo);
            
            // Agregar datos de comparación
            resultado.calculoTradicional = resultadoTradicional;
            resultado.modoComparacion = this.data.configuracion.mostrarComparacion || false;
            
            this.mostrarResultado(resultado, perfil, filamento, datosCalculo);
            this.guardarEnHistorico(resultado, perfil, filamento, datosCalculo);

            console.log('✅ Calculate function completed successfully');
            return resultado;

        } catch (error) {
            console.error('❌ Error in calculate function:', error);
            this.mostrarErroresValidacion([`Error interno: ${error.message}`]);
        }
    }

    // ========================================
    // ENHANCED ERROR DISPLAY FUNCTION
    // ========================================
    mostrarErroresValidacion(errores) {
        const contenedor = document.getElementById('resultadoCalculo');
        if (!contenedor) {
            // Fallback to alert if no result container
            UI.showAlert('Errores de validación:\n• ' + errores.join('\n• '));
            return;
        }

        contenedor.innerHTML = `
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <h4 style="color: #721c24; margin-bottom: 10px;">⚠️ Errores de Validación</h4>
                <ul style="margin: 0; padding-left: 20px;">
                    ${errores.map(error => `<li>${error}</li>`).join('')}
                </ul>
                <div style="margin-top: 15px;">
                    <button onclick="this.parentElement.parentElement.style.display='none'" 
                            style="background: #721c24; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
    }

    // ========================================
    // ENHANCED FORM DATA RETRIEVAL
    // ========================================
    obtenerDatosFormulario() {
        try {
            // Detectar si estamos usando la nueva estructura
            const tipoImpresionElement = document.getElementById('tipoImpresion');
            
            if (tipoImpresionElement) {
                // Usar nueva estructura
                return this.obtenerDatosFormularioNuevo();
            }
            
            // Mantener compatibilidad con estructura antigua
            return this.obtenerDatosFormularioLegacy();
        } catch (error) {
            console.error('Error obtaining form data:', error);
            return null;
        }
    }

    obtenerDatosFormularioNuevo() {
        try {
            const tipoImpresion = document.getElementById('tipoImpresion').value;
            
            // Usar tarifa por defecto si no hay valor específico
            const tarifaOperador = parseFloat(document.getElementById('tarifaOperador').value) || 
                                   this.data.configuracion.tarifaOperadorDefecto || 15;
            
            // Manejar tiempo de impresión 
            let tiempoHoras = 0;
            
            if (tipoImpresion === 'multiple') {
                // Para modo múltiple: sumar tiempos individuales de cada pieza
                tiempoHoras = this.calcularTiempoTotalPiezasIndividuales();
            } else {
                // Para modo individual: usar tiempo individual o general
                const tiempoIndividualHoras = parseFloat(document.getElementById('tiempoIndividualHoras')?.value) || 0;
                const tiempoIndividualMinutos = parseInt(document.getElementById('tiempoIndividualMinutos')?.value) || 0;
                
                if (tiempoIndividualHoras > 0 || tiempoIndividualMinutos > 0) {
                    // Usar tiempo individual si está disponible
                    tiempoHoras = tiempoIndividualHoras + (tiempoIndividualMinutos / 60);
                } else {
                    // Fallback a tiempo general
                    const horas = parseInt(document.getElementById('tiempoHoras')?.value) || 0;
                    const minutos = parseInt(document.getElementById('tiempoMinutos')?.value) || 0;
                    tiempoHoras = horas + (minutos / 60);
                }
            }

            // Manejar tiempo de mano de obra (solo horas + minutos)
            let tiempoManoObra = 0;
            const horasManoObra = parseInt(document.getElementById('tiempoManoObraHoras')?.value) || 0;
            const minutosManoObra = parseInt(document.getElementById('tiempoManoObraMinutos')?.value) || 0;
            tiempoManoObra = horasManoObra + (minutosManoObra / 60);

            return {
                tipoImpresion: tipoImpresion,
                filamentoId: document.getElementById('filamentoSeleccionado')?.value || '',
                cantidadGramos: parseFloat(document.getElementById('cantidadFilamento')?.value) || 0,
                tiempoHoras: tiempoHoras,
                tiempoManoObra: tiempoManoObra,
                tarifaOperador: tarifaOperador,
                tipoBoquilla: document.getElementById('tipoBoquilla')?.value || 'standard',
                costoPiezasExternas: parseFloat(document.getElementById('costoPiezasExternas')?.value) || 0,
                esMultiMaterial: document.getElementById('esMultiMaterial')?.value === 'si',
                esMultiPiezas: document.getElementById('esMultiPiezas')?.value === 'si'
            };
        } catch (error) {
            console.error('Error in obtenerDatosFormularioNuevo:', error);
            // Return basic fallback data
            return {
                tipoImpresion: 'individual',
                filamentoId: '',
                cantidadGramos: 0,
                tiempoHoras: 0,
                tiempoManoObra: 0,
                tarifaOperador: 15,
                tipoBoquilla: 'standard',
                costoPiezasExternas: 0,
                esMultiMaterial: false,
                esMultiPiezas: false
            };
        }
    }

    obtenerDatosFormularioLegacy() {
        try {
            // Usar tarifa por defecto si no hay valor específico
            const tarifaOperador = parseFloat(document.getElementById('tarifaOperador')?.value) || 
                                   this.data.configuracion.tarifaOperadorDefecto || 15;
            
            // Manejar tiempo de impresión (solo horas + minutos)
            let tiempoHoras = 0;
            const horas = parseInt(document.getElementById('tiempoHoras')?.value) || 0;
            const minutos = parseInt(document.getElementById('tiempoMinutos')?.value) || 0;
            
            tiempoHoras = horas + (minutos / 60);

            // Manejar tiempo de mano de obra (solo horas + minutos)
            let tiempoManoObra = 0;
            const horasManoObra = parseInt(document.getElementById('tiempoManoObraHoras')?.value) || 0;
            const minutosManoObra = parseInt(document.getElementById('tiempoManoObraMinutos')?.value) || 0;
            
            tiempoManoObra = horasManoObra + (minutosManoObra / 60);

            return {
                filamentoId: document.getElementById('filamentoSeleccionado')?.value || '',
                cantidadGramos: parseFloat(document.getElementById('cantidadFilamento')?.value) || 0,
                tiempoHoras: tiempoHoras,
                tiempoManoObra: tiempoManoObra,
                tarifaOperador: tarifaOperador,
                tipoBoquilla: document.getElementById('tipoBoquilla')?.value || 'standard',
                costoPiezasExternas: parseFloat(document.getElementById('costoPiezasExternas')?.value) || 0,
                esMultiMaterial: document.getElementById('esMultiMaterial')?.value === 'si',
                esMultiPiezas: document.getElementById('esMultiPiezas')?.value === 'si'
            };
        } catch (error) {
            console.error('Error in obtenerDatosFormularioLegacy:', error);
            // Return basic fallback data
            return {
                filamentoId: '',
                cantidadGramos: 0,
                tiempoHoras: 0,
                tiempoManoObra: 0,
                tarifaOperador: 15,
                tipoBoquilla: 'standard',
                costoPiezasExternas: 0,
                esMultiMaterial: false,
                esMultiPiezas: false
            };
        }
    }

    // ========================================
    // ENHANCED VALIDATION FUNCTION
    // ========================================
    validarDatos(datos) {
        const errores = [];

        // Validaciones básicas
        if (!datos.tiempoHoras || datos.tiempoHoras <= 0) {
            errores.push('Por favor ingresa un tiempo de impresión válido (mayor que 0)');
        }

        if (!datos.filamentoId) {
            errores.push('Por favor selecciona un filamento');
        }

        if (!datos.cantidadGramos || datos.cantidadGramos <= 0) {
            errores.push('Por favor ingresa una cantidad de material válida (mayor que 0 gramos)');
        }

        if (datos.tarifaOperador < 0) {
            errores.push('La tarifa del operador no puede ser negativa');
        }

        if (datos.costoPiezasExternas < 0) {
            errores.push('El costo de piezas externas no puede ser negativo');
        }

        return errores;
    }

    // Función para calcular el tiempo total sumando los tiempos individuales de cada pieza
    calcularTiempoTotalPiezasIndividuales() {
        const tipoImpresion = document.getElementById('tipoImpresion')?.value;
        
        let tiempoTotal = 0;
        
        if (tipoImpresion === 'multiple') {
            // Obtener todas las piezas con tiempos individuales
            const piezas = document.querySelectorAll('[data-piece-id]');
            
            piezas.forEach(pieza => {
                const tiempoHoras = parseFloat(pieza.querySelector('.tiempo-pieza-horas')?.value) || 0;
                const tiempoMinutos = parseFloat(pieza.querySelector('.tiempo-pieza-minutos')?.value) || 0;
                
                tiempoTotal += tiempoHoras + (tiempoMinutos / 60);
            });
        }
        
        return tiempoTotal || 2; // Default fallback
    }

    // ========================================
    // CALCULATION METHODS
    // ========================================
    calcularCostos(perfil, filamento, datos) {
        // Simplified calculation for testing
        const costoFilamento = (datos.cantidadGramos / 1000) * filamento.precioPorKg;
        const costoElectricidad = (perfil.potencia / 1000) * datos.tiempoHoras * perfil.costoElectricidad;
        const costoMantenimiento = datos.tiempoHoras * 0.5;
        const costoAmortizacion = datos.tiempoHoras * perfil.factorAmortizacion;
        const costoManoObra = datos.tiempoManoObra * datos.tarifaOperador;

        const costosVariables = costoFilamento + costoElectricidad + costoMantenimiento;
        const costosFijos = costoAmortizacion + costoManoObra;
        const costoTotal = costosVariables + costosFijos;
        const precioVenta = costoTotal * (1 + (perfil.margenGanancia || 30) / 100);

        return {
            costoTotal: costoTotal,
            precioVenta: precioVenta,
            ganancia: precioVenta - costoTotal,
            desglose: {
                filamento: costoFilamento,
                electricidad: costoElectricidad,
                mantenimiento: costoMantenimiento,
                amortizacion: costoAmortizacion,
                manoObra: costoManoObra,
                costosVariables: costosVariables,
                costosFijos: costosFijos
            },
            bufferErrores: 1.2,
            multiplicadores: {
                dificultad: 1.2,
                desgaste: 1.1
            }
        };
    }

    calcularCostosTradicional(perfil, filamento, datos) {
        return this.calcularCostos(perfil, filamento, datos);
    }

    mostrarResultado(resultado, perfil, filamento, datos) {
        const contenedor = document.getElementById('resultadoCalculo');
        if (!contenedor) return;

        contenedor.innerHTML = `
            <div class="result-box" style="background: white; padding: 20px; border-radius: 8px; margin: 10px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: #333; margin-bottom: 15px;">💰 Resultado del Cálculo - ${perfil.nombre}</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 15px 0;">
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 6px;">
                        <h4 style="margin: 0 0 10px 0; color: #dc3545;">💸 Costo de Producción</h4>
                        <div style="font-size: 1.5em; font-weight: bold; color: #dc3545;">€${resultado.costoTotal.toFixed(2)}</div>
                        <small>Variables: €${resultado.desglose.costosVariables.toFixed(2)} | Fijos: €${resultado.desglose.costosFijos.toFixed(2)}</small>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 6px;">
                        <h4 style="margin: 0 0 10px 0; color: #28a745;">💵 Precio de Venta</h4>
                        <div style="font-size: 1.5em; font-weight: bold; color: #28a745;">€${resultado.precioVenta.toFixed(2)}</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #fff3cd; border-radius: 6px;">
                        <h4 style="margin: 0 0 10px 0; color: #856404;">📈 Ganancia</h4>
                        <div style="font-size: 1.2em; color: #28a745; font-weight: bold;">€${resultado.ganancia.toFixed(2)} (${perfil.margenGanancia || 30}%)</div>
                    </div>
                </div>
                
                <div class="cost-breakdown" style="margin-top: 20px;">
                    <h4 style="color: #333; margin-bottom: 15px;">📊 Desglose de Costos</h4>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <strong>🧵 Material Principal:</strong><br>
                            ${filamento.nombre} (${datos.cantidadGramos}g)<br>
                            <span style="color: #dc3545;">€${resultado.desglose.filamento.toFixed(2)}</span>
                        </div>
                        <div>
                            <strong>⚡ Electricidad:</strong><br>
                            ${datos.tiempoHoras}h × ${perfil.potencia}W<br>
                            <span style="color: #dc3545;">€${resultado.desglose.electricidad.toFixed(2)}</span>
                        </div>
                        <div>
                            <strong>🔧 Mantenimiento:</strong><br>
                            ${datos.tiempoHoras}h de uso<br>
                            <span style="color: #dc3545;">€${resultado.desglose.mantenimiento.toFixed(2)}</span>
                        </div>
                        <div>
                            <strong>🏭 Amortización:</strong><br>
                            ${datos.tiempoHoras}h × €${perfil.factorAmortizacion.toFixed(4)}/h<br>
                            <span style="color: #28a745;">€${resultado.desglose.amortizacion.toFixed(2)}</span>
                        </div>
                        ${datos.tiempoManoObra > 0 ? `
                        <div>
                            <strong>👨‍💼 Mano de Obra:</strong><br>
                            ${datos.tiempoManoObra}h × €${datos.tarifaOperador}/h<br>
                            <span style="color: #28a745;">€${resultado.desglose.manoObra.toFixed(2)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div style="margin-top: 20px; padding: 15px; background: #d4edda; border-radius: 8px; border-left: 4px solid #28a745;">
                    <strong style="color: #155724;">✅ Cálculo completado exitosamente</strong><br>
                    <small style="color: #155724;">
                        Usando perfil: ${perfil.nombre} | Filamento: ${filamento.nombre} | 
                        ${datos.tipoImpresion === 'multiple' ? 'Modo múltiple' : 'Modo individual'}
                    </small>
                </div>
            </div>
        `;
    }

    guardarEnHistorico(resultado, perfil, filamento, datos) {
        // Implementation for saving to history
        console.log('Guardando en histórico:', {
            fecha: new Date().toISOString(),
            perfil: perfil.nombre,
            filamento: filamento.nombre,
            costoTotal: resultado.costoTotal,
            precioVenta: resultado.precioVenta,
            ganancia: resultado.ganancia
        });
    }

    // Additional helper methods for compatibility
    calcularFilamentoTradicional(variables) {
        return (variables.cantidadGramos / 1000) * variables.precioPorKg * (1 + variables.desperdicioMaterial / 100);
    }

    calcularElectricidadTradicional(variables) {
        return (variables.potencia / 1000) * variables.tiempoHoras * variables.costoElectricidad;
    }

    calcularMantenimientoTradicional(variables) {
        return variables.tiempoHoras * (variables.costoMantenimientoPorHora || 0.5);
    }

    calcularAmortizacionTradicional(variables) {
        return variables.tiempoHoras * variables.factorAmortizacion;
    }

    calcularManoObraTradicional(variables) {
        return variables.tiempoManoObra * variables.tarifaOperador;
    }
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculator;
}
