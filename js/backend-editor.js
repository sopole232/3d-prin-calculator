console.log('🔧 backend-editor.js cargando...');

class BackendEditor {
    constructor(data) {
        this.data = data;
        this.formulasFinales = this.getDefaultFormulasFinales();
        console.log('🔧 BackendEditor inicializado con datos:', Object.keys(data));
    }

    getDefaultFormulasText() {
        return `# 🧵 COSTO DEL FILAMENTO
# Peso × Precio/kg × (1 + Desperdicio%)
cantidadGramos / 1000 * precioPorKg * (1 + desperdicioMaterial / 100)

# ⚡ COSTO DE ELECTRICIDAD  
# (Potencia/1000) × Horas × Costo/kWh
potencia / 1000 * tiempoHoras * costoElectricidad

# 🔧 COSTO DE MANTENIMIENTO
# Horas × (Costo mantenimiento / Intervalo)
tiempoHoras * costoMantenimientoPorHora

# 🏭 COSTO DE AMORTIZACIÓN
# Horas × Factor amortización
tiempoHoras * factorAmortizacion

# 👨‍💼 COSTO DE MANO DE OBRA
# Tiempo trabajo × Tarifa/hora
tiempoManoObra * tarifaOperador

# 📝 VARIABLES DISPONIBLES:
# cantidadGramos - Gramos de filamento usado
# tiempoHoras - Horas de impresión
# precioPorKg - Precio del filamento por kg
# potencia - Potencia de la impresora en watts
# costoElectricidad - Costo de electricidad por kWh
# factorAmortizacion - Factor de amortización calculado
# desperdicioMaterial - Porcentaje de desperdicio
# tarifaOperador - Tarifa por hora del operador
# tiempoManoObra - Horas de trabajo manual
# costoMantenimientoPorHora - Costo de mantenimiento por hora
# margenGanancia - Porcentaje de ganancia`;
    }

    getTraditionalFormulasText() {
        return this.getDefaultFormulasText();
    }

    getDefaultFormulasFinales() {
        return {
            costoTotal: {
                nombre: "Costo Total Final",
                formula: "filamento + electricidad + mantenimiento + amortizacion + manoObra + (filamentosAdicionales || 0) + (boquilla || 0) + (piezasExternas || 0) + (bufferErrores || 0)",
                descripcion: "Suma de todos los costos calculados",
                variables: ["filamento", "electricidad", "mantenimiento", "amortizacion", "manoObra", "filamentosAdicionales", "boquilla", "piezasExternas", "bufferErrores"]
            },
            precioVenta: {
                nombre: "Precio de Venta Final",
                formula: "costoTotal * (1 + margenGanancia / 100)",
                descripcion: "Costo total + margen de ganancia",
                variables: ["costoTotal", "margenGanancia"]
            },
            aplicarBuffer: {
                nombre: "Aplicación de Buffer de Errores",
                formula: "costoBase * bufferMultiplicador",
                descripcion: "Multiplica el costo base por el factor de buffer",
                variables: ["costoBase", "bufferMultiplicador"]
            },
            redondeoFinal: {
                nombre: "Redondeo del Precio Final",
                formula: "Math.round(precio / redondeo) * redondeo",
                descripcion: "Redondea el precio según la configuración",
                variables: ["precio", "redondeo"]
            }
        };
    }

    updateDisplay() {
        console.log('🔧 Actualizando display del backend editor');
        this.renderEditor();
    }

