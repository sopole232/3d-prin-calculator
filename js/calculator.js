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
        }, 100);
    }

    calcular() {
        if (!this.data.perfilActivoId) {
            UI.showAlert('Por favor selecciona un perfil de impresora primero');
            return;
        }

        const perfil = this.data.perfilesCostos.find(p => p.id === this.data.perfilActivoId);
        const datosCalculo = this.obtenerDatosFormulario();

        if (!this.validarDatos(datosCalculo)) {
            UI.showAlert('Por favor completa todos los campos obligatorios');
            return;
        }

        const filamento = this.data.filamentos.find(f => f.id == datosCalculo.filamentoId);
        
        // Calcular AMBOS métodos para comparación
        const resultadoTradicional = this.calcularCostosTradicional(perfil, filamento, datosCalculo);
        const resultado = this.calcularCostos(perfil, filamento, datosCalculo);
        
        // Agregar datos de comparación
        resultado.calculoTradicional = resultadoTradicional;
        resultado.modoComparacion = this.data.configuracion.mostrarComparacion || false;
        
        this.mostrarResultado(resultado, perfil, filamento, datosCalculo);
        this.guardarEnHistorico(resultado, perfil, filamento, datosCalculo);
    }

    obtenerDatosFormulario() {
        // Usar tarifa por defecto si no hay valor específico
        const tarifaOperador = parseFloat(document.getElementById('tarifaOperador').value) || 
                               this.data.configuracion.tarifaOperadorDefecto || 15;

        return {
            filamentoId: document.getElementById('filamentoSeleccionado').value,
            cantidadGramos: parseFloat(document.getElementById('cantidadFilamento').value) || 0,
            tiempoHoras: parseFloat(document.getElementById('tiempoImpresion').value) || 0,
            tiempoManoObra: parseFloat(document.getElementById('tiempoManoObra').value) || 0,
            tarifaOperador: tarifaOperador,
            tipoBoquilla: document.getElementById('tipoBoquilla').value,
            costoPiezasExternas: parseFloat(document.getElementById('costoPiezasExternas').value) || 0,
            esMultiMaterial: document.getElementById('esMultiMaterial').value === 'si'
        };
    }

    validarDatos(datos) {
        return datos.filamentoId && datos.cantidadGramos > 0 && datos.tiempoHoras > 0;
    }

    calcularCostos(perfil, filamento, datos) {
        // Preparar variables para las fórmulas
        const variables = {
            cantidadGramos: datos.cantidadGramos,
            tiempoHoras: datos.tiempoHoras,
            precioPorKg: filamento.precioPorKg,
            potencia: perfil.potencia,
            costoElectricidad: perfil.costoElectricidad,
            factorAmortizacion: perfil.factorAmortizacion,
            desperdicioMaterial: perfil.desperdicioMaterial,
            tarifaOperador: datos.tarifaOperador,
            tiempoManoObra: datos.tiempoManoObra,
            costoMantenimientoPorHora: perfil.costoMantenimientoPorHora || ((perfil.costoMantenimiento || 60) / (perfil.intervaloMantenimiento || 250))
        };

        // Obtener multiplicadores del filamento seleccionado
        const dificultadImpresion = filamento.dificultad || 3;
        const desgasteImpresora = filamento.desgaste || 3;
        
        // Calcular multiplicadores (1-10 se convierte a 0%-100%)
        const multiplicadorDificultad = 1 + ((dificultadImpresion - 1) / 9); // 1=1.0x, 10=2.0x
        const multiplicadorDesgaste = 1 + ((desgasteImpresora - 1) / 9 * 0.5); // 1=1.0x, 10=1.5x (menos impacto)

        console.log(`🎯 Multiplicadores del filamento ${filamento.nombre}:`);
        console.log(`   Dificultad: ${dificultadImpresion}/10 → x${multiplicadorDificultad.toFixed(2)} factor de errores`);
        console.log(`   Desgaste: ${desgasteImpresora}/10 → x${multiplicadorDesgaste.toFixed(2)} costo mantenimiento`);

        let desglose = {};
        let usingCustomFormulas = false;

        // Usar fórmulas personalizadas si existen
        if (this.data.configuracion.formulasPersonalizadas) {
            usingCustomFormulas = true;
            
            desglose.filamento = app.managers.config.calcularConFormula('filamento', variables);
            desglose.electricidad = app.managers.config.calcularConFormula('electricidad', variables);
            
            // APLICAR multiplicador de desgaste al mantenimiento
            desglose.mantenimiento = app.managers.config.calcularConFormula('mantenimiento', variables) * multiplicadorDesgaste;
            
            desglose.amortizacion = app.managers.config.calcularConFormula('amortizacion', variables);
            desglose.manoObra = app.managers.config.calcularConFormula('manoObra', variables);
            
            console.log('🔧 Usando fórmulas personalizadas con multiplicadores');
        } else {
            // Usar cálculo tradicional
            desglose.filamento = this.calcularFilamentoTradicional(variables);
            desglose.electricidad = this.calcularElectricidadTradicional(variables);
            
            // APLICAR multiplicador de desgaste al mantenimiento
            desglose.mantenimiento = this.calcularMantenimientoTradicional(variables) * multiplicadorDesgaste;
            
            desglose.amortizacion = this.calcularAmortizacionTradicional(variables);
            desglose.manoObra = this.calcularManoObraTradicional(variables);
        }

        // COSTOS VARIABLES (afectados por buffer de errores)
        let costosVariables = desglose.filamento + desglose.electricidad + desglose.mantenimiento;
        
        // COSTOS FIJOS (NO afectados por buffer de errores)
        let costosFijos = desglose.amortizacion + desglose.manoObra;

        // Filamentos adicionales si es multi-material (SE APLICA BUFFER)
        if (datos.esMultiMaterial) {
            const costoAdicionales = this.calcularFilamentosAdicionales();
            costosVariables += costoAdicionales;
            desglose.filamentosAdicionales = costoAdicionales;
        }

        // Costo de boquilla (COSTO FIJO)
        const costoBoquilla = this.calcularCostoBoquilla(datos.tipoBoquilla);
        costosFijos += costoBoquilla;
        desglose.boquilla = costoBoquilla;

        // Piezas externas (COSTO FIJO)
        costosFijos += datos.costoPiezasExternas;
        desglose.piezasExternas = datos.costoPiezasExternas;

        // Aplicar buffer SOLO a costos variables CON multiplicador de dificultad
        const bufferErroresBase = perfil.bufferErrores || 2;
        const bufferErroresConDificultad = bufferErroresBase * multiplicadorDificultad;
        const costosVariablesConBuffer = costosVariables * bufferErroresConDificultad;
        const costoBuffer = costosVariablesConBuffer - costosVariables;
        
        desglose.bufferErrores = costoBuffer;
        desglose.multiplicadorDificultad = multiplicadorDificultad;
        desglose.multiplicadorDesgaste = multiplicadorDesgaste;
        desglose.bufferErroresFinal = bufferErroresConDificultad;

        // COSTO TOTAL = Costos variables con buffer + Costos fijos
        const costoTotal = costosVariablesConBuffer + costosFijos;

        // **AQUÍ ES DONDE SE APLICAN LAS FÓRMULAS FINALES**
        let precioVenta, formulasFinalesUsadas = false;

        // Intentar usar fórmulas finales personalizadas si existen
        if (window.app.managers.backend && this.data.configuracion.formulasFinales) {
            const resultadoFinal = window.app.managers.backend.calcularConFormulasFinales(
                desglose, 
                { 
                    ...datos, 
                    margenGanancia: perfil.margenGanancia || 30,
                    redondeo: this.data.configuracion.redondeoPrecios || 0.01,
                    costoTotal: costoTotal,
                    multiplicadorDificultad,
                    multiplicadorDesgaste
                }
            );

            if (resultadoFinal) {
                const costoTotalFinal = resultadoFinal.costoTotal || costoTotal;
                precioVenta = resultadoFinal.precioVenta;
                formulasFinalesUsadas = true;
                console.log('🔧 Usando fórmulas finales personalizadas con multiplicadores');
                
                return {
                    costoTotal: costoTotalFinal,
                    precioVenta,
                    desglose: {
                        ...desglose,
                        costosVariables,
                        costosFijos,
                        costosVariablesConBuffer
                    },
                    ganancia: precioVenta - costoTotalFinal,
                    bufferErrores: bufferErroresConDificultad,
                    multiplicadores: {
                        dificultad: multiplicadorDificultad,
                        desgaste: multiplicadorDesgaste,
                        dificultadNivel: dificultadImpresion,
                        desgasteNivel: desgasteImpresora
                    },
                    formulasUsadas: usingCustomFormulas ? ['Fórmulas de costos personalizadas'] : null,
                    formulasFinalesUsadas: formulasFinalesUsadas ? ['Fórmulas finales personalizadas'] : null
                };
            }
        }

        // Si no hay fórmulas personalizadas, usar cálculo tradicional
        if (!formulasFinalesUsadas) {
            precioVenta = costoTotal * (1 + (perfil.margenGanancia || 30) / 100);
            
            // Aplicar redondeo tradicional
            const redondeo = this.data.configuracion.redondeoPrecios || 0.01;
            precioVenta = Math.round(precioVenta / redondeo) * redondeo;
        }

        return {
            costoTotal,
            precioVenta,
            desglose: {
                ...desglose,
                costosVariables,
                costosFijos,
                costosVariablesConBuffer
            },
            ganancia: precioVenta - costoTotal,
            bufferErrores: bufferErroresConDificultad,
            multiplicadores: {
                dificultad: multiplicadorDificultad,
                desgaste: multiplicadorDesgaste,
                dificultadNivel: dificultadImpresion,
                desgasteNivel: desgasteImpresora
            },
            formulasUsadas: usingCustomFormulas ? ['Fórmulas de costos personalizadas'] : null,
            formulasFinalesUsadas: formulasFinalesUsadas ? ['Fórmulas finales personalizadas'] : null
        };
    }

    calcularCostosTradicional(perfil, filamento, datos) {
        // Preparar variables
        const variables = {
            cantidadGramos: datos.cantidadGramos,
            tiempoHoras: datos.tiempoHoras,
            precioPorKg: filamento.precioPorKg,
            potencia: perfil.potencia,
            costoElectricidad: perfil.costoElectricidad,
            factorAmortizacion: perfil.factorAmortizacion,
            desperdicioMaterial: perfil.desperdicioMaterial,
            tarifaOperador: datos.tarifaOperador,
            tiempoManoObra: datos.tiempoManoObra,
            costoMantenimientoPorHora: perfil.costoMantenimientoPorHora || ((perfil.costoMantenimiento || 60) / (perfil.intervaloMantenimiento || 250)),
            margenGanancia: perfil.margenGanancia || 30
        };

        // Obtener multiplicadores del filamento seleccionado
        const dificultadImpresion = filamento.dificultad || 3;
        const desgasteImpresora = filamento.desgaste || 3;
        
        // Calcular multiplicadores
        const multiplicadorDificultad = 1 + ((dificultadImpresion - 1) / 9);
        const multiplicadorDesgaste = 1 + ((desgasteImpresora - 1) / 9 * 0.5);

        let desglose = {};

        // Cálculo tradicional
        desglose.filamento = this.calcularFilamentoTradicional(variables);
        desglose.electricidad = this.calcularElectricidadTradicional(variables);
        
        // APLICAR multiplicador de desgaste al mantenimiento
        desglose.mantenimiento = this.calcularMantenimientoTradicional(variables) * multiplicadorDesgaste;
        
        desglose.amortizacion = this.calcularAmortizacionTradicional(variables);
        desglose.manoObra = this.calcularManoObraTradicional(variables);
        
        // COSTOS VARIABLES (afectados por buffer de errores)
        let costosVariables = desglose.filamento + desglose.electricidad + desglose.mantenimiento;
        
        // COSTOS FIJOS (NO afectados por buffer de errores)
        let costosFijos = desglose.amortizacion + desglose.manoObra;

        // Filamentos adicionales si es multi-material (SE APLICA BUFFER)
        if (datos.esMultiMaterial) {
            const costoAdicionales = this.calcularFilamentosAdicionales();
            costosVariables += costoAdicionales;
            desglose.filamentosAdicionales = costoAdicionales;
        }

        // Costo de boquilla (COSTO FIJO)
        const costoBoquilla = this.calcularCostoBoquilla(datos.tipoBoquilla);
        costosFijos += costoBoquilla;
        desglose.boquilla = costoBoquilla;

        // Piezas externas (COSTO FIJO)
        costosFijos += datos.costoPiezasExternas;
        desglose.piezasExternas = datos.costoPiezasExternas;

        // Aplicar buffer SOLO a costos variables CON multiplicador de dificultad
        const bufferErroresBase = perfil.bufferErrores || 2;
        const bufferErroresConDificultad = bufferErroresBase * multiplicadorDificultad;
        const costosVariablesConBuffer = costosVariables * bufferErroresConDificultad;
        const costoBuffer = costosVariablesConBuffer - costosVariables;
        
        desglose.bufferErrores = costoBuffer;
        desglose.multiplicadorDificultad = multiplicadorDificultad;
        desglose.multiplicadorDesgaste = multiplicadorDesgaste;
        desglose.bufferErroresFinal = bufferErroresConDificultad;

        // COSTO TOTAL = Costos variables con buffer + Costos fijos
        const costoTotal = costosVariablesConBuffer + costosFijos;

        // Precio de venta con margen
        const precioVenta = costoTotal * (1 + (perfil.margenGanancia || 30) / 100);

        return {
            costoTotal,
            precioVenta,
            desglose: {
                ...desglose,
                costosVariables,
                costosFijos,
                costosVariablesConBuffer
            },
            ganancia: precioVenta - costoTotal,
            bufferErrores: bufferErroresConDificultad,
            multiplicadores: {
                dificultad: multiplicadorDificultad,
                desgaste: multiplicadorDesgaste,
                dificultadNivel: dificultadImpresion,
                desgasteNivel: desgasteImpresora
            },
            formulasUsadas: null
        };
    }

    // Métodos auxiliares para cálculos tradicionales individuales
    calcularFilamentoTradicional(variables) {
        return (variables.cantidadGramos / 1000) * variables.precioPorKg * (1 + variables.desperdicioMaterial / 100);
    }

    calcularElectricidadTradicional(variables) {
        return (variables.potencia / 1000) * variables.tiempoHoras * variables.costoElectricidad;
    }

    calcularMantenimientoTradicional(variables) {
        return variables.tiempoHoras * variables.costoMantenimientoPorHora;
    }

    calcularAmortizacionTradicional(variables) {
        return variables.tiempoHoras * variables.factorAmortizacion;
    }

    calcularManoObraTradicional(variables) {
        return variables.tiempoManoObra * variables.tarifaOperador;
    }

    calcularFilamentosAdicionales() {
        const filamentosAdicionales = document.querySelectorAll('.filamento-adicional');
        const cantidadesAdicionales = document.querySelectorAll('.cantidad-adicional');
        let costoTotal = 0;

        // Calcular costo de filamentos adicionales realmente agregados
        for (let i = 0; i < filamentosAdicionales.length; i++) {
            const filAdicionalId = filamentosAdicionales[i].value;
            const cantAdicional = parseFloat(cantidadesAdicionales[i].value) || 0;
            
            if (filAdicionalId && cantAdicional > 0) {
                const filAdicional = this.data.filamentos.find(f => f.id == filAdicionalId);
                if (filAdicional) {
                    const costoAdicional = (cantAdicional / 1000) * filAdicional.precioPorKg;
                    costoTotal += costoAdicional;
                }
            }
        }

        // Si NO hay filamentos adicionales específicos pero SÍ está marcado como multi-material,
        // aplicar recargo sobre el filamento principal
        if (costoTotal === 0) {
            // Obtener datos del filamento principal para aplicar recargo
            const cantidadPrincipal = parseFloat(document.getElementById('cantidadFilamento').value) || 0;
            const filamentoPrincipalId = document.getElementById('filamentoSeleccionado').value;
            
            if (filamentoPrincipalId && cantidadPrincipal > 0) {
                const filamentoPrincipal = this.data.filamentos.find(f => f.id == filamentoPrincipalId);
                if (filamentoPrincipal) {
                    // Obtener el perfil activo para usar SU recargo específico
                    const perfil = this.data.perfilesCostos.find(p => p.id === this.data.perfilActivoId);
                    const recargoMultiMaterial = perfil?.recargoMultiMaterial || 15;
                    
                    const porcentajeAdicional = recargoMultiMaterial / 100;
                    const estimacionAdicional = cantidadPrincipal * porcentajeAdicional;
                    costoTotal = (estimacionAdicional / 1000) * filamentoPrincipal.precioPorKg;
                }
            }
        }

        // Aplicar recargo por multi-material SIEMPRE que esté activado
        // Usar el recargo específico del perfil activo
        const perfil = this.data.perfilesCostos.find(p => p.id === this.data.perfilActivoId);
        const recargoMultiMaterial = perfil?.recargoMultiMaterial || 15;
        return costoTotal * (1 + recargoMultiMaterial / 100);
    }

    calcularCostoBoquilla(tipo) {
        switch (tipo) {
            case 'hardened': return 2;
            case 'ruby': return 5;
            default: return 0;
        }
    }

    mostrarResultado(resultado, perfil, filamento, datos) {
        const contenedor = document.getElementById('resultadoCalculo');
        if (!contenedor) return;

        let formulasInfo = '';
        if (resultado.formulasUsadas || resultado.formulasFinalesUsadas) {
            const tiposFormula = [];
            if (resultado.formulasUsadas) tiposFormula.push('Fórmulas de costos');
            if (resultado.formulasFinalesUsadas) tiposFormula.push('Fórmulas finales');
            
            formulasInfo = `                <div style="background: rgba(26, 26, 46, 0.6); padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 0.9em; border: 1px solid rgba(159, 168, 218, 0.3); color: var(--color-cosmic-mist);">
                    <strong>🔧 Usando: ${tiposFormula.join(' + ')}</strong>
                    <br><small>Puedes modificar las fórmulas en Configuración → Editor de Fórmulas</small>
                </div>
            `;
        }

        // Información de los multiplicadores del filamento
        let multiplicadoresInfo = '';
        if (resultado.multiplicadores) {
            const {dificultad, desgaste, dificultadNivel, desgasteNivel} = resultado.multiplicadores;
            
            multiplicadoresInfo = `                <div style="background: rgba(26, 26, 46, 0.6); padding: 15px; border-radius: 8px; margin: 10px 0; font-size: 0.9em; border-left: 4px solid var(--color-warning); color: var(--color-cosmic-mist);">
                    <strong>🎯 Características del Filamento "${filamento.nombre}":</strong>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 10px 0; padding: 10px; background: rgba(6, 14, 54, 0.8); border-radius: 5px;">
                        <div style="text-align: center;">
                            <strong style="color: ${dificultadNivel > 6 ? 'var(--color-danger)' : dificultadNivel > 3 ? 'var(--color-warning)' : 'var(--color-success)'};">🎲 Dificultad: ${dificultadNivel}/10</strong><br>
                            <small style="color: ${dificultadNivel > 6 ? 'var(--color-danger)' : dificultadNivel > 3 ? 'var(--color-warning)' : 'var(--color-success)'}; font-weight: bold;">
                                ${dificultadNivel <= 3 ? 'Fácil' : dificultadNivel <= 6 ? 'Moderada' : 'Difícil'}
                            </small><br>
                            <small>Factor errores: ×${dificultad.toFixed(2)}</small>
                        </div>
                        <div style="text-align: center;">
                            <strong style="color: ${desgasteNivel > 6 ? 'var(--color-danger)' : desgasteNivel > 3 ? 'var(--color-warning)' : 'var(--color-success)'};">⚙️ Desgaste: ${desgasteNivel}/10</strong><br>
                            <small style="color: ${desgasteNivel > 6 ? 'var(--color-danger)' : desgasteNivel > 3 ? 'var(--color-warning)' : 'var(--color-success)'}; font-weight: bold;">
                                ${desgasteNivel <= 3 ? 'Bajo' : desgasteNivel <= 6 ? 'Moderado' : 'Alto'}
                            </small><br>
                            <small>Factor mantenimiento: ×${desgaste.toFixed(2)}</small>
                        </div>
                    </div>
                    <div style="margin-top: 10px; padding: 8px; background: #230636; border-radius: 4px; font-size: 0.8em;">
                        <strong>💡 Efectos en el cálculo:</strong><br>
                        • <strong>Dificultad:</strong> Multiplica el factor de seguridad (más errores de impresión)<br>
                        • <strong>Desgaste:</strong> Multiplica el costo de mantenimiento de la impresora
                    </div>
                    <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 4px; font-size: 0.85em;">
                        💡 <strong>Resultado:</strong> Factor de seguridad aplicado: ×${resultado.bufferErrores.toFixed(2)} 
                        (base ×${perfil.bufferErrores || 2} × dificultad ×${dificultad.toFixed(2)})
                    </div>
                </div>
            `;
        }

        // Información del multi-material actualizada para usar el recargo del perfil
        let multiMaterialInfo = '';
        if (datos.esMultiMaterial) {
            const recargoMultiMaterial = perfil.recargoMultiMaterial || 15;
            multiMaterialInfo = `                <div style="background: rgba(26, 26, 46, 0.6); padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 0.9em; border-left: 4px solid var(--color-info); color: var(--color-cosmic-mist);">
                    <strong>🎨 Impresión Multi-Material Activa:</strong>
                    <br><small>Recargo aplicado: ${recargoMultiMaterial}% sobre material adicional (configurado en este perfil de impresora)</small>
                    <br><small>Costo adicional: €${resultado.desglose.filamentosAdicionales?.toFixed(2) || '0.00'}</small>
                    <br><button class="btn-small" onclick="UI.showTab('perfiles-costos')" style="margin-top: 5px;">
                        ⚙️ Cambiar Recargo en Perfil de Impresora
                    </button>
                </div>
            `;
        }

        // Información del buffer de errores con enlace al perfil
        const bufferInfo = `            <div style="background: rgba(26, 26, 46, 0.6); padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 0.9em; border-left: 4px solid var(--color-danger); color: var(--color-cosmic-mist);">
                <strong>⚠️ Factor de Seguridad Final x${resultado.bufferErrores.toFixed(2)} (${perfil.nombre}):</strong>
                <br><small>Factor base del perfil: x${perfil.bufferErrores || 2}</small>
                <br><small>Multiplicado por dificultad del filamento: x${resultado.multiplicadores?.dificultad.toFixed(2) || 1}</small>
                <br><small>Se aplica SOLO a costos variables (material, electricidad, mantenimiento)</small>
                <br><small>NO se aplica a costos fijos (amortización, mano de obra, boquilla, piezas externas)</small>
                <br><button class="btn-small" onclick="UI.showTab('perfiles-costos')" style="margin-top: 5px;">
                    ⚙️ Cambiar Factor Base en Perfil de Impresora
                </button>
            </div>
        `;

        contenedor.innerHTML = `
            <div class="result-box">
                <h3>💰 Resultado del Cálculo - ${perfil.nombre}</h3>
                ${formulasInfo}
                ${multiplicadoresInfo}
                ${multiMaterialInfo}
                ${bufferInfo}
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 15px 0;">
                    <div>
                        <h4>💸 Costo de Producción</h4>
                        <div style="font-size: 1.5em; font-weight: bold;">€${resultado.costoTotal.toFixed(2)}</div>
                        <small>Variables: €${resultado.desglose.costosVariablesConBuffer?.toFixed(2)} | Fijos: €${resultado.desglose.costosFijos?.toFixed(2)}</small>
                    </div>
                    <div>
                        <h4>💵 Precio de Venta</h4>
                        <div style="font-size: 1.5em; font-weight: bold;">€${resultado.precioVenta.toFixed(2)}</div>
                    </div>
                    <div>
                        <h4>📈 Ganancia</h4>
                        <div style="font-size: 1.2em; color: #28a745;">€${resultado.ganancia.toFixed(2)} (${perfil.margenGanancia || 30}%)</div>
                    </div>
                </div>
                
                <div class="cost-breakdown">
                    <h4>📊 Desglose de Costos</h4>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h5 style="color: #dc3545;">⚠️ Costos Variables (CON factor de seguridad x${resultado.bufferErrores.toFixed(2)})</h5>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <div>
                                <strong>🧵 Material Principal:</strong><br>
                                ${filamento.nombre} (${datos.cantidadGramos}g + ${perfil.desperdicioMaterial || 5}% desperdicio)<br>
                                <span style="color: #dc3545;">€${resultado.desglose.filamento.toFixed(2)}</span>
                            </div>
                            <div>
                                <strong>⚡ Electricidad:</strong><br>
                                ${datos.tiempoHoras}h × ${perfil.potencia}W × €${perfil.costoElectricidad}/kWh<br>
                                <span style="color: #dc3545;">€${resultado.desglose.electricidad.toFixed(2)}</span>
                            </div>
                            <div>
                                <strong>🔧 Mantenimiento:</strong><br>
                                €${perfil.costoMantenimiento || 60} cada ${perfil.intervaloMantenimiento || 250}h<br>
                                <small style="color: #6c757d;">× desgaste filamento x${resultado.multiplicadores?.desgaste.toFixed(2) || 1}</small><br>
                                <span style="color: #dc3545;">€${resultado.desglose.mantenimiento.toFixed(2)}</span>
                            </div>
                            ${datos.esMultiMaterial && resultado.desglose.filamentosAdicionales > 0 ? `
                            <div>
                                <strong>🎨 Material Multi-Material:</strong><br>
                                ${perfil.recargoMultiMaterial || 15}% recargo por complejidad (perfil: ${perfil.nombre})<br>
                                <span style="color: #dc3545;">€${resultado.desglose.filamentosAdicionales.toFixed(2)}</span>
                            </div>
                            ` : ''}
                        </div>
                        <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 5px;">
                            <strong>Subtotal variables:</strong> €${resultado.desglose.costosVariables?.toFixed(2)} 
                            <strong>→ Con factor x${resultado.bufferErrores.toFixed(2)}:</strong> €${resultado.desglose.costosVariablesConBuffer?.toFixed(2)}
                            <strong style="color: #dc3545;"> (+€${resultado.desglose.bufferErrores.toFixed(2)} de seguridad)</strong>
                            <br><small>💡 Factor = Base (${perfil.bufferErrores || 2}) × Dificultad filamento (${resultado.multiplicadores?.dificultad.toFixed(2) || 1})</small>
                        </div>
                    </div>

                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h5 style="color: #28a745;">✅ Costos Fijos (SIN factor de seguridad)</h5>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
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
                            ${resultado.desglose.boquilla > 0 ? `
                            <div>
                                <strong>🔧 Desgaste Boquilla:</strong><br>
                                ${datos.tipoBoquilla}<br>
                                <span style="color: #28a745;">€${resultado.desglose.boquilla.toFixed(2)}</span>
                            </div>
                            ` : ''}
                            ${resultado.desglose.piezasExternas > 0 ? `
                            <div>
                                <strong>🔩 Piezas Externas:</strong><br>
                                Componentes adicionales<br>
                                <span style="color: #28a745;">€${resultado.desglose.piezasExternas.toFixed(2)}</span>
                            </div>
                            ` : ''}
                        </div>
                        <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 5px;">
                            <strong style="color: #28a745;">Subtotal fijos: €${resultado.desglose.costosFijos?.toFixed(2)}</strong>
                            <br><small>💡 Los costos fijos no se ven afectados por el factor de seguridad ni por las características del filamento</small>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Al final, agregar info sobre fórmulas finales si se usaron
        if (resultado.formulasFinalesUsadas) {
            contenedor.innerHTML += `
                <div style="margin-top: 20px; padding: 15px; background: #d1ecf1; border-radius: 8px; border-left: 4px solid #17a2b8;">
                    <h5>🔧 Fórmulas Finales Personalizadas Activas</h5>
                    <p>El cálculo final (costo total y precio de venta) está usando fórmulas personalizadas.</p>
                    <button class="btn" onclick="UI.showTab('configuracion'); setTimeout(() => document.getElementById('formulaEditor').scrollIntoView(), 500)">
                        📝 Editar Fórmulas Finales
                    </button>
                </div>
            `;
        }
    }

    generarComparacionDetallada(desglose1, desglose2) {
        const conceptos = [
            { key: 'filamento', label: '🧵 Material' },
            { key: 'electricidad', label: '⚡ Electricidad' },
            { key: 'mantenimiento', label: '🔧 Mantenimiento' },
            { key: 'amortizacion', label: '🏭 Amortización' },
            { key: 'manoObra', label: '👨‍💼 Mano de Obra' },
            { key: 'bufferErrores', label: '⚠️ Buffer Errores' }
        ];

        let html = `
            <div style="margin-top: 15px; background: white; padding: 15px; border-radius: 5px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="text-align: left; padding: 8px; border: 1px solid #dee2e6;">Concepto</th>
                            <th style="text-align: right; padding: 8px; border: 1px solid #dee2e6;">Tradicional</th>
                            <th style="text-align: right; padding: 8px; border: 1px solid #dee2e6;">Personalizado</th>
                            <th style="text-align: right; padding: 8px; border: 1px solid #dee2e6;">Diferencia</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        conceptos.forEach(concepto => {
            const valor1 = desglose2[concepto.key] || 0;
            const valor2 = desglose1[concepto.key] || 0;
            const diferencia = valor2 - valor1;
            
            if (valor1 > 0 || valor2 > 0) {
                html += `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dee2e6;">${concepto.label}</td>
                        <td style="text-align: right; padding: 8px; border: 1px solid #dee2e6;">€${valor1.toFixed(2)}</td>
                        <td style="text-align: right; padding: 8px; border: 1px solid #dee2e6;">€${valor2.toFixed(2)}</td>
                        <td style="text-align: right; padding: 8px; border: 1px solid #dee2e6; color: ${diferencia >= 0 ? '#dc3545' : '#28a745'}">
                            ${diferencia >= 0 ? '+' : ''}€${diferencia.toFixed(2)}
                        </td>
                    </tr>
                `;
            }
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
        return html;
    }

    toggleModoComparacion() {
        this.data.configuracion.mostrarComparacion = !this.data.configuracion.mostrarComparacion;
        app.save();
        
        if (this.data.configuracion.mostrarComparacion) {
            UI.showAlert('👁️ Modo comparación activado - Se mostrará siempre la comparación entre métodos');
        } else {
            UI.showAlert('👁️ Modo comparación desactivado');
        }
    }

    mostrarCalculoTradicional() {
        if (!UI.showConfirm('¿Recalcular usando SOLO el método tradicional? Esto ignorará las fórmulas personalizadas temporalmente.')) return;

        // Guardar configuración actual
        const formulasOriginal = this.data.configuracion.formulasTexto;
        
        // Temporalmente eliminar fórmulas para forzar cálculo tradicional
        this.data.configuracion.formulasTexto = null;
        
        // Recalcular
        this.calcular();
        
        // Restaurar fórmulas
        this.data.configuracion.formulasTexto = formulasOriginal;
        
        UI.showAlert('📊 Mostrando resultado con cálculo tradicional solamente');
    }

    guardarEnHistorico(resultado, perfil, filamento, datos) {
        const calculo = {
            id: Date.now(),
            fecha: new Date().toLocaleString('es-ES'),
            perfil: perfil.nombre,
            filamento: filamento.nombre,
            cantidad: datos.cantidadGramos,
            tiempo: datos.tiempoHoras,
            costoTotal: resultado.costoTotal,
            precioVenta: resultado.precioVenta,
            ganancia: perfil.margenGanancia || 30,
            desglose: resultado.desglose,
            esMultiMaterial: datos.esMultiMaterial,
            tipoBoquilla: datos.tipoBoquilla,
            tiempoManoObra: datos.tiempoManoObra,
            tarifaOperador: datos.tarifaOperador
        };
        
        this.data.historico.unshift(calculo);
        if (this.data.historico.length > 50) {
            this.data.historico = this.data.historico.slice(0, 50);
        }
        
        app.save();
        if (app.managers.history) {
            app.managers.history.updateDisplay();
        }
        UI.updateCounters(this.data);
    }    toggleMultiMaterial() {
        const isMulti = document.getElementById('esMultiMaterial').value === 'si';
        const section = document.getElementById('multiMaterialSection');
        if (section) {
            if (isMulti) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        }
    }    agregarFilamentoAdicional() {
        const container = document.getElementById('filamentosAdicionales');
        if (!container) return;

        const filamentSelect = this.data.filamentos.map(f => {
            const colorInfo = f.color ? ` [${f.color}]` : '';
            return `<option value="${f.id}">${f.nombre} (${f.tipo})${colorInfo} - ${f.precioPorKg.toFixed(2)} €/kg</option>`;
        }).join('');

        const div = document.createElement('div');
        div.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                <select class="filamento-adicional" style="flex: 2;">
                    <option value="">Selecciona filamento</option>
                    ${filamentSelect}
                </select>
                <input type="number" class="cantidad-adicional" placeholder="Gramos" min="0" step="0.1" style="flex: 1;">
                <button type="button" class="btn btn-danger" onclick="this.parentElement.parentElement.remove()">❌</button>
            </div>
        `;
        container.appendChild(div);
    }
}

// Funciones globales para compatibilidad con HTML
function calcularCosto() {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.calcular();
    }
}

function toggleMultiMaterial() {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.toggleMultiMaterial();
    }
}

function agregarFilamentoAdicional() {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.agregarFilamentoAdicional();
    }
}
