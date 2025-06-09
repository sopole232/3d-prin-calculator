class Calculator {
    constructor(data) {
        this.data = data;
        this.setupEventListeners();
    }    setupEventListeners() {
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
    }    obtenerDatosFormulario() {
        // Detectar si estamos usando la nueva estructura
        const tipoImpresionElement = document.getElementById('tipoImpresion');
        
        if (tipoImpresionElement) {
            // Usar nueva estructura
            return this.obtenerDatosFormularioNuevo();
        }
        
        // Mantener compatibilidad con estructura antigua
        return this.obtenerDatosFormularioLegacy();
    }

    obtenerDatosFormularioLegacy() {
        // Usar tarifa por defecto si no hay valor específico
        const tarifaOperador = parseFloat(document.getElementById('tarifaOperador').value) || 
                               this.data.configuracion.tarifaOperadorDefecto || 15;        // Manejar tiempo de impresión (solo horas + minutos)
        let tiempoHoras = 0;
        const horas = parseInt(document.getElementById('tiempoHoras').value) || 0;
        const minutos = parseInt(document.getElementById('tiempoMinutos').value) || 0;
        
        tiempoHoras = horas + (minutos / 60);

        // Manejar tiempo de mano de obra (solo horas + minutos)
        let tiempoManoObra = 0;
        const horasManoObra = parseInt(document.getElementById('tiempoManoObraHoras').value) || 0;
        const minutosManoObra = parseInt(document.getElementById('tiempoManoObraMinutos').value) || 0;
        
        tiempoManoObra = horasManoObra + (minutosManoObra / 60);

        return {
            filamentoId: document.getElementById('filamentoSeleccionado').value,
            cantidadGramos: parseFloat(document.getElementById('cantidadFilamento').value) || 0,
            tiempoHoras: tiempoHoras,
            tiempoManoObra: tiempoManoObra,
            tarifaOperador: tarifaOperador,
            tipoBoquilla: document.getElementById('tipoBoquilla').value,
            costoPiezasExternas: parseFloat(document.getElementById('costoPiezasExternas').value) || 0,
            esMultiMaterial: document.getElementById('esMultiMaterial').value === 'si',
            esMultiPiezas: document.getElementById('esMultiPiezas').value === 'si'
        };
    }    validarDatos(datos) {
        // Validaciones básicas
        if (!datos.tiempoHoras || datos.tiempoHoras <= 0) {
            UI.showAlert('Por favor ingresa un tiempo de impresión válido');
            return false;
        }

        if (!datos.filamentoId) {
            UI.showAlert('Por favor selecciona un filamento');
            return false;
        }

        if (!datos.cantidadGramos || datos.cantidadGramos <= 0) {
            UI.showAlert('Por favor ingresa una cantidad de material válida');
            return false;
        }        // Validaciones específicas por tipo de impresión
        if (datos.tipoImpresion === 'multiple') {
            // En modo múltiple, validar que haya al menos la pieza principal configurada
            const piezaPrincipal = document.querySelector('[data-piece-id="principal"]');
            if (piezaPrincipal) {
                const tipoMaterialPrincipal = piezaPrincipal.querySelector('.tipo-material-pieza')?.value;
                
                if (tipoMaterialPrincipal === 'multi') {
                    // Validar pieza principal multicolor
                    const filamentosMulti = piezaPrincipal.querySelectorAll('.filamento-multicolor-pieza');
                    const cantidadesMulti = piezaPrincipal.querySelectorAll('.cantidad-multicolor-pieza');
                    
                    let hayFilamentosValidosPrincipal = false;
                    for (let i = 0; i < filamentosMulti.length; i++) {
                        const filamento = filamentosMulti[i].value;
                        const cantidad = parseFloat(cantidadesMulti[i].value) || 0;
                        
                        if (filamento && cantidad > 0) {
                            hayFilamentosValidosPrincipal = true;
                            break;
                        }
                    }
                    
                    if (!hayFilamentosValidosPrincipal) {
                        UI.showAlert('Por favor selecciona al menos un filamento y especifica su cantidad para la pieza principal multicolor');
                        return false;
                    }
                } else {
                    // Validar pieza principal single color
                    const filamentoPrincipal = piezaPrincipal.querySelector('.filamento-pieza-single');
                    const cantidadPrincipal = piezaPrincipal.querySelector('.cantidad-pieza-single');
                    
                    if (!filamentoPrincipal?.value) {
                        UI.showAlert('Por favor selecciona el filamento para la pieza principal');
                        return false;
                    }
                    
                    if (!cantidadPrincipal?.value || parseFloat(cantidadPrincipal.value) <= 0) {
                        UI.showAlert('Por favor ingresa una cantidad válida para la pieza principal');
                        return false;
                    }
                }
            }
            
            // Validar piezas adicionales
            const piezasAdicionales = document.querySelectorAll('[data-piece-id]:not([data-piece-id="principal"])');
            for (const pieza of piezasAdicionales) {
                const pieceId = pieza.dataset.pieceId;
                const tipoMaterial = pieza.querySelector('.tipo-material-pieza')?.value;
                
                if (tipoMaterial === 'multi') {
                    // Validar pieza adicional multicolor
                    const filamentosMulti = pieza.querySelectorAll('.filamento-multicolor-pieza');
                    const cantidadesMulti = pieza.querySelectorAll('.cantidad-multicolor-pieza');
                    
                    let hayFilamentosValidos = false;
                    for (let i = 0; i < filamentosMulti.length; i++) {
                        const filamento = filamentosMulti[i].value;
                        const cantidad = parseFloat(cantidadesMulti[i].value) || 0;
                        
                        if (filamento && cantidad > 0) {
                            hayFilamentosValidos = true;
                            break;
                        }
                    }
                    
                    if (!hayFilamentosValidos) {
                        UI.showAlert(`Por favor selecciona al menos un filamento y especifica su cantidad para la pieza ${pieceId} multicolor`);
                        return false;
                    }
                } else {
                    // Validar pieza adicional single color
                    const filamentoPieza = pieza.querySelector('.filamento-pieza-single');
                    const cantidadPieza = pieza.querySelector('.cantidad-pieza-single');
                    
                    if (!filamentoPieza?.value) {
                        UI.showAlert(`Por favor selecciona el filamento para la pieza ${pieceId}`);
                        return false;
                    }
                    
                    if (!cantidadPieza?.value || parseFloat(cantidadPieza.value) <= 0) {
                        UI.showAlert(`Por favor ingresa una cantidad válida para la pieza ${pieceId}`);
                        return false;
                    }
                }
            }} else if (datos.tipoImpresion === 'individual') {
            // En modo individual, verificar si es multicolor o single color
            const esMultiMaterial = document.getElementById('esMultiMaterialIndividual')?.value === 'si';
            
            if (esMultiMaterial) {
                // Validar sistema multicolor
                const filamentosMulti = document.querySelectorAll('.filamento-multicolor-individual');
                const cantidadesMulti = document.querySelectorAll('.cantidad-multicolor-individual');
                
                let hayFilamentosValidos = false;
                for (let i = 0; i < filamentosMulti.length; i++) {
                    const filamento = filamentosMulti[i].value;
                    const cantidad = parseFloat(cantidadesMulti[i].value) || 0;
                    
                    if (filamento && cantidad > 0) {
                        hayFilamentosValidos = true;
                        break;
                    }
                }
                
                if (!hayFilamentosValidos) {
                    UI.showAlert('Por favor selecciona al menos un filamento y especifica su cantidad para la pieza multicolor');
                    return false;
                }
            } else {
                // Validar sistema single color tradicional
                const filamentoIndividual = document.getElementById('filamentoSeleccionado');
                const cantidadIndividual = document.getElementById('cantidadFilamento');
                
                if (!filamentoIndividual.value) {
                    UI.showAlert('Por favor selecciona un filamento');
                    return false;
                }
                
                if (!cantidadIndividual.value || parseFloat(cantidadIndividual.value) <= 0) {
                    UI.showAlert('Por favor ingresa una cantidad de material válida');
                    return false;
                }
            }
        }

        return true;
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

        // Piezas adicionales si es multi-piezas (SE APLICA BUFFER)
        if (datos.esMultiPiezas) {
            const costoPiezasAdicionales = this.calcularPiezasAdicionales();
            costosVariables += costoPiezasAdicionales;
            desglose.piezasAdicionales = costoPiezasAdicionales;
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

        // Piezas adicionales si es multi-piezas (SE APLICA BUFFER)
        if (datos.esMultiPiezas) {
            const costoPiezasAdicionales = this.calcularPiezasAdicionales();
            costosVariables += costoPiezasAdicionales;
            desglose.piezasAdicionales = costoPiezasAdicionales;
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
    }    calcularFilamentosAdicionales() {
        // Detectar si estamos usando la nueva estructura multicolor
        const filamentosMulticolor = document.querySelectorAll('.filamento-multicolor-individual');
        const cantidadesMulticolor = document.querySelectorAll('.cantidad-multicolor-individual');
        
        let costoTotal = 0;

        if (filamentosMulticolor.length > 0) {
            // Nueva estructura multicolor - calcular costo de todos los filamentos
            for (let i = 0; i < filamentosMulticolor.length; i++) {
                const filamentoId = filamentosMulticolor[i].value;
                const cantidad = parseFloat(cantidadesMulticolor[i].value) || 0;
                
                if (filamentoId && cantidad > 0) {
                    const filamento = this.data.filamentos.find(f => f.id == filamentoId);
                    if (filamento) {
                        const costoFilamento = (cantidad / 1000) * filamento.precioPorKg;
                        costoTotal += costoFilamento;
                    }
                }
            }
        } else {
            // Estructura legacy - filamentos adicionales tradicionales
            const filamentosAdicionales = document.querySelectorAll('.filamento-adicional');
            const cantidadesAdicionales = document.querySelectorAll('.cantidad-adicional');

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
        }

        // Si usamos la nueva estructura, el costo ya está calculado correctamente
        // Para la estructura legacy, aplicar recargo por multi-material
        if (filamentosMulticolor.length === 0) {
            const perfil = this.data.perfilesCostos.find(p => p.id === this.data.perfilActivoId);
            const recargoMultiMaterial = perfil?.recargoMultiMaterial || 15;
            return costoTotal * (1 + recargoMultiMaterial / 100);
        }
        
        return costoTotal;
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
                    <div style="margin-top: 10px, padding: 8px; background: rgba(255,255,255,0.7); border-radius: 4px; font-size: 0.85em;">
                        💡 <strong>Resultado:</strong> Factor de seguridad aplicado: ×${resultado.bufferErrores.toFixed(2)} 
                        (base ×${perfil.bufferErrores || 2} × dificultad ×${dificultad.toFixed(2)})
                    </div>
                </div>
            `;
        }        // Información del multi-material actualizada para usar el recargo del perfil
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

        // Información del multi-piezas usando el recargo del perfil
        let multiPiezasInfo = '';
        if (datos.esMultiPiezas) {
            const recargoMultiPiezas = perfil.recargoMultiPiezas || 10;
            multiPiezasInfo = `                <div style="background: rgba(26, 26, 46, 0.6); padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 0.9em; border-left: 4px solid var(--color-warning); color: var(--color-cosmic-mist);">
                    <strong>🧩 Impresión Multi-Piezas Activa:</strong>
                    <br><small>Recargo aplicado: ${recargoMultiPiezas}% sobre piezas adicionales (configurado en este perfil de impresora)</small>
                    <br><small>Costo adicional: €${resultado.desglose.piezasAdicionales?.toFixed(2) || '0.00'}</small>
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
        `;        contenedor.innerHTML = `
            <div class="result-box">
                <h3>💰 Resultado del Cálculo - ${perfil.nombre}</h3>
                ${formulasInfo}
                ${multiplicadoresInfo}
                ${multiMaterialInfo}
                ${multiPiezasInfo}
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
                            </div>                            ${datos.esMultiMaterial && resultado.desglose.filamentosAdicionales > 0 ? `
                            <div>
                                <strong>🎨 Material Multi-Material:</strong><br>
                                ${perfil.recargoMultiMaterial || 15}% recargo por complejidad (perfil: ${perfil.nombre})<br>
                                <span style="color: #dc3545;">€${resultado.desglose.filamentosAdicionales.toFixed(2)}</span>
                            </div>
                            ` : ''}
                            ${datos.esMultiPiezas && resultado.desglose.piezasAdicionales > 0 ? `
                            <div>
                                <strong>🧩 Piezas Multi-Piezas:</strong><br>
                                ${perfil.recargoMultiPiezas || 10}% recargo por gestión múltiple (perfil: ${perfil.nombre})<br>
                                <span style="color: #dc3545;">€${resultado.desglose.piezasAdicionales.toFixed(2)}</span>
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
    }    toggleMultiPiezas() {
        const isMulti = document.getElementById('esMultiPiezas').value === 'si';
        const section = document.getElementById('multiPiezasSection');
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
        div.className = 'filamento-adicional-item';
        div.style.cssText = `
            display: flex; 
            gap: 10px; 
            align-items: center; 
            margin-bottom: 10px; 
            padding: 10px; 
            background: rgba(26, 26, 46, 0.4); 
            border-radius: 8px; 
            border: 1px solid rgba(159, 168, 218, 0.3);
        `;
        
        div.innerHTML = `
            <select class="filamento-adicional galaxy-select" style="flex: 2;">
                <option value="">Selecciona filamento</option>
                ${filamentSelect}
            </select>
            <input type="number" class="cantidad-adicional" placeholder="Gramos" min="0" step="0.1" style="flex: 1;">
            <button type="button" class="btn-remove-filamento" style="padding: 8px; background: var(--color-danger); color: white; border: none; border-radius: 4px; cursor: pointer;">❌</button>
        `;
        
        // Agregar event listener para el botón de eliminar
        const removeBtn = div.querySelector('.btn-remove-filamento');
        removeBtn.addEventListener('click', function() {
            div.remove();
        });
        
        container.appendChild(div);
    }    agregarPiezaAdicional() {
        const container = document.getElementById('piezasAdicionales');
        if (!container) return;

        const filamentSelect = this.data.filamentos.map(f => {
            const colorInfo = f.color ? ` [${f.color}]` : '';
            return `<option value="${f.id}">${f.nombre} (${f.tipo})${colorInfo} - ${f.precioPorKg.toFixed(2)} €/kg</option>`;
        }).join('');

        const div = document.createElement('div');
        div.className = 'pieza-adicional-item';
        div.style.cssText = `
            display: flex; 
            gap: 10px; 
            align-items: center; 
            margin-bottom: 10px; 
            padding: 10px; 
            background: rgba(26, 26, 46, 0.4); 
            border-radius: 8px; 
            border: 1px solid rgba(159, 168, 218, 0.3);
        `;
        
        div.innerHTML = `
            <div style="flex: 1;">
                <label style="display: block; margin-bottom: 5px; font-size: 0.9em;">🧩 Filamento de la pieza:</label>
                <select class="pieza-adicional galaxy-select" style="width: 100%;">
                    <option value="">Selecciona filamento</option>
                    ${filamentSelect}
                </select>
            </div>
            <div style="flex: 0 0 120px;">
                <label style="display: block; margin-bottom: 5px; font-size: 0.9em;">⚖️ Gramos:</label>
                <input type="number" class="cantidad-pieza-adicional" placeholder="Gramos" min="0" step="0.1" style="width: 100%;">
            </div>
            <button type="button" class="btn-remove-pieza" style="padding: 8px; background: var(--color-danger); color: white; border: none; border-radius: 4px; cursor: pointer; height: fit-content; margin-top: 20px;">❌</button>
        `;
        
        // Agregar event listener para el botón de eliminar
        const removeBtn = div.querySelector('.btn-remove-pieza');
        removeBtn.addEventListener('click', function() {
            div.remove();
        });
        
        container.appendChild(div);
    }

    calcularPiezasAdicionales() {
        const piezasAdicionales = document.querySelectorAll('.pieza-adicional');
        const cantidadesAdicionales = document.querySelectorAll('.cantidad-pieza-adicional');
        let costoTotal = 0;

        // Calcular costo de piezas adicionales realmente agregadas
        for (let i = 0; i < piezasAdicionales.length; i++) {
            const piezaAdicionalId = piezasAdicionales[i].value;
            const cantAdicional = parseFloat(cantidadesAdicionales[i].value) || 0;
            
            if (piezaAdicionalId && cantAdicional > 0) {
                const filAdicional = this.data.filamentos.find(f => f.id == piezaAdicionalId);
                if (filAdicional) {
                    const costoAdicional = (cantAdicional / 1000) * filAdicional.precioPorKg;
                    costoTotal += costoAdicional;
                }
            }
        }

        // Si NO hay piezas adicionales específicas pero SÍ está marcado como multi-piezas,
        // aplicar recargo estimado sobre el filamento principal
        if (costoTotal === 0) {
            // Obtener datos del filamento principal para aplicar recargo
            const cantidadPrincipal = parseFloat(document.getElementById('cantidadFilamento').value) || 0;
            const filamentoPrincipalId = document.getElementById('filamentoSeleccionado').value;
            
            if (filamentoPrincipalId && cantidadPrincipal > 0) {
                const filamentoPrincipal = this.data.filamentos.find(f => f.id == filamentoPrincipalId);
                if (filamentoPrincipal) {
                    // Obtener el perfil activo para usar SU recargo específico
                    const perfil = this.data.perfilesCostos.find(p => p.id === this.data.perfilActivoId);
                    const recargoMultiPiezas = perfil?.recargoMultiPiezas || 10;
                    const porcentajeAdicional = recargoMultiPiezas / 100;
                    const estimacionAdicional = cantidadPrincipal * porcentajeAdicional;
                    costoTotal = (estimacionAdicional / 1000) * filamentoPrincipal.precioPorKg;
                }
            }
        }        // Aplicar recargo por multi-piezas SIEMPRE que esté activado
        // Usar el recargo específico del perfil activo
        const perfil = this.data.perfilesCostos.find(p => p.id === this.data.perfilActivoId);
        const recargoMultiPiezas = perfil?.recargoMultiPiezas || 10;
        return costoTotal * (1 + recargoMultiPiezas / 100);
    }

    // === NUEVAS FUNCIONES PARA LA INTERFAZ REESTRUCTURADA ===
    
    cambiarTipoImpresion() {
        const tipoImpresion = document.getElementById('tipoImpresion').value;
        const seccionIndividual = document.getElementById('seccionIndividual');
        const seccionMultiple = document.getElementById('seccionMultiple');

        // Ocultar ambas secciones primero
        seccionIndividual?.classList.add('hidden');
        seccionMultiple?.classList.add('hidden');

        // Mostrar la sección correspondiente
        if (tipoImpresion === 'individual') {
            seccionIndividual?.classList.remove('hidden');
            this.resetearSeccionMultiple();
            
            // Asegurar que los selectores de filamentos estén poblados
            setTimeout(() => {
                this.inicializarSelectoresFilamentos();
            }, 100);
        } else if (tipoImpresion === 'multiple') {
            seccionMultiple?.classList.remove('hidden');
            this.resetearSeccionIndividual();
            this.actualizarEstadisticasMaterial();
            
            // Asegurar que los selectores de filamentos estén poblados
            setTimeout(() => {
                this.inicializarSelectoresFilamentos();
            }, 100);
        }

        console.log(`🔄 Cambio a modo: ${tipoImpresion}`);
    }

    resetearSeccionIndividual() {
        // Limpiar valores de la sección individual
        document.getElementById('filamentoSeleccionado').value = '';
        document.getElementById('cantidadFilamento').value = '';
        document.getElementById('esMultiMaterialIndividual').value = 'no';
        document.getElementById('numPiezasExternas').value = '0';
        document.getElementById('costoPiezasExternas').value = '0';
        document.getElementById('costoEnsamblaje').value = '0';
        
        // Ocultar sección multi-material individual
        const multiMaterialIndividualSection = document.getElementById('multiMaterialIndividualSection');
        multiMaterialIndividualSection?.classList.add('hidden');
        
        // Limpiar filamentos adicionales individuales
        const container = document.getElementById('filamentosAdicionalesIndividual');
        if (container) container.innerHTML = '';
    }

    resetearSeccionMultiple() {
        // Limpiar valores de la sección múltiple
        document.getElementById('filamentoPrincipalMultiple').value = '';
        document.getElementById('cantidadPrincipalMultiple').value = '';
        document.getElementById('esMultiMaterialMultiple').value = 'no';
        
        // Limpiar piezas adicionales
        const listaPiezas = document.getElementById('listaPiezasMultiples');
        const piezasAdicionales = listaPiezas?.querySelectorAll('.piece-item:not(.piece-principal)');
        piezasAdicionales?.forEach(pieza => pieza.remove());
        
        // Ocultar sección multi-material múltiple
        const multiMaterialMultipleSection = document.getElementById('multiMaterialMultipleSection');
        multiMaterialMultipleSection?.classList.add('hidden');
          // Limpiar estadísticas
        this.actualizarEstadisticasMaterial();
    }

    toggleMultiMaterialIndividual() {
        const isMulti = document.getElementById('esMultiMaterialIndividual').value === 'si';
        const singleColorSection = document.getElementById('singleColorIndividualSection');
        const multiColorSection = document.getElementById('multiMaterialIndividualSection');
        
        if (isMulti) {
            // Mostrar sección multicolor, ocultar sección single
            singleColorSection?.classList.add('hidden');
            multiColorSection?.classList.remove('hidden');
            
            // Cargar filamentos en la sección multicolor
            this.cargarFilamentosMulticolorIndividual();
            this.actualizarTotalIndividual();
        } else {
            // Mostrar sección single, ocultar multicolor
            singleColorSection?.classList.remove('hidden');
            multiColorSection?.classList.add('hidden');
            
            // Limpiar filamentos multicolor
            const container = document.getElementById('filamentosAdicionalesIndividual');
            if (container) {
                // Mantener solo el primer filamento
                const firstItem = container.querySelector('.filamento-multicolor-item');
                if (firstItem) {
                    const selects = firstItem.querySelectorAll('.filamento-multicolor-individual');
                    const inputs = firstItem.querySelectorAll('.cantidad-multicolor-individual');
                    selects.forEach(select => select.value = '');
                    inputs.forEach(input => input.value = '');
                }
                // Eliminar filamentos adicionales
                const additionalItems = container.querySelectorAll('.filamento-multicolor-item:not(:first-child)');
                additionalItems.forEach(item => item.remove());
            }
        }
    }

    toggleMultiMaterialMultiple() {
        const isMulti = document.getElementById('esMultiMaterialMultiple').value === 'si';
        const section = document.getElementById('multiMaterialMultipleSection');
        if (section) {
            if (isMulti) {
                section.classList.remove('hidden');
                this.generarConfiguracionMulticolorPorPieza();
            } else {
                section.classList.add('hidden');
                // Limpiar configuración multicolor
                const container = document.getElementById('multicolorPorPieza');
                if (container) container.innerHTML = '';
            }
        }
    }    agregarFilamentoAdicionalIndividual() {
        const container = document.getElementById('filamentosAdicionalesIndividual');
        if (!container) return;

        const filamentSelect = this.data.filamentos.map(f => {
            const colorInfo = f.color ? ` [${f.color}]` : '';
            return `<option value="${f.id}">${f.nombre} (${f.tipo})${colorInfo} - ${f.precioPorKg.toFixed(2)} €/kg</option>`;
        }).join('');

        const filamentNumber = container.children.length + 1;

        const div = document.createElement('div');
        div.className = 'filamento-multicolor-item';
        
        div.innerHTML = `
            <h6>🎨 Filamento ${filamentNumber}
                <button type="button" class="btn-remove-filamento-multicolor">❌</button>
            </h6>
            <div class="form-row">
                <div class="form-group">
                    <label>Filamento:</label>
                    <select class="filamento-multicolor-individual galaxy-select" onchange="actualizarTotalIndividual()">
                        <option value="">Selecciona filamento</option>
                        ${filamentSelect}
                    </select>
                </div>
                <div class="form-group">
                    <label>Cantidad (gramos):</label>
                    <input type="number" class="cantidad-multicolor-individual" min="0" step="0.1" placeholder="Ej: 30" onchange="actualizarTotalIndividual()">
                </div>
            </div>
        `;
        
        // Agregar event listener para el botón de eliminar
        const removeBtn = div.querySelector('.btn-remove-filamento-multicolor');
        removeBtn.addEventListener('click', () => {
            div.remove();
            this.actualizarTotalIndividual();
            this.actualizarNumeracionFilamentosIndividual();
        });
        
        container.appendChild(div);
    }

    agregarPiezaMultiple() {
        const container = document.getElementById('listaPiezasMultiples');
        if (!container) return;

        const filamentSelect = this.data.filamentos.map(f => {
            const colorInfo = f.color ? ` [${f.color}]` : '';
            return `<option value="${f.id}">${f.nombre} (${f.tipo})${colorInfo} - ${f.precioPorKg.toFixed(2)} €/kg</option>`;
        }).join('');

        const pieceNumber = container.children.length + 1;        const div = document.createElement('div');
        div.className = 'piece-item';
        div.innerHTML = `
            <button class="piece-remove-btn" type="button">❌</button>
            <h6>🔸 Pieza ${pieceNumber}</h6>
            
            <!-- Tiempo individual para esta pieza -->
            <div class="form-group">
                <label>⏱️ Tiempo de impresión para esta pieza:</label>
                <div class="time-input-group">
                    <input type="number" class="tiempo-pieza-horas" min="0" max="999" placeholder="Horas" style="width: 120px;" data-piece-id="pieza-${pieceNumber}">
                    <span>h</span>
                    <input type="number" class="tiempo-pieza-minutos" min="0" max="59" placeholder="Min" style="width: 100px;" data-piece-id="pieza-${pieceNumber}">
                    <span>m</span>
                </div>
                <small>Tiempo que tarda en imprimir solo esta pieza individual</small>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Filamento:</label>
                    <select class="filamento-pieza-multiple galaxy-select" onchange="app.managers.calculator.actualizarEstadisticasMaterial()">
                        <option value="">Selecciona filamento</option>
                        ${filamentSelect}
                    </select>
                </div>
                <div class="form-group">
                    <label>Cantidad (gramos):</label>
                    <input type="number" class="cantidad-pieza-multiple" min="0" step="0.1" placeholder="Ej: 30" onchange="app.managers.calculator.actualizarEstadisticasMaterial()">
                </div>
            </div>
        `;
        
        // Agregar event listener para el botón de eliminar
        const removeBtn = div.querySelector('.piece-remove-btn');
        removeBtn.addEventListener('click', () => {
            div.remove();
            this.actualizarEstadisticasMaterial();
            this.actualizarNumeracionPiezas();
        });
        
        container.appendChild(div);
        this.actualizarEstadisticasMaterial();
    }

    actualizarNumeracionPiezas() {
        const container = document.getElementById('listaPiezasMultiples');
        if (!container) return;

        const piezas = container.querySelectorAll('.piece-item:not(.piece-principal)');
        piezas.forEach((pieza, index) => {
            const titulo = pieza.querySelector('h6');
            if (titulo) {
                titulo.textContent = `🔸 Pieza ${index + 2}`;
            }
        });
    }

    calcularCostoEnsamblaje() {
        const numPiezas = parseInt(document.getElementById('numPiezasExternas').value) || 0;
        const costoEnsamblaje = numPiezas * 1; // €1 por pieza externa
        document.getElementById('costoEnsamblaje').value = costoEnsamblaje.toFixed(2);
    }

    actualizarEstadisticasMaterial() {
        const tipoImpresion = document.getElementById('tipoImpresion').value;
        
        if (tipoImpresion !== 'multiple') return;

        const resumenContainer = document.getElementById('resumenMateriales');
        if (!resumenContainer) return;

        // Recopilar datos del filamento principal
        const filamentoPrincipalId = document.getElementById('filamentoPrincipalMultiple').value;
        const cantidadPrincipal = parseFloat(document.getElementById('cantidadPrincipalMultiple').value) || 0;        // Recopilar datos de piezas adicionales
        const piezasContainer = document.getElementById('listaPiezasMultiples');
        if (piezasContainer) {
            const piezas = piezasContainer.querySelectorAll('.piece-item');
            
            piezas.forEach(pieza => {
                const pieceId = pieza.getAttribute('data-piece-id');
                const tipoMaterial = pieza.querySelector('.tipo-material-pieza');
                
                if (tipoMaterial && tipoMaterial.value === 'multi') {
                    // Pieza multicolor - obtener datos de múltiples filamentos
                    const filamentosMulti = pieza.querySelectorAll('.filamento-multicolor-pieza');
                    const cantidadesMulti = pieza.querySelectorAll('.cantidad-multicolor-pieza');
                    
                    for (let i = 0; i < filamentosMulti.length; i++) {
                        const filamentoId = filamentosMulti[i].value;
                        const cantidad = parseFloat(cantidadesMulti[i].value) || 0;
                        
                        if (filamentoId && cantidad > 0) {
                            const filamento = this.data.filamentos.find(f => f.id == filamentoId);
                            if (filamento) {
                                if (materiales.has(filamento.id)) {
                                    // Acumular si ya existe
                                    const material = materiales.get(filamento.id);
                                    material.gramos += cantidad;
                                    material.costoTotal = (material.gramos / 1000) * material.precioPorKg;
                                } else {
                                    // Agregar nuevo
                                    materiales.set(filamento.id, {
                                        nombre: filamento.nombre,
                                        tipo: filamento.tipo,
                                        color: filamento.color,
                                        gramos: cantidad,
                                        precioPorKg: filamento.precioPorKg,
                                        costoTotal: (cantidad / 1000) * filamento.precioPorKg
                                    });
                                }
                                totalGramos += cantidad;
                            }
                        }
                    }
                    if (filamentosMulti.length > 0) totalPiezas += 1;
                } else {
                    // Pieza single color - usar estructura tradicional
                    const filamentoSelect = pieza.querySelector('.filamento-pieza-multiple');
                    const cantidadInput = pieza.querySelector('.cantidad-pieza-multiple');
                    
                    if (filamentoSelect && cantidadInput) {
                        const filamentoId = filamentoSelect.value;
                        const cantidad = parseFloat(cantidadInput.value) || 0;
                        
                        if (filamentoId && cantidad > 0) {
                            if (materiales.has(filamentoId)) {
                                // Acumular si ya existe
                                const material = materiales.get(filamentoId);
                                material.gramos += cantidad;
                                material.costoTotal = (material.gramos / 1000) * material.precioPorKg;
                            } else {
                                // Agregar nuevo
                                materiales.set(filamentoId, {
                                    nombre: filamento.nombre,
                                    tipo: filamento.tipo,
                                    color: filamento.color,
                                    gramos: cantidad,
                                    precioPorKg: filamento.precioPorKg,
                                    costoTotal: (cantidad / 1000) * filamento.precioPorKg
                                });
                            }
                            totalGramos += cantidad;
                            totalPiezas += 1;
                        }
                    }
                }
            });
        }

        // Calcular costo total
        let costoTotalMateriales = 0;
        materiales.forEach(material => {
            costoTotalMateriales += material.costoTotal;
        });

        // Generar HTML del resumen

        let html = `
            <div class="material-stat">
                <span class="material-stat-label">Total de Piezas</span>
                <span class="material-stat-value">${totalPiezas}</span>
            </div>
            <div class="material-stat">
                <span class="material-stat-label">Material Total</span>
                <span class="material-stat-value">${totalGramos.toFixed(1)}g</span>
            </div>
            <div class="material-stat">
                <span class="material-stat-label">Costo Material</span>
                <span class="material-stat-value">€${costoTotalMateriales.toFixed(2)}</span>
            </div>
            <div class="material-stat">
                <span class="material-stat-label">Tipos de Material</span>
                <span class="material-stat-value">${materiales.size}</span>
            </div>
        `;

        // Agregar desglose por material si hay datos
        if (materiales.size > 0) {

            html += '<div style="grid-column: 1 / -1; margin-top: 10px;"><strong>Desglose por material:</strong><br>';
            materiales.forEach(material => {
                const colorInfo = material.color ? ` (${material.color})` : '';
                html += `<small>• ${material.nombre}${colorInfo}: ${material.gramos.toFixed(1)}g - €${material.costoTotal.toFixed(2)}</small><br>`;
            });
            html += '</div>';
        }

        resumenContainer.innerHTML = html;
    }

    generarConfiguracionMulticolorPorPieza() {
        const container = document.getElementById('multicolorPorPieza');
        if (!container) return;

        // Obtener todas las piezas (principal + adicionales)
        const piezas = [];
        
        // Pieza principal
        const filamentoPrincipal = document.getElementById('filamentoPrincipalMultiple').value;
        if (filamentoPrincipal) {
            const filamento = this.data.filamentos.find(f => f.id == filamentoPrincipal);
            if (filamento) {
                piezas.push({ id: 'principal', nombre: 'Pieza Principal', filamento: filamento.nombre });
            }
        }

        // Piezas adicionales
        const filamentosPiezas = document.querySelectorAll('.filamento-pieza-multiple');
        filamentosPiezas.forEach((select, index) => {
            if (select.value) {
                const filamento = this.data.filamentos.find(f => f.id == select.value);
                if (filamento) {
                    piezas.push({ 
                        id: `pieza_${index + 2}`, 
                        nombre: `Pieza ${index + 2}`, 
                        filamento: filamento.nombre 
                    });
                }
            }
        });

        // Generar configuración
        let html = '';
        piezas.forEach(pieza => {
            html += `
                <div class="multicolor-piece-config">
                    <h6>${pieza.nombre} (${pieza.filamento})</h6>
                    <label>
                        <input type="checkbox" class="multicolor-checkbox" data-pieza="${pieza.id}">
                        ¿Esta pieza necesita múltiples colores?
                    </label>
                    <div class="multicolor-details hidden" id="multicolor_${pieza.id}">
                        <button type="button" class="btn galaxy-btn" onclick="app.managers.calculator.agregarColorPieza('${pieza.id}')">
                            + Agregar color adicional
                        </button>
                        <div class="colores-adicionales" id="colores_${pieza.id}"></div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Agregar event listeners para los checkboxes
        container.querySelectorAll('.multicolor-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const piezaId = this.dataset.pieza;
                const details = document.getElementById(`multicolor_${piezaId}`);
                if (details) {
                    if (this.checked) {
                        details.classList.remove('hidden');
                    } else {
                        details.classList.add('hidden');
                        // Limpiar colores adicionales
                        const coloresContainer = document.getElementById(`colores_${piezaId}`);
                        if (coloresContainer) coloresContainer.innerHTML = '';
                    }
                }
            });
        });
    }

    agregarColorPieza(piezaId) {
        const container = document.getElementById(`colores_${piezaId}`);
        if (!container) return;

        const filamentSelect = this.data.filamentos.map(f => {
            const colorInfo = f.color ? ` [${f.color}]` : '';
            return `<option value="${f.id}">${f.nombre} (${f.tipo})${colorInfo} - ${f.precioPorKg.toFixed(2)} €/kg</option>`;
        }).join('');

        const div = document.createElement('div');
        div.className = 'color-adicional-item';
        div.style.cssText = `
            display: flex; 
            gap: 10px; 
            align-items: center; 
            margin-bottom: 8px; 
            padding: 8px; 
            background: rgba(255, 255, 255, 0.05); 
            border-radius: 6px;
        `;
        
        div.innerHTML = `
            <select class="color-adicional galaxy-select" style="flex: 2;">
                <option value="">Selecciona color adicional</option>
                ${filamentSelect}
            </select>
            <input type="number" class="cantidad-color-adicional" placeholder="Gramos" min="0" step="0.1" style="flex: 1;">
            <button type="button" class="btn-remove-color" style="padding: 6px; background: var(--color-danger); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8em;">❌</button>
        `;
          // Agregar event listener para el botón de eliminar
        const removeBtn = div.querySelector('.btn-remove-color');
        removeBtn.addEventListener('click', function() {
            div.remove();
        });
        
        container.appendChild(div);
    }

    // Función para calcular el tiempo total sumando los tiempos individuales de cada pieza
    calcularTiempoTotalPiezasIndividuales() {
        let tiempoTotal = 0;
        
        // Obtener tiempo de la pieza principal
        const horasPrincipal = parseInt(document.querySelector('.tiempo-pieza-horas[data-piece-id="principal"]')?.value) || 0;
        const minutosPrincipal = parseInt(document.querySelector('.tiempo-pieza-minutos[data-piece-id="principal"]')?.value) || 0;
        tiempoTotal += horasPrincipal + (minutosPrincipal / 60);
        
        // Obtener tiempos de las piezas adicionales
        const piezasAdicionales = document.querySelectorAll('.piece-item:not(.piece-principal)');
        piezasAdicionales.forEach(pieza => {
            const horasInput = pieza.querySelector('.tiempo-pieza-horas');
            const minutosInput = pieza.querySelector('.tiempo-pieza-minutos');
            
            if (horasInput && minutosInput) {
                const horas = parseInt(horasInput.value) || 0;
                const minutos = parseInt(minutosInput.value) || 0;
                tiempoTotal += horas + (minutos / 60);
            }
        });
        
        return tiempoTotal;    }

    // Actualizar el método obtenerDatosFormulario para la nueva estructura
    obtenerDatosFormularioNuevo() {
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
            // Para modo individual: usar tiempo general
            const horas = parseInt(document.getElementById('tiempoHoras').value) || 0;
            const minutos = parseInt(document.getElementById('tiempoMinutos').value) || 0;
            tiempoHoras = horas + (minutos / 60);
        }

        // Manejar tiempo de mano de obra (solo horas + minutos)
        let tiempoManoObra = 0;
        const horasManoObra = parseInt(document.getElementById('tiempoManoObraHoras').value) || 0;
        const minutosManoObra = parseInt(document.getElementById('tiempoManoObraMinutos').value) || 0;
        
        tiempoManoObra = horasManoObra + (minutosManoObra / 60);

        let datos = {
            tipoImpresion,
            tiempoHoras,
            tiempoManoObra,
            tarifaOperador,
            tipoBoquilla: document.getElementById('tipoBoquilla').value
        };        if (tipoImpresion === 'individual') {
            datos.esMultiMaterial = document.getElementById('esMultiMaterialIndividual').value === 'si';
            
            if (datos.esMultiMaterial) {
                // Para multicolor, obtener datos de los múltiples filamentos
                const filamentosSelects = document.querySelectorAll('.filamento-multicolor-individual');
                const cantidadesInputs = document.querySelectorAll('.cantidad-multicolor-individual');
                
                let totalGramos = 0;
                let primerFilamentoId = '';
                
                for (let i = 0; i < filamentosSelects.length; i++) {
                    const filamentoId = filamentosSelects[i].value;
                    const cantidad = parseFloat(cantidadesInputs[i].value) || 0;
                    
                    if (filamentoId && cantidad > 0) {
                        if (!primerFilamentoId) {
                            primerFilamentoId = filamentoId; // Usar el primer filamento como principal
                        }
                        totalGramos += cantidad;
                    }
                }
                
                datos.filamentoId = primerFilamentoId;
                datos.cantidadGramos = totalGramos;
            } else {
                // Para single color, usar los campos tradicionales
                datos.filamentoId = document.getElementById('filamentoSeleccionado').value;
                datos.cantidadGramos = parseFloat(document.getElementById('cantidadFilamento').value) || 0;
            }
            
            datos.numPiezasExternas = parseInt(document.getElementById('numPiezasExternas').value) || 0;
            datos.costoPiezasExternas = parseFloat(document.getElementById('costoPiezasExternas').value) || 0;
            datos.costoEnsamblaje = parseFloat(document.getElementById('costoEnsamblaje').value) || 0;
        } else if (tipoImpresion === 'multiple') {
            datos.filamentoId = document.getElementById('filamentoPrincipalMultiple').value;
            datos.cantidadGramos = parseFloat(document.getElementById('cantidadPrincipalMultiple').value) || 0;
            datos.esMultiPiezas = true;
            datos.esMultiMaterial = document.getElementById('esMultiMaterialMultiple').value === 'si';
            datos.costoPiezasExternas = 0; // No aplica en modo múltiple
        }return datos;
    }

    // === NUEVAS FUNCIONES PARA SISTEMA MULTICOLOR MEJORADO ===

    cargarFilamentosMulticolorIndividual() {
        const container = document.getElementById('filamentosAdicionalesIndividual');
        if (!container) return;

        // Si no hay filamentos, crear el primer filamento
        if (container.children.length === 0) {
            const filamentSelect = this.data.filamentos.map(f => {
                const colorInfo = f.color ? ` [${f.color}]` : '';
                return `<option value="${f.id}">${f.nombre} (${f.tipo})${colorInfo} - ${f.precioPorKg.toFixed(2)} €/kg</option>`;
            }).join('');

            const div = document.createElement('div');
            div.className = 'filamento-multicolor-item';
            div.innerHTML = `
                <h6>🎨 Filamento 1</h6>
                <div class="form-row">
                    <div class="form-group">
                        <label>Filamento:</label>
                        <select class="filamento-multicolor-individual galaxy-select" onchange="actualizarTotalIndividual()">
                            <option value="">Selecciona filamento</option>
                            ${filamentSelect}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cantidad (gramos):</label>
                        <input type="number" class="cantidad-multicolor-individual" min="0" step="0.1" placeholder="Ej: 30" onchange="actualizarTotalIndividual()">
                    </div>
                </div>
            `;
            container.appendChild(div);
        }
    }

    actualizarNumeracionFilamentosIndividual() {
        const container = document.getElementById('filamentosAdicionalesIndividual');
        if (!container) return;

        const filamentos = container.querySelectorAll('.filamento-multicolor-item');
        filamentos.forEach((filamento, index) => {
            const titulo = filamento.querySelector('h6');
            if (titulo) {
                const removeBtn = titulo.querySelector('.btn-remove-filamento');
                const btnHtml = removeBtn ? removeBtn.outerHTML : '';
                titulo.innerHTML = `🎨 Filamento ${index + 1} ${btnHtml}`;
            }
        });
    }

    actualizarTotalIndividual() {
        const container = document.getElementById('filamentosAdicionalesIndividual');
        const totalElement = document.getElementById('totalGramosIndividual');
        
        if (!container || !totalElement) return;

        let totalGramos = 0;
        const cantidades = container.querySelectorAll('.cantidad-multicolor-individual');
        
        cantidades.forEach(input => {
            const cantidad = parseFloat(input.value) || 0;
            totalGramos += cantidad;
        });

        totalElement.textContent = `${totalGramos.toFixed(1)}g`;
        
        // Actualizar color del total según la cantidad
        if (totalGramos > 0) {
            totalElement.style.color = 'var(--color-stellar-blue)';
        } else {
            totalElement.style.color = 'var(--color-stellar-white)';
        }
    }

    toggleMultiMaterialPieza(pieceId) {
        const piece = document.querySelector(`[data-piece-id="${pieceId}"]`);
        if (!piece) return;

        const tipoSelect = piece.querySelector('.tipo-material-pieza');
        const singleSection = piece.querySelector('.single-color-pieza-section');
        const multiSection = piece.querySelector('.multi-color-pieza-section');

        if (!tipoSelect || !singleSection || !multiSection) return;

        const isMulti = tipoSelect.value === 'multi';

        if (isMulti) {
            // Cambiar a multicolor
            singleSection.classList.add('hidden');
            multiSection.classList.remove('hidden');
            
            // Cargar filamentos si no existen
            this.cargarFilamentosPieza(pieceId);
            this.actualizarTotalPieza(pieceId);
        } else {
            // Cambiar a single color
            singleSection.classList.remove('hidden');
            multiSection.classList.add('hidden');
            
            // Limpiar datos multicolor
            const filamentosList = multiSection.querySelector('.filamentos-pieza-list');
            if (filamentosList) {
                const firstItem = filamentosList.querySelector('.filamento-multicolor-pieza-item');
                if (firstItem) {
                    const selects = firstItem.querySelectorAll('.filamento-multicolor-pieza');
                    const inputs = firstItem.querySelectorAll('.cantidad-multicolor-pieza');
                    selects.forEach(select => select.value = '');
                    inputs.forEach(input => input.value = '');
                }
                // Eliminar filamentos adicionales
                const additionalItems = filamentosList.querySelectorAll('.filamento-multicolor-pieza-item:not(:first-child)');
                additionalItems.forEach(item => item.remove());
            }
        }

        // Actualizar estadísticas generales
        this.actualizarEstadisticasMaterial();
    }

    cargarFilamentosPieza(pieceId) {
        const piece = document.querySelector(`[data-piece-id="${pieceId}"]`);
        if (!piece) return;

        const filamentosList = piece.querySelector('.filamentos-pieza-list');
        if (!filamentosList) return;

        // Cargar filamentos en selects existentes
        const selects = filamentosList.querySelectorAll('.filamento-multicolor-pieza');
        const filamentSelect = this.data.filamentos.map(f => {
            const colorInfo = f.color ? ` [${f.color}]` : '';
            return `<option value="${f.id}">${f.nombre} (${f.tipo})${colorInfo} - ${f.precioPorKg.toFixed(2)} €/kg</option>`;
        }).join('');

        selects.forEach(select => {
            if (select.children.length <= 1) { // Solo tiene la opción por defecto
                select.innerHTML = `
                    <option value="">Selecciona filamento</option>
                    ${filamentSelect}
                `;
            }
        });
    }

    agregarFilamentoPieza(pieceId) {
        const piece = document.querySelector(`[data-piece-id="${pieceId}"]`);
        if (!piece) return;

        const filamentosList = piece.querySelector('.filamentos-pieza-list');
        if (!filamentosList) return;

        const filamentSelect = this.data.filamentos.map(f => {
            const colorInfo = f.color ? ` [${f.color}]` : '';
            return `<option value="${f.id}">${f.nombre} (${f.tipo})${colorInfo} - ${f.precioPorKg.toFixed(2)} €/kg</option>`;
        }).join('');

        const filamentNumber = filamentosList.children.length + 1;

        const div = document.createElement('div');
        div.className = 'filamento-multicolor-pieza-item';
        
        div.innerHTML = `
            <h6>🎨 Filamento ${filamentNumber}
                <button type="button" class="btn-remove-filamento-multicolor">❌</button>
            </h6>
            <div class="form-row">
                <div class="form-group">
                    <label>Filamento:</label>
                    <select class="filamento-multicolor-pieza galaxy-select" onchange="actualizarTotalPieza('${pieceId}')">
                        <option value="">Selecciona filamento</option>
                        ${filamentSelect}
                    </select>
                </div>
                <div class="form-group">
                    <label>Cantidad (gramos):</label>
                    <input type="number" class="cantidad-multicolor-pieza" min="0" step="0.1" placeholder="Ej: 20" onchange="actualizarTotalPieza('${pieceId}')">
                </div>
            </div>
        `;
        
        // Agregar event listener para el botón de eliminar
        const removeBtn = div.querySelector('.btn-remove-filamento-multicolor');
        removeBtn.addEventListener('click', () => {
            div.remove();
            this.actualizarTotalPieza(pieceId);
            this.actualizarNumeracionFilamentosPieza(pieceId);
            this.actualizarEstadisticasMaterial();
        });
        
        filamentosList.appendChild(div);
    }

    actualizarNumeracionFilamentosPieza(pieceId) {
        const piece = document.querySelector(`[data-piece-id="${pieceId}"]`);
        if (!piece) return;

        const filamentos = piece.querySelectorAll('.filamento-multicolor-pieza-item');
        filamentos.forEach((filamento, index) => {
            const titulo = filamento.querySelector('h6');
            if (titulo) {
                const removeBtn = titulo.querySelector('.btn-remove-filamento');
                const btnHtml = removeBtn ? removeBtn.outerHTML : '';
                titulo.innerHTML = `🎨 Filamento ${index + 1} ${btnHtml}`;
            }
        });
    }

    actualizarTotalPieza(pieceId) {
        const piece = document.querySelector(`[data-piece-id="${pieceId}"]`);
        if (!piece) return;

        const totalElement = piece.querySelector('.total-gramos-value');
        if (!totalElement) return;

        let totalGramos = 0;
        const cantidades = piece.querySelectorAll('.cantidad-multicolor-pieza');
        
        cantidades.forEach(input => {
            const cantidad = parseFloat(input.value) || 0;
            totalGramos += cantidad;
        });

        totalElement.textContent = `${totalGramos.toFixed(1)}g`;
        
        // Actualizar color del total según la cantidad
        if (totalGramos > 0) {
            totalElement.style.color = 'var(--color-stellar-blue)';
        } else {
            totalElement.style.color = 'var(--color-stellar-white)';
        }

        // Actualizar estadísticas generales
        this.actualizarEstadisticasMaterial();
    }

    // Función auxiliar para contar el total de piezas en modo múltiple
    contarPiezasMultiples() {
        const tipoImpresion = document.getElementById('tipoImpresion').value;
        
        if (tipoImpresion !== 'multiple') {
            return 1; // En modo individual siempre es 1 pieza
        }

        let totalPiezas = 0;
        
        // Contar la pieza principal
        const cantidadPrincipal = parseFloat(document.getElementById('cantidadPrincipalMultiple').value) || 0;
        if (cantidadPrincipal > 0) {
            totalPiezas += 1;
        }
        
        // Contar las piezas adicionales
        const piezasContainer = document.getElementById('listaPiezasMultiples');
        if (piezasContainer) {
            const piezas = piezasContainer.querySelectorAll('.piece-item');
            
            piezas.forEach(pieza => {
                const tipoMaterial = pieza.querySelector('.tipo-material-pieza');
                
                if (tipoMaterial && tipoMaterial.value === 'multi') {
                    // Pieza multicolor - verificar si tiene filamentos
                    const filamentosMulti = pieza.querySelectorAll('.filamento-multicolor-pieza');
                    let tieneMateriales = false;
                    
                    for (let i = 0; i < filamentosMulti.length; i++) {
                        const filamentoId = filamentosMulti[i].value;
                        const cantidad = parseFloat(pieza.querySelectorAll('.cantidad-multicolor-pieza')[i].value) || 0;
                        
                        if (filamentoId && cantidad > 0) {
                            tieneMateriales = true;
                            break;
                        }
                    }
                    
                    if (tieneMateriales) {
                        totalPiezas += 1;
                    }
                } else {
                    // Pieza single color
                    const filamentoSelect = pieza.querySelector('.filamento-pieza-multiple');
                    const cantidadInput = pieza.querySelector('.cantidad-pieza-multiple');
                    
                    if (filamentoSelect && cantidadInput) {
                        const filamentoId = filamentoSelect.value;
                        const cantidad = parseFloat(cantidadInput.value) || 0;
                        
                        if (filamentoId && cantidad > 0) {
                            totalPiezas += 1;
                        }
                    }
                }
            });
        }
        
        return Math.max(totalPiezas, 1); // Mínimo 1 pieza
    }

    // Función para calcular el tiempo total sumando los tiempos individuales de cada pieza
    calcularTiempoTotalPiezasIndividuales() {
        let tiempoTotal = 0;
        
        // Obtener tiempo de la pieza principal
        const horasPrincipal = parseInt(document.querySelector('.tiempo-pieza-horas[data-piece-id="principal"]')?.value) || 0;
        const minutosPrincipal = parseInt(document.querySelector('.tiempo-pieza-minutos[data-piece-id="principal"]')?.value) || 0;
        tiempoTotal += horasPrincipal + (minutosPrincipal / 60);
        
        // Obtener tiempos de las piezas adicionales
        const piezasAdicionales = document.querySelectorAll('.piece-item:not(.piece-principal)');
        piezasAdicionales.forEach(pieza => {
            const horasInput = pieza.querySelector('.tiempo-pieza-horas');
            const minutosInput = pieza.querySelector('.tiempo-pieza-minutos');
            
            if (horasInput && minutosInput) {
                const horas = parseInt(horasInput.value) || 0;
                const minutos = parseInt(minutosInput.value) || 0;
                tiempoTotal += horas + (minutos / 60);
            }
        });
        
        return tiempoTotal;
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

function toggleMultiPiezas() {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.toggleMultiPiezas();
    }
}