    renderEditor() {
        const container = document.getElementById('formulaEditor');
        if (!container) {
            console.error('❌ Container formulaEditor no encontrado');
            return;
        }

        console.log('🔧 Renderizando editor en container');

        // Determinar si hay fórmulas personalizadas
        const hasCustomFormulas = this.data.configuracion.formulasTexto && 
                                 this.data.configuracion.formulasTexto !== this.getDefaultFormulasText();

        container.innerHTML = `
            <div class="formulas-editor">
                <div class="editor-header">
                    <h3>📝 Editor de Fórmulas de Cálculo</h3>
                    <div class="editor-actions">
                        <button class="btn ${hasCustomFormulas ? 'btn-secondary' : 'btn-primary'}" onclick="showTraditionalFormulas()">
                            🏭 Ver Fórmulas de Fábrica
                        </button>
                        <button class="btn ${hasCustomFormulas ? 'btn-primary' : 'btn-secondary'}" onclick="showCustomFormulas()">
                            🔧 Editor Personalizado
                        </button>
                        <button class="btn btn-success" onclick="testAllFormulas()">🧪 Probar Fórmulas</button>
                        <button class="btn btn-secondary" onclick="downloadFormulas()">💾 Descargar</button>
                        <button class="btn btn-secondary" onclick="uploadFormulas()">📂 Cargar</button>
                    </div>
                </div>
                
                <!-- Sección de tutorial -->
                <div class="tutorial-section">
                    <h4>📚 ¿Cómo funciona el sistema de fórmulas?</h4>
                    <div class="tutorial-grid">
                        <div class="tutorial-card">
                            <h5>🔧 ¿Qué son las fórmulas personalizadas?</h5>
                            <p>Son versiones modificadas de los cálculos que reemplazan las fórmulas integradas.</p>
                            <ul>
                                <li>✅ <strong>SÍ siguen funcionando</strong> las pestañas de Impresoras y Configuración</li>
                                <li>✅ Los valores se siguen usando como <strong>variables</strong> en tus fórmulas</li>
                                <li>✅ Solo cambias <strong>cómo se calculan</strong> los costos finales</li>
                                <li>❌ NO pierdes configuraciones existentes</li>
                            </ul>
                        </div>
                        
                        <div class="tutorial-card">
                            <h5>📊 Ejemplo práctico:</h5>
                            <p><strong>Configuración en pestaña Impresoras:</strong></p>
                            <code>Potencia: 200W, Electricidad: €0.15/kWh</code>
                            
                            <p><strong>Fórmula tradicional:</strong></p>
                            <code>(200/1000) × 3h × 0.15 = €0.09</code>
                            
                            <p><strong>Tu fórmula personalizada:</strong></p>
                            <code>potencia/1000 × tiempoHoras × costoElectricidad × 0.8</code>
                            <p><small>↑ Mismo cálculo pero con 20% descuento nocturno</small></p>
                        </div>
                        
                        <div class="tutorial-card">
                            <h5>✏️ ¿Cómo editar?</h5>
                            <ol>
                                <li>Haz clic en "🔧 Editor Personalizado"</li>
                                <li>En el cuadro de texto, busca la línea de fórmula (sin #)</li>
                                <li>Modifica solo esa línea</li>
                                <li>Haz clic en "✅ Guardar Fórmulas"</li>
                                <li>¡Listo! Ya tienes tu cálculo personalizado</li>
                            </ol>
                        </div>
                    </div>
                </div>
                
                <!-- Sección de ejemplos -->
                <div class="examples-section">
                    <h4>💡 Ejemplos de Fórmulas Funcionales</h4>
                    <div class="examples-grid">
                        ${this.generateExamplesGrid()}
                    </div>
                </div>
                
                <!-- Vista de fórmulas tradicionales -->
                <div id="traditionalView" style="display: ${hasCustomFormulas ? 'none' : 'block'};">
                    <div class="editor-content">
                        <div class="editor-main">
                            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #ffeaa7;">
                                <h4 style="margin-top: 0; color: #856404;">🏭 Fórmulas Tradicionales del Sistema</h4>
                                <p style="margin-bottom: 0;">Estas son las fórmulas que usa el sistema por defecto. Solo lectura - para personalizar usa el "Editor Personalizado".</p>
                            </div>
                            <textarea readonly style="background: #f8f9fa; border: 2px solid #dee2e6; height: 400px;">${this.getTraditionalFormulasText()}</textarea>
                        </div>
                        
                        <div class="editor-sidebar">
                            <div class="formula-preview">
                                <h4>🏭 Métodos de Fábrica</h4>
                                <div id="traditionalPreview">${this.generateTraditionalPreview()}</div>
                            </div>
                            
                            <div class="compatibility-info">
                                <h4>🔗 Compatibilidad con Configuraciones</h4>
                                <div style="background: #d4edda; padding: 15px; border-radius: 8px; border: 1px solid #c3e6cb;">
                                    <p><strong>✅ Todas las pestañas siguen funcionando:</strong></p>
                                    <ul style="margin: 10px 0; padding-left: 20px;">
                                        <li><strong>🖨️ Impresoras:</strong> Potencia, costos, amortización</li>
                                        <li><strong>⚙️ Configuración:</strong> Tarifas, márgenes, desperdicios</li>
                                        <li><strong>📦 Filamentos:</strong> Precios y propiedades</li>
                                    </ul>
                                    <p><strong>🔧 Solo cambias:</strong> Cómo se combinan esos valores</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Vista de fórmulas personalizadas -->
                <div id="customView" style="display: ${hasCustomFormulas ? 'block' : 'none'};">
                    <div class="editor-content">
                        <div class="editor-main">
                            <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #bee5eb;">
                                <h4 style="margin-top: 0; color: #0c5460;">🔧 Editor de Fórmulas Personalizadas</h4>
                                <p style="margin-bottom: 10px;">Estas fórmulas reemplazarán las de fábrica. Guarda los cambios para aplicarlos.</p>
                                <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 4px; font-size: 0.9em;">
                                    <strong>📝 Instrucciones para editar:</strong><br>
                                    1. Busca la línea que quieres modificar (las que NO empiezan con #)<br>
                                    2. Cambia solo esa línea de fórmula<br>
                                    3. Usa las variables disponibles (aparecen al final del archivo)<br>
                                    4. Haz clic en "✅ Guardar Fórmulas"
                                </div>
                            </div>
                            <textarea id="formulasTextArea" 
                                      style="height: 500px;"
                                      placeholder="Cargando fórmulas...">${this.data.configuracion.formulasTexto || this.getDefaultFormulasText()}</textarea>
                        </div>
                        
                        <div class="editor-sidebar">
                            <div class="formula-preview">
                                <h4>📊 Vista Previa</h4>
                                <div id="formulaPreview"></div>
                            </div>
                            
                            <div class="test-results">
                                <h4>🧪 Resultados de Prueba</h4>
                                <div id="testResults">
                                    <p class="text-muted">Haz clic en "🧪 Probar Fórmulas" para ver resultados</p>
                                </div>
                            </div>
                            
                            <div class="quick-tips">
                                <h4>💡 Tips Rápidos</h4>
                                <div style="background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9em;">
                                    <p><strong>Variables más usadas:</strong></p>
                                    <code>cantidadGramos</code> - Gramos de filamento<br>
                                    <code>tiempoHoras</code> - Horas de impresión<br>
                                    <code>precioPorKg</code> - Precio del filamento<br>
                                    <code>potencia</code> - Potencia de la impresora<br>
                                    <code>costoElectricidad</code> - Costo eléctrico
                                    
                                    <p style="margin-top: 10px;"><strong>Operadores:</strong></p>
                                    <code>+</code> <code>-</code> <code>*</code> <code>/</code> <code>Math.max()</code>
                                    
                                    <p style="margin-top: 10px;"><strong>Condicionales:</strong></p>
                                    <code>valor > 5 ? resultado1 : resultado2</code>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="padding: 20px; background: #f8f9fa; text-align: center;">
                        <button class="btn btn-success" onclick="saveFormulas()">✅ Guardar Fórmulas</button>
                        <button class="btn btn-danger" onclick="resetFormulas()">🔄 Resetear a Fábrica</button>
                        <button class="btn btn-secondary" onclick="previewFormulas()">👁️ Previsualizar Cambios</button>
                    </div>
                </div>
            </div>
        `;

        // Configurar listener para el textarea
        setTimeout(() => {
            const textarea = document.getElementById('formulasTextArea');
            if (textarea) {
                textarea.addEventListener('input', () => {
                    this.updatePreview();
                });
                console.log('✅ Listener del textarea configurado');
            }
        }, 100);

        // Actualizar vista previa si estamos en modo personalizado
        if (hasCustomFormulas) {
            this.updatePreview();
        }

        console.log('✅ Editor renderizado correctamente');
    }

    generateTraditionalPreview() {
        const formulas = [
            {
                title: '🧵 Filamento',
                description: 'Peso × Precio/kg × (1 + Desperdicio%)',
                implementation: 'calcularFilamentoTradicional()',
                example: '(50/1000) × 25 × 1.05 = €1.31'
            },
            {
                title: '⚡ Electricidad',
                description: '(Potencia/1000) × Horas × Costo/kWh',
                implementation: 'calcularElectricidadTradicional()',
                example: '(200/1000) × 3 × 0.15 = €0.09'
            },
            {
                title: '🔧 Mantenimiento',
                description: 'Horas × (Costo mantenimiento / Intervalo)',
                implementation: 'calcularMantenimientoTradicional()',
                example: '3 × (60/250) = €0.72'
            },
            {
                title: '🏭 Amortización',
                description: 'Horas × Factor amortización',
                implementation: 'calcularAmortizacionTradicional()',
                example: '3 × 0.8 = €2.40'
            },
            {
                title: '👨‍💼 Mano de Obra',
                description: 'Tiempo trabajo × Tarifa/hora',
                implementation: 'calcularManoObraTradicional()',
                example: '0.5 × 15 = €7.50'
            }
        ];

        let html = '';
        formulas.forEach(formula => {
            html += `
                <div class="formula-item" style="border-left: 4px solid #28a745;">
                    <div class="formula-header">
                        <span class="formula-status">✅</span>
                        <strong>${formula.title}</strong>
                    </div>
                    <div class="formula-description">${formula.description}</div>
                    <div class="formula-code">
                        <code>${formula.implementation}</code>
                    </div>
                    <div style="font-size: 0.8em; color: #6c757d; margin-top: 5px;">
                        <strong>Ejemplo:</strong> ${formula.example}
                    </div>
                </div>
            `;
        });

        return html;
    }