function agregarPiezaAdicional() {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.agregarPiezaAdicional();
    }
}

// Additional global functions for new interface
function cambiarTipoImpresion() {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.cambiarTipoImpresion();
    }
}

function toggleMultiMaterialIndividual() {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.toggleMultiMaterialIndividual();
    }
}

function toggleMultiMaterialMultiple() {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.toggleMultiMaterialMultiple();
    }
}

function agregarPiezaMultiple() {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.agregarPiezaMultiple();
    }
}

// === NUEVAS FUNCIONES GLOBALES PARA SISTEMA MULTICOLOR ===

function cargarFilamentosMulticolorIndividual() {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.cargarFilamentosMulticolorIndividual();
    }
}

function actualizarTotalIndividual() {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.actualizarTotalIndividual();
    }
}

function toggleMultiMaterialPieza(pieceId) {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.toggleMultiMaterialPieza(pieceId);
    }
}

function cargarFilamentosPieza(pieceId) {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.cargarFilamentosPieza(pieceId);
    }
}

function agregarFilamentoPieza(pieceId) {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.agregarFilamentoPieza(pieceId);
    }
}

function actualizarTotalPieza(pieceId) {
    if (window.app && window.app.managers.calculator) {
        window.app.managers.calculator.actualizarTotalPieza(pieceId);
    }
}

// Función global para toggle de piezas externas
function togglePiezasExternas() {
    const tieneExternas = document.getElementById('tienePiezasExternas').value === 'si';
    const section = document.getElementById('piezasExternasSection');
    
    if (tieneExternas) {
        section.classList.remove('hidden');
    } else {
        section.classList.add('hidden');
        // Limpiar valores cuando se oculta
        document.getElementById('numPiezasExternas').value = '0';
        document.getElementById('costoPiezasExternas').value = '0';
        document.getElementById('costoEnsamblaje').value = '0';
    }
}