    generateExamplesGrid() {
        const examples = [
            {
                title: "🧵 Filamento con Descuento",
                description: "10% descuento por volumen",
                formula: "cantidadGramos / 1000 * precioPorKg * (1 + desperdicioMaterial / 100) * 0.9",
                variables: "50g de PLA a €25/kg",
                result: "(50/1000) × 25 × 1.05 × 0.9 = €1.18",
                originalResult: "€1.31 (tradicional)",
                category: "material"
            },
            {
                title: "⚡ Electricidad Nocturna",
                description: "20% descuento en horario nocturno",
                formula: "potencia / 1000 * tiempoHoras * costoElectricidad * 0.8",
                variables: "200W × 3h × €0.15/kWh",
                result: "(200/1000) × 3 × 0.15 × 0.8 = €0.072",
                originalResult: "€0.09 (tradicional)",
                category: "electricidad"
            }
        ];

        let html = '';
        examples.forEach((example, index) => {
            html += `
                <div class="example-card">
                    <div class="example-header">
                        <h5>${example.title}</h5>
                        <button class="btn-copy" onclick="app.managers.backend.copyExampleFormula('${example.formula.replace(/'/g, "\\'")}')">📋 Copiar</button>
                    </div>
                    
                    <div class="example-content">
                        <p class="example-description">${example.description}</p>
                        
                        <div class="example-formula">
                            <strong>📝 Fórmula:</strong>
                            <code>${example.formula}</code>
                        </div>
                        
                        <div class="example-calculation">
                            <div class="calc-input">
                                <strong>📊 Variables:</strong> ${example.variables}
                            </div>
                            <div class="calc-result">
                                <strong>✅ Resultado:</strong> <span style="color: #28a745; font-weight: bold;">${example.result}</span>
                            </div>
                            <div class="calc-comparison">
                                <strong>⚖️ Comparación:</strong> <span style="color: #6c757d;">${example.originalResult}</span>
                            </div>
                        </div>
                        
                        <button class="btn-test" onclick="app.managers.backend.testExampleFormula(${index})">🧪 Probar Esta Fórmula</button>
                    </div>
                </div>
            `;
        });

        return html;
    }

    testAllFormulas() {
        console.log('🧪 Iniciando testAllFormulas()');
        
        const textarea = document.getElementById('formulasTextArea');
        const formulasText = textarea ? textarea.value : (this.data.configuracion.formulasTexto || this.getDefaultFormulasText());
        
        console.log('📝 Texto de fórmulas encontrado:', formulasText ? formulasText.length : 'No encontrado');
        
        const formulas = this.parseFormulas(formulasText);
        console.log('🔍 Fórmulas parseadas:', formulas.length);
        
        if (formulas.length === 0) {
            UI.showAlert('❌ No se detectaron fórmulas para probar');
            return;
        }

        const testVariables = this.getTestVariables();
        console.log('📊 Variables de prueba:', testVariables);
        
        const results = [];

        formulas.forEach((formula, index) => {
            console.log(`🧮 Probando fórmula ${index + 1}: ${formula.title}`);
            console.log(`📝 Fórmula: ${formula.formula}`);
            
            try {
                const result = this.evaluateFormula(formula.formula, testVariables);
                console.log(`✅ Resultado: ${result}`);
                
                results.push({
                    title: formula.title,
                    formula: formula.formula,
                    result: result,
                    status: 'success',
                    error: null
                });
            } catch (error) {
                console.error(`❌ Error en fórmula ${formula.title}:`, error);
                
                results.push({
                    title: formula.title,
                    formula: formula.formula,
                    result: null,
                    status: 'error',
                    error: error.message
                });
            }
        });

        console.log('📋 Resultados finales:', results);
        
        this.showTestResults(results, testVariables);
        this.showTestModal(results, testVariables);
    }

    parseFormulas(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }

        const lines = text.split('\n');
        const formulas = [];
        let currentTitle = '';
        let currentDescription = '';
        let currentFormula = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Detectar títulos (líneas que empiezan con # pero no # seguido de espacio)
            if (line.startsWith('#') && !line.startsWith('# ') && line.length > 1) {
                // Guardar fórmula anterior si existe
                if (currentTitle && currentFormula) {
                    formulas.push({
                        title: currentTitle,
                        description: currentDescription.trim(),
                        formula: currentFormula.trim()
                    });
                }
                
                // Nueva fórmula
                currentTitle = line.substring(1).trim();
                currentDescription = '';
                currentFormula = '';
            } 
            // Comentarios (líneas que empiezan con # seguido de espacio) 
            else if (line.startsWith('# ') || line === '#') {
                if (currentTitle) {
                    currentDescription += line.substring(1).trim() + ' ';
                }
            }
            // Líneas vacías
            else if (line === '') {
                // Ignorar
            }
            // Líneas de fórmula (no empiezan con # y tienen contenido)
            else if (currentTitle && line.length > 0) {
                // Solo tomar la primera línea de fórmula después del título
                if (!currentFormula) {
                    currentFormula = line;
                }
            }
        }

        // Agregar última fórmula si existe
        if (currentTitle && currentFormula) {
            formulas.push({
                title: currentTitle,
                description: currentDescription.trim(),
                formula: currentFormula.trim()
            });
        }

        console.log(`📝 Detectadas ${formulas.length} fórmulas:`, formulas.map(f => f.title));
        return formulas;
    }

    getTestVariables() {
        return {
            cantidadGramos: 50,
            tiempoHoras: 3,
            precioPorKg: 25,
            potencia: 200,
            costoElectricidad: 0.15,
            factorAmortizacion: 0.8,
            desperdicioMaterial: 5,
            tarifaOperador: 15,
            tiempoManoObra: 0.5,
            costoMantenimiento: 60,
            intervaloMantenimiento: 250,
            costoMantenimientoPorHora: 0.24,
            margenGanancia: 30
        };
    }

    evaluateFormula(formula, variables) {
        try {
            const varNames = Object.keys(variables);
            const varValues = Object.values(variables);
            const func = new Function(...varNames, `return ${formula};`);
            return func(...varValues);
        } catch (error) {
            throw new Error(`Error en fórmula: ${error.message}`);
        }
    }

    showTestResults(results, testVariables) {
        const container = document.getElementById('testResults');
        if (!container) return;

        let html = `
            <div class="test-summary">
                <div class="test-vars">
                    <strong>📊 Variables de Prueba:</strong><br>
                    <small>
                        ${Object.entries(testVariables).map(([key, value]) => `${key}: ${value}`).slice(0, 4).join(', ')}...
                    </small>
                </div>
                <div class="test-status">
                    ✅ ${results.filter(r => r.status === 'success').length} exitosas | 
                    ❌ ${results.filter(r => r.status === 'error').length} con errores
                </div>
            </div>
            
            <div class="test-results-list">
        `;

        results.forEach(result => {
            if (result.status === 'success') {
                html += `
                    <div class="test-result success">
                        <div class="result-header">
                            <span class="result-status">✅</span>
                            <strong>${result.title}</strong>
                        </div>
                        <div class="result-value">€${result.result.toFixed(4)}</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="test-result error">
                        <div class="result-header">
                            <span class="result-status">❌</span>
                            <strong>${result.title}</strong>
                        </div>
                        <div class="result-error">${result.error}</div>
                    </div>
                `;
            }
        });

        html += '</div>';
        container.innerHTML = html;
    }

    showTestModal(results, testVariables) {
        const modal = document.createElement('div');
        modal.className = 'formula-test-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h4>🧪 Resultados de Prueba de Fórmulas</h4>
                    <button class="btn-close" onclick="this.parentElement.parentElement.parentElement.remove()">❌</button>
                </div>
                <div class="modal-body">
                    <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h5>📊 Variables de Prueba Utilizadas:</h5>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-family: monospace; font-size: 0.9em;">
                            ${Object.entries(testVariables).map(([key, value]) => 
                                `<div><strong>${key}:</strong> ${value}</div>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h5>📈 Resumen:</h5>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                            <div style="text-align: center;">
                                <div style="font-size: 1.5em; color: #28a745; font-weight: bold;">
                                    ${results.filter(r => r.status === 'success').length}
                                </div>
                                <div>✅ Exitosas</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.5em; color: #dc3545; font-weight: bold;">
                                    ${results.filter(r => r.status === 'error').length}
                                </div>
                                <div>❌ Con errores</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.5em; color: #007bff; font-weight: bold;">
                                    ${results.length}
                                </div>
                                <div>📝 Total fórmulas</div>
                            </div>
                        </div>
                    </div>
                    
                    <h5>🔍 Resultados Detallados:</h5>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        ${results.map(result => `
                            <div style="background: ${result.status === 'success' ? '#d4edda' : '#f8d7da'}; 
                                        border: 1px solid ${result.status === 'success' ? '#c3e6cb' : '#f5c6cb'}; 
                                        border-radius: 8px; padding: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <h6 style="margin: 0; color: ${result.status === 'success' ? '#155724' : '#721c24'};">
                                        ${result.status === 'success' ? '✅' : '❌'} ${result.title}
                                    </h6>
                                    ${result.status === 'success' ? 
                                        `<span style="font-size: 1.2em; font-weight: bold; color: #28a745;">€${result.result.toFixed(4)}</span>` :
                                        `<span style="font-size: 0.9em; color: #dc3545;">ERROR</span>`
                                    }
                                </div>
                                <div style="background: rgba(255,255,255,0.7); padding: 10px; border-radius: 4px; margin: 10px 0;">
                                    <strong>📝 Fórmula:</strong>
                                    <code style="display: block; margin-top: 5px; word-break: break-all;">${result.formula}</code>
                                </div>
                                ${result.status === 'error' ? 
                                    `<div style="color: #721c24; font-size: 0.9em; margin-top: 10px;">
                                        <strong>🐛 Error:</strong> ${result.error}
                                    </div>` : ''
                                }
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <button class="btn btn-success" onclick="this.closest('.formula-test-modal').remove();">
                            ✅ Entendido
                        </button>
                        ${results.filter(r => r.status === 'success').length > 0 ? `
                            <button class="btn btn-primary" onclick="saveFormulas(); this.closest('.formula-test-modal').remove();">
                                💾 Guardar Fórmulas Probadas
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto cerrar después de 60 segundos
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 60000);
    }

    updatePreview() {
        const formulas = this.parseFormulas(this.data.configuracion.formulasTexto || this.getDefaultFormulasText());
        const previewContainer = document.getElementById('formulaPreview');
        
        if (!previewContainer) return;

        if (formulas.length === 0) {
            previewContainer.innerHTML = '<p class="text-warning">⚠️ No se detectaron fórmulas válidas</p>';
            return;
        }

        let html = '';
        formulas.forEach((formula, index) => {
            const status = this.validateFormula(formula.formula) ? '✅' : '❌';
            html += `
                <div class="formula-item">
                    <div class="formula-header">
                        <span class="formula-status">${status}</span>
                        <strong>${formula.title}</strong>
                    </div>
                    <div class="formula-description">${formula.description}</div>
                    <div class="formula-code">
                        <code>${formula.formula}</code>
                    </div>
                </div>
            `;
        });

        previewContainer.innerHTML = html;
    }

    validateFormula(formula) {
        try {
            const testVars = this.getTestVariables();
            const varNames = Object.keys(testVars);
            const varValues = Object.values(testVars);
            const func = new Function(...varNames, `return ${formula};`);
            const result = func(...varValues);
            
            return typeof result === 'number' && !isNaN(result) && isFinite(result);
        } catch (error) {
            return false;
        }
    }

    saveFormulas() {
        const textarea = document.getElementById('formulasTextArea');
        if (!textarea) return;

        this.data.configuracion.formulasTexto = textarea.value;
        app.save();
        
        this.updatePreview();
        UI.showAlert('✅ Fórmulas guardadas correctamente');
    }

    resetFormulas() {
        if (!UI.showConfirm('¿Resetear todas las fórmulas a valores por defecto?')) return;

        this.data.configuracion.formulasTexto = this.getDefaultFormulasText();
        app.save();
        
        const textarea = document.getElementById('formulasTextArea');
        if (textarea) {
            textarea.value = this.data.configuracion.formulasTexto;
        }
        
        this.updatePreview();
        UI.showAlert('🔄 Fórmulas restablecidas a valores por defecto');
    }

    copyExampleFormula(formula) {
        console.log('📋 Copiando fórmula:', formula);
        
        const textarea = document.getElementById('formulasTextArea');
        if (textarea && textarea.offsetParent !== null) {
            const currentText = textarea.value;
            const lines = currentText.split('\n');
            
            let insertIndex = lines.length;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('VARIABLES DISPONIBLES')) {
                    insertIndex = i;
                    break;
                }
            }
            
            const newFormula = [
                '',
                '# 🔧 FÓRMULA PERSONALIZADA',
                '# Modifica el título y descripción según necesites',
                formula,
                ''
            ];
            
            lines.splice(insertIndex, 0, ...newFormula);
            textarea.value = lines.join('\n');
            
            this.updatePreview();
            UI.showAlert('📋 Fórmula copiada al editor. Modifica el título y descripción.');
        } else {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(formula).then(() => {
                    UI.showAlert('📋 Fórmula copiada al portapapeles');
                }).catch(() => {
                    UI.showAlert(`📋 Fórmula: ${formula}`);
                });
            } else {
                UI.showAlert(`📋 Fórmula: ${formula}`);
            }
        }
    }

    testExampleFormula(index) {
        const examples = [
            {
                title: "🧵 Filamento con Descuento",
                formula: "cantidadGramos / 1000 * precioPorKg * (1 + desperdicioMaterial / 100) * 0.9",
                variables: { cantidadGramos: 50, precioPorKg: 25, desperdicioMaterial: 5 }
            },
            {
                title: "⚡ Electricidad Nocturna",
                formula: "potencia / 1000 * tiempoHoras * costoElectricidad * 0.8",
                variables: { potencia: 200, tiempoHoras: 3, costoElectricidad: 0.15 }
            }
        ];

        const example = examples[index];
        if (!example) {
            UI.showAlert('❌ Ejemplo no encontrado');
            return;
        }

        try {
            const result = this.evaluateFormula(example.formula, example.variables);
            UI.showAlert(`🧪 Resultado de "${example.title}": €${result.toFixed(4)}`);
        } catch (error) {
            UI.showAlert(`❌ Error probando la fórmula: ${error.message}`);
        }
    }

    downloadFormulas() {
        const text = this.data.configuracion.formulasTexto || this.getDefaultFormulasText();
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `formulas_impresion3d_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UI.showAlert('💾 Archivo de fórmulas descargado');
    }

    uploadFormulas() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    if (UI.showConfirm('¿Cargar este archivo de fórmulas?')) {
                        this.data.configuracion.formulasTexto = content;
                        app.save();
                        
                        const textarea = document.getElementById('formulasTextArea');
                        if (textarea) {
                            textarea.value = content;
                        }
                        
                        this.updatePreview();
                        UI.showAlert('📂 Fórmulas cargadas desde archivo');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    calcularConFormulasFinales(desglose, datosAdicionales) {
        const formulasFinales = this.data.configuracion.formulasFinales;
        if (!formulasFinales) {
            console.log('❌ No hay fórmulas finales configuradas');
            return null;
        }

        try {
            // Preparar TODAS las variables disponibles
            const variables = {
                // Variables de desglose (asegurar que existen)
                filamento: desglose.filamento || 0,
                electricidad: desglose.electricidad || 0,
                mantenimiento: desglose.mantenimiento || 0,
                amortizacion: desglose.amortizacion || 0,
                manoObra: desglose.manoObra || 0,
                filamentosAdicionales: desglose.filamentosAdicionales || 0,
                boquilla: desglose.boquilla || 0,
                piezasExternas: desglose.piezasExternas || 0,
                bufferErrores: desglose.bufferErrores || 0,
                costosVariables: desglose.costosVariables || 0,
                costosFijos: desglose.costosFijos || 0,
                costosVariablesConBuffer: desglose.costosVariablesConBuffer || 0,
                
                // Variables de configuración
                margenGanancia: datosAdicionales.margenGanancia || 30,
                redondeo: datosAdicionales.redondeo || 0.01,
                
                // Variables de entrada originales
                cantidadGramos: datosAdicionales.cantidadGramos || 0,
                tiempoHoras: datosAdicionales.tiempoHoras || 0,
                
                // Costo total inicial (se puede recalcular)
                costoTotal: datosAdicionales.costoTotal || 0
            };

            const resultado = {};

            // Calcular costo total si hay fórmula
            if (formulasFinales.costoTotal) {
                resultado.costoTotal = this.ejecutarFormula(formulasFinales.costoTotal.formula, variables);
                // Actualizar la variable para siguientes cálculos
                variables.costoTotal = resultado.costoTotal;
            }

            // Calcular precio de venta
            if (formulasFinales.precioVenta) {
                resultado.precioVenta = this.ejecutarFormula(formulasFinales.precioVenta.formula, variables);
                // Actualizar la variable precio para redondeo
                variables.precio = resultado.precioVenta;
            }

            // Aplicar redondeo si existe
            if (formulasFinales.aplicarRedondeo && resultado.precioVenta) {
                resultado.precioVenta = this.ejecutarFormula(formulasFinales.aplicarRedondeo.formula, variables);
            }

            console.log('✅ Fórmulas finales ejecutadas:', resultado);
            return resultado;

        } catch (error) {
            console.error('❌ Error ejecutando fórmulas finales:', error);
            return null;
        }
    }

    ejecutarFormula(formula, variables) {
        try {
            const varNames = Object.keys(variables);
            const varValues = Object.values(variables);
            const func = new Function(...varNames, `return ${formula};`);
            const result = func(...varValues);
            
            if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                return result;
            } else {
                throw new Error(`Resultado inválido: ${result}`);
            }
        } catch (error) {
            console.error('❌ Error ejecutando fórmula:', formula, error);
            throw error;
        }
    }

    validarFormulasFinales() {
        const formulasFinales = this.data.configuracion.formulasFinales;
        if (!formulasFinales) {
            return { validas: false, errores: ['No hay fórmulas finales configuradas'] };
        }

        const errores = [];
        const testVars = {
            filamento: 5.50,
            electricidad: 1.80,
            mantenimiento: 0.75,
            amortizacion: 2.20,
            manoObra: 7.50,
            filamentosAdicionales: 1.25,
            boquilla: 2.00,
            piezasExternas: 3.50,
            bufferErrores: 1.50,
            costoTotal: 25.00,
            margenGanancia: 30,
            redondeo: 0.01,
            precio: 32.50,
            cantidadGramos: 75,
            tiempoHoras: 4.5
        };

        Object.keys(formulasFinales).forEach(key => {
            try {
                this.ejecutarFormula(formulasFinales[key].formula, testVars);
            } catch (error) {
                errores.push(`Fórmula "${key}": ${error.message}`);
            }
        });

        return { 
            validas: errores.length === 0, 
            errores 
        };
    }
}

// Asegurar que esté disponible globalmente
window.BackendEditor = BackendEditor;

// Funciones globales
window.testAllFormulas = function() {
    console.log('🌐 Función global testAllFormulas() llamada');
    if (window.app && window.app.managers && window.app.managers.backend) {
        window.app.managers.backend.testAllFormulas();
    } else {
        console.error('❌ Backend manager no disponible');
        alert('❌ Error: Sistema no inicializado correctamente');
    }
};

window.previewFormulas = function() {
    console.log('🌐 Función global previewFormulas() llamada');
    if (window.app && window.app.managers && window.app.managers.backend) {
        // Implementar previewFormulas aquí
        UI.showAlert('👁️ Función de preview en desarrollo');
    } else {
        console.error('❌ Backend manager no disponible');
        alert('❌ Error: Sistema no inicializado correctamente');
    }
};

window.saveFormulas = function() {
    console.log('🌐 Función global saveFormulas() llamada');
    if (window.app && window.app.managers && window.app.managers.backend) {
        window.app.managers.backend.saveFormulas();
    } else {
        console.error('❌ Backend manager no disponible');
        alert('❌ Error: Sistema no inicializado correctamente');
    }
};

window.resetFormulas = function() {
    console.log('🌐 Función global resetFormulas() llamada');
    if (window.app && window.app.managers && window.app.managers.backend) {
        window.app.managers.backend.resetFormulas();
    } else {
        console.error('❌ Backend manager no disponible');
        alert('❌ Error: Sistema no inicializado correctamente');
    }
};

window.downloadFormulas = function() {
    console.log('🌐 Función global downloadFormulas() llamada');
    if (window.app && window.app.managers && window.app.managers.backend) {
        window.app.managers.backend.downloadFormulas();
    } else {
        console.error('❌ Backend manager no disponible');
        alert('❌ Error: Sistema no inicializado correctamente');
    }
};

window.uploadFormulas = function() {
    console.log('🌐 Función global uploadFormulas() llamada');
    if (window.app && window.app.managers && window.app.managers.backend) {
        window.app.managers.backend.uploadFormulas();
    } else {
        console.error('❌ Backend manager no disponible');
        alert('❌ Error: Sistema no inicializado correctamente');
    }
};

window.showTraditionalFormulas = function() {
    console.log('🌐 Función global showTraditionalFormulas() llamada');
    document.getElementById('traditionalView').style.display = 'block';
    document.getElementById('customView').style.display = 'none';
};

window.showCustomFormulas = function() {
    console.log('🌐 Función global showCustomFormulas() llamada');
    document.getElementById('traditionalView').style.display = 'none';
    document.getElementById('customView').style.display = 'block';
};

console.log('✅ backend-editor.js cargado completamente');