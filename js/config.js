class ConfigManager {
    constructor(data) {
        this.data = data;
        this.materialesDisponibles = this.getDefaultMateriales();
        this.formulasPersonalizadas = this.getDefaultFormulas();
    }

    getDefaultMateriales() {
        return {
            "PLA": {
                color: "🟢",
                variantes: [
                    "PLA",
                    "PLA+",
                    "Fat PLA",
                    "Fast PLA / High-Speed PLA",
                    "High Flow PLA",
                    "Tough PLA",
                    "High Temp PLA (PLA 850, PLA 870)",
                    "Impact PLA",
                    "Low-Warp PLA",
                    "Recycled PLA",
                    "Economy PLA",
                    "PLA Silk",
                    "PLA Matte",
                    "PLA Transparent",
                    "PLA Glitter",
                    "PLA Rainbow",
                    "PLA Glow",
                    "PLA UV Color Change",
                    "PLA Thermochromic",
                    "PLA Dual Color / Tricolor",
                    "PLA Wood",
                    "PLA Bamboo",
                    "PLA Cork",
                    "PLA Hemp",
                    "PLA Coffee",
                    "PLA Algae",
                    "PLA Beer",
                    "PLA Wine",
                    "PLA Carbon Fiber",
                    "PLA Glass Fiber",
                    "PLA Ceramic",
                    "PLA Magnetic",
                    "PLA Conductive",
                    "PLA Metal (Bronze, Copper, Iron, Steel)",
                    "PLA Stone / Sandstone / Marble / Granite",
                    "Laybrick (piedra PLA)",
                    "LayCeramic (cerámica PLA)",
                    "Terra Cotta PLA",
                    "Clay PLA",
                    "BioFusion PLA",
                    "PLA Pastel",
                    "PLA Iris",
                    "Antibacterial PLA",
                    "LW-PLA (Lightweight PLA)",
                    "ST-PLA (PLA para soportes)"
                ]
            },
            "PETG": {
                color: "🟠",
                variantes: [
                    "PETG",
                    "PETG+",
                    "Fast PETG / Rapid PETG / High-Speed PETG",
                    "High Flow PETG",
                    "Easy PETG",
                    "Tough PETG",
                    "Recycled PETG",
                    "PETG Transparent",
                    "PETG Matte",
                    "PETG Silk",
                    "PETG Glow",
                    "PETG Glitter",
                    "PETG Carbon Fiber",
                    "PETG Glass Fiber"
                ]
            },
            "ABS": {
                color: "🔴",
                variantes: [
                    "ABS",
                    "ABS+",
                    "ABS Pro",
                    "ABS-R",
                    "Easy ABS",
                    "Tough ABS",
                    "Recycled ABS",
                    "ABS Carbon Fiber",
                    "ABS Glass Fiber",
                    "ABS Conductive",
                    "ABS Flame Retardant",
                    "ABS-PC (mezcla con PC)"
                ]
            },
            "ASA": {
                color: "🟡",
                variantes: [
                    "ASA",
                    "ASA+",
                    "ASA UV",
                    "ASA Matte",
                    "ASA Carbon Fiber",
                    "ASA Glass Fiber"
                ]
            },
            "TPU": {
                color: "🔵",
                variantes: [
                    "TPU 85A",
                    "TPU 90A",
                    "TPU 95A",
                    "TPU 98A",
                    "Fast TPU / Speed TPU",
                    "Tough TPU",
                    "Recycled TPU",
                    "TPU Transparent",
                    "TPU Glow",
                    "TPU Carbon Fiber",
                    "TPU Glass Fiber",
                    "TPU Conductive",
                    "TPE",
                    "TPV"
                ]
            },
            "NYLON": {
                color: "⚫",
                variantes: [
                    "Nylon",
                    "Nylon 6",
                    "Nylon 12",
                    "Nylon 66",
                    "Tough Nylon",
                    "Flexible Nylon",
                    "Anti-Warp Nylon",
                    "Recycled Nylon",
                    "Nylon Carbon Fiber",
                    "Nylon Glass Fiber",
                    "Nylon Kevlar",
                    "Nylon Alloy",
                    "Nylon Conductive"
                ]
            },
            "PC": {
                color: "⚙️",
                variantes: [
                    "PC",
                    "PC+",
                    "Transparent PC",
                    "Tough PC",
                    "Recycled PC",
                    "PC Flame Retardant",
                    "PC Carbon Fiber",
                    "PC Glass Fiber",
                    "PC-ABS",
                    "PC-PBT"
                ]
            },
            "TÉCNICOS": {
                color: "⚪",
                variantes: [
                    "POM (Delrin)",
                    "PP (Polipropileno)",
                    "HDPE",
                    "PMMA (Acrílico)",
                    "PS (Poliestireno)",
                    "PEI (Ultem)",
                    "PEEK",
                    "PEKK",
                    "PSU",
                    "PPSU",
                    "PVDF",
                    "LCP (Liquid Crystal Polymer)"
                ]
            },
            "SOPORTES": {
                color: "🧪",
                variantes: [
                    "PVA",
                    "BVOH",
                    "HIPS",
                    "SR-30",
                    "AquaSolve",
                    "PolyDissolve"
                ]
            },
            "ESPECIALES": {
                color: "🧲",
                variantes: [
                    "Electrifi (ultra conductor)",
                    "Magnetic PLA",
                    "Conductive PLA / ABS / TPU / Nylon",
                    "Graphene PLA",
                    "CarbonX (compuestos técnicos)"
                ]
            }
        };
    }

    getDefaultFormulas() {
        return {
            filamento: {
                nombre: "Costo del Filamento",
                formula: "cantidadGramos / 1000 * precioPorKg * (1 + desperdicioMaterial / 100)",
                descripcion: "Peso × Precio/kg × (1 + Desperdicio%)",
                variables: ["cantidadGramos", "precioPorKg", "desperdicioMaterial"]
            },
            electricidad: {
                nombre: "Costo de Electricidad",
                formula: "potencia / 1000 * tiempoHoras * costoElectricidad",
                descripcion: "(Potencia/1000) × Horas × Costo/kWh",
                variables: ["potencia", "tiempoHoras", "costoElectricidad"]
            },
            mantenimiento: {
                nombre: "Costo de Mantenimiento",
                formula: "tiempoHoras * costoMantenimientoPorHora",
                descripcion: "Horas × Costo mantenimiento por hora",
                variables: ["tiempoHoras", "costoMantenimientoPorHora"]
            },
            amortizacion: {
                nombre: "Costo de Amortización",
                formula: "tiempoHoras * factorAmortizacion",
                descripcion: "Horas × Factor amortización",
                variables: ["tiempoHoras", "factorAmortizacion"]
            },
            manoObra: {
                nombre: "Costo de Mano de Obra",
                formula: "tiempoManoObra * tarifaOperador",
                descripcion: "Tiempo trabajo × Tarifa/hora",
                variables: ["tiempoManoObra", "tarifaOperador"]
            },
            filamentosAdicionales: {
                nombre: "Costo de Material Multi-Material",
                formula: "esMultiMaterial ? ((cantidadGramosAdicionales || cantidadGramos * recargoMultiMaterial / 100) / 1000 * (precioPorKgAdicional || precioPorKg) * (1 + recargoMultiMaterial / 100)) : 0",
                descripcion: "Material adicional × Precio/kg × (1 + Recargo multi-material%) - Solo si es multi-material. Si no hay cantidad específica, usa % del material principal",
                variables: ["esMultiMaterial", "cantidadGramosAdicionales", "cantidadGramos", "precioPorKgAdicional", "precioPorKg", "recargoMultiMaterial"]
            },
            boquilla: {
                nombre: "Costo de Desgaste de Boquilla",
                formula: "(usaBoquillaEspecial || false) ? tiempoHoras * (costoBoquillaPorHora || 0.1) : 0",
                descripcion: "Horas × Costo desgaste boquilla (solo si es especial)",
                variables: ["usaBoquillaEspecial", "tiempoHoras", "costoBoquillaPorHora"]
            },
            piezasExternas: {
                nombre: "Costo de Componentes Adicionales",
                formula: "(costoPiezasExternas || 0)",
                descripcion: "Costo directo de componentes externos",
                variables: ["costoPiezasExternas"]
            },
            bufferErrores: {
                nombre: "Costo Adicional por Factor de Seguridad",
                formula: "(filamento + electricidad + mantenimiento + (filamentosAdicionales || 0)) * (factorBuffer - 1)",
                descripcion: "Costos variables × (Factor de seguridad - 1)",
                variables: ["filamento", "electricidad", "mantenimiento", "filamentosAdicionales", "factorBuffer"]
            }
        };
    }

    // Cargar fórmulas desde archivos externos
    cargarFormulasExterna() {
        // Verificar si las fórmulas externas están disponibles
        if (window.FORMULAS_FINALES) {
            console.log('📋 Fórmulas finales externas detectadas');
            if (!this.data.configuracion.formulasFinales) {
                this.data.configuracion.formulasFinales = {};
            }
            
            // Actualizar con fórmulas externas si no existen o si se prefiere cargar desde archivo
            Object.keys(window.FORMULAS_FINALES).forEach(key => {
                if (!this.data.configuracion.formulasFinales[key] || this.debeActualizarDesdeArchivo) {
                    this.data.configuracion.formulasFinales[key] = {
                        ...window.FORMULAS_FINALES[key],
                        formula: window.FORMULAS_FINALES[key].formula.replace(/\s+/g, ' ').trim()
                    };
                }
            });
        }

        if (window.FORMULAS_COSTOS) {
            console.log('🧮 Fórmulas de costos externas detectadas');
            if (!this.data.configuracion.formulasPersonalizadas) {
                this.data.configuracion.formulasPersonalizadas = {};
            }
            
            Object.keys(window.FORMULAS_COSTOS).forEach(key => {
                if (!this.data.configuracion.formulasPersonalizadas[key] || this.debeActualizarDesdeArchivo) {
                    this.data.configuracion.formulasPersonalizadas[key] = {
                        ...window.FORMULAS_COSTOS[key],
                        formula: window.FORMULAS_COSTOS[key].formula.replace(/\s+/g, ' ').trim()
                    };
                }
            });
        }
    }    updateDisplay() {
        // Cargar fórmulas externas al inicio
        this.cargarFormulasExterna();
        
        // Limpiar colores corruptos automáticamente
        this.limpiarColoresCorruptos();
        
        this.cargarConfiguracion();
        this.mostrarGestionMateriales();
        this.mostrarEditorFormulas(); // Solo este editor que incluye todo
        this.mostrarCloudSync(); // Mostrar interfaz de sincronización en la nube
        this.aplicarEstilos();
    }    // Función para mostrar la interfaz de sincronización en la nube
    mostrarCloudSync() {
        const cloudSyncSection = document.getElementById('cloudSyncSection');
        if (!cloudSyncSection) return;

        // Verificar si el administrador de sincronización está disponible
        if (window.cloudSyncManager) {
            window.cloudSyncManager.render();
        } else {
            cloudSyncSection.innerHTML = `
                <div class="cloud-sync-container">
                    <p>🔄 Cargando configuración de sincronización...</p>
                    <p><small>Si este mensaje persiste, verifica que los scripts de Firebase estén cargados correctamente.</small></p>
                </div>
            `;
        }
    }

    cargarConfiguracion() {
        // Asegurar que la configuración existe
        if (!this.data.configuracion) {
            this.data.configuracion = {
                gananciaPorDefecto: 30,
                redondeoPrecios: 0.01,
                tarifaOperadorDefecto: 15
            };
        }

        const campos = {
            'gananciaPorDefecto': this.data.configuracion.gananciaPorDefecto || 30,
            'redondeoPrecios': this.data.configuracion.redondeoPrecios || 0.01,
            'tarifaOperadorDefecto': this.data.configuracion.tarifaOperadorDefecto || 15
        };

        Object.keys(campos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = campos[id];
            }
        });
        
        // Cargar materiales personalizados o usar por defecto
        if (!this.data.configuracion.materialesPersonalizados) {
            this.data.configuracion.materialesPersonalizados = this.materialesDisponibles;
        }

        // Actualizar campo en calculadora si existe
        setTimeout(() => {
            const tarifaCalculadora = document.getElementById('tarifaOperador');
            if (tarifaCalculadora) {
                tarifaCalculadora.value = this.data.configuracion.tarifaOperadorDefecto || 15;
            }
        }, 100);
    }    mostrarGestionMateriales() {
        const materialesSection = document.getElementById('materialesPersonalizados');
        if (!materialesSection) return;

        const categorias = this.data.configuracion.materialesPersonalizados || this.materialesDisponibles;
        
        let html = '<h4>🧪 Gestión de Materiales</h4>';
        html += '<div class="materiales-grid">';
        
        Object.keys(categorias).forEach(categoria => {
            const datos = categorias[categoria];
            html += `
                <div class="material-category">
                    <div class="category-header" onclick="toggleMaterialCategory('${categoria}')">
                        ${datos.color} <strong>${categoria}</strong> (${datos.variantes.length} variantes)
                        <span class="toggle-icon" id="toggle-${categoria}">▼</span>
                    </div>
                    <div class="category-content" id="content-${categoria}" style="display: none;">
                        <div class="variantes-compact-list">
                            ${datos.variantes.map((variante, index) => `
                                <div class="variante-compact-item">
                                    <span class="variante-name">${variante}</span>
                                    <button class="btn-tiny btn-danger" onclick="eliminarVariante('${categoria}', ${index})" title="Eliminar variante">✕</button>
                                </div>
                            `).join('')}
                        </div>
                        <div class="add-variante">
                            <input type="text" id="nuevaVariante-${categoria}" placeholder="Nueva variante..." class="input-small">
                            <button class="btn-small" onclick="agregarVariante('${categoria}')">➕ Agregar</button>
                        </div>
                        <div class="category-actions">
                            <button class="btn-small btn-danger" onclick="eliminarCategoria('${categoria}')">🗑️ Eliminar categoría</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Formulario para nueva categoría
        html += `
            <div class="nueva-categoria">
                <h5>➕ Agregar Nueva Categoría</h5>
                <div class="form-row">
                    <input type="text" id="nuevaCategoriaNombre" placeholder="Nombre de la categoría (ej: WOOD)" class="input-medium">
                    <select id="nuevaCategoriaEmoji" class="input-small">
                        <option value="🟢">🟢 Verde</option>
                        <option value="🟠">🟠 Naranja</option>
                        <option value="🔴">🔴 Rojo</option>
                        <option value="🟡">🟡 Amarillo</option>
                        <option value="🔵">🔵 Azul</option>
                        <option value="⚫">⚫ Negro</option>
                        <option value="⚪">⚪ Blanco</option>
                        <option value="🟣">🟣 Morado</option>
                        <option value="🟤">🟤 Marrón</option>
                        <option value="⚙️">⚙️ Técnico</option>
                        <option value="🧪">🧪 Químico</option>
                        <option value="🧲">🧲 Especial</option>
                        <option value="💎">💎 Premium</option>
                        <option value="🔥">🔥 Alta temp</option>
                        <option value="❄️">❄️ Baja temp</option>
                    </select>
                    <button class="btn" onclick="agregarCategoria()">➕ Crear Categoría</button>
                </div>
            </div>
            
            <div class="materiales-actions">
                <button class="btn" onclick="exportarMateriales()">📤 Exportar materiales</button>
                <button class="btn" onclick="importarMateriales()">📥 Importar materiales</button>
                <button class="btn btn-danger" onclick="resetearMateriales()">🔄 Resetear a valores por defecto</button>
            </div>
        `;
        
        materialesSection.innerHTML = html;
    }

    // ELIMINAR completamente mostrarFormulasFinales() y renderFormulasFinalesSimple()
    // ya que ahora todo está en mostrarEditorFormulas()

    recargarFormulasExternas() {
        if (confirm('¿Recargar las fórmulas desde los archivos externos? Esto sobrescribirá las fórmulas actuales.')) {
            this.debeActualizarDesdeArchivo = true;
            this.cargarFormulasExterna();
            this.debeActualizarDesdeArchivo = false;
            
            app.save();
            this.updateDisplay();
            
            UI.showAlert('✅ Fórmulas recargadas desde archivos externos');
        }
    }

    editarArchivoFormulas() {
        const info = `
📝 EDITAR FÓRMULAS DESDE ARCHIVOS

Para editar las fórmulas directamente:

1. 📂 Ve a la carpeta del proyecto:
   c:\\Users\\svens\\Desktop\\printer admin\\formulas\\

2. 📝 Edita los archivos:
   • formulas-costos.js (para costos individuales)
   • formulas-finales.js (para cálculos finales)

3. 💾 Guarda los archivos

4. 🔄 Haz clic en "Recargar desde archivos"

Los archivos contienen:
• Fórmulas editables en JavaScript
• Ejemplos comentados
• Documentación de variables disponibles
• Instrucciones detalladas

¿Abrir la carpeta de fórmulas?
        `;
        
        if (confirm(info)) {
            // Intentar abrir la carpeta (solo funciona en algunos navegadores)
            try {
                window.open('file:///c:/Users/svens/Desktop/printer/admin/formulas/', '_blank');
            } catch (error) {
                UI.showAlert('📂 Abre manualmente: c:\\Users\\svens\\Desktop\\printer admin\\formulas\\');
            }
        }
    }

    mostrarEjemplosFormulas() {
        let ejemplos = '';
        
        if (window.EJEMPLOS_FORMULAS_FINALES) {
            ejemplos += '<h5>💡 Ejemplos de Fórmulas Finales:</h5>';
            Object.keys(window.EJEMPLOS_FORMULAS_FINALES).forEach(key => {
                ejemplos += `
                    <div class="example-item">
                        <strong>${key}:</strong>
                        <code onclick="app.managers.config.aplicarEjemploExterno('final', '${key}')">${window.EJEMPLOS_FORMULAS_FINALES[key].substring(0, 100)}...</code>
                    </div>
                `;
            });
        }
        
        if (window.EJEMPLOS_FORMULAS_COSTOS) {
            ejemplos += '<h5>🧮 Ejemplos de Fórmulas de Costos:</h5>';
            Object.keys(window.EJEMPLOS_FORMULAS_COSTOS).forEach(key => {
                ejemplos += `
                    <div class="example-item">
                        <strong>${key}:</strong>
                        <code onclick="app.managers.config.aplicarEjemploExterno('costo', '${key}')">${window.EJEMPLOS_FORMULAS_COSTOS[key].substring(0, 100)}...</code>
                    </div>
                `;
            });
        }
        
        return ejemplos;
    }

    aplicarEjemploExterno(tipo, key) {
        let formula = '';
        let targetKey = '';
        
        if (tipo === 'final' && window.EJEMPLOS_FORMULAS_FINALES) {
            formula = window.EJEMPLOS_FORMULAS_FINALES[key];
            targetKey = prompt('¿Para qué fórmula final? (costoTotal, precioVenta, aplicarRedondeo):', 'precioVenta');
        } else if (tipo === 'costo' && window.EJEMPLOS_FORMULAS_COSTOS) {
            formula = window.EJEMPLOS_FORMULAS_COSTOS[key];
            targetKey = prompt('¿Para qué fórmula de costo? (filamento, electricidad, mantenimiento, amortizacion, manoObra):', 'filamento');
        }
        
        if (formula && targetKey) {
            const textarea = document.getElementById(`formula${tipo === 'final' ? 'Final' : ''}_${targetKey}`);
            if (textarea) {
                textarea.value = formula.replace(/\s+/g, ' ').trim();
                if (tipo === 'final') {
                    this.actualizarFormulaFinal(targetKey, formula);
                } else {
                    this.actualizarFormula(targetKey, formula);
                }
                UI.showAlert(`✅ Ejemplo aplicado a ${targetKey}`);
            } else {
                UI.showAlert(`❌ No se encontró la fórmula ${targetKey}`);
            }
        }
    }

    updateDisplay() {
        this.cargarConfiguracion();
        this.mostrarGestionMateriales();
        this.mostrarEditorFormulas(); // Solo este editor que incluye todo
        this.mostrarCloudSync(); // Mostrar interfaz de sincronización en la nube
        
        this.aplicarEstilos();
    }

    guardar() {
        // Asegurar que la configuración existe
        if (!this.data.configuracion) {
            this.data.configuracion = {};
        }

        this.data.configuracion.gananciaPorDefecto = parseFloat(document.getElementById('gananciaPorDefecto').value) || 30;
        this.data.configuracion.redondeoPrecios = parseFloat(document.getElementById('redondeoPrecios').value) || 0.01;
        this.data.configuracion.tarifaOperadorDefecto = parseFloat(document.getElementById('tarifaOperadorDefecto').value) || 15;

        // Conservar materiales personalizados si existen
        if (!this.data.configuracion.materialesPersonalizados) {
            this.data.configuracion.materialesPersonalizados = this.materialesDisponibles;
        }

        app.save();
        
        // Actualizar campo en calculadora
        setTimeout(() => {
            const tarifaCalculadora = document.getElementById('tarifaOperador');
            if (tarifaCalculadora) {
                tarifaCalculadora.value = this.data.configuracion.tarifaOperadorDefecto || 15;
            }
        }, 100);
        
        // Actualizar select de materiales en formulario de filamentos
        setTimeout(() => {
            this.actualizarSelectMateriales();
        }, 100);
        
        UI.showAlert('✅ Configuración guardada correctamente');
    }    actualizarSelectMateriales() {
        const select = document.getElementById('tipoMaterial');
        if (!select) {
            console.log('Select de materiales no encontrado, reintentando...');
            setTimeout(() => this.actualizarSelectMateriales(), 500);
            return;
        }

        const valorActual = select.value;
        select.innerHTML = '';

        const materiales = this.data.configuracion.materialesPersonalizados || this.materialesDisponibles;
        
        Object.keys(materiales).forEach(categoria => {
            const datos = materiales[categoria];
            
            // Asegurar que el color sea solo emoji, no texto completo
            let colorEmoji = datos.color;
            if (colorEmoji && colorEmoji.includes(' ')) {
                // Si el color contiene texto, extraer solo el emoji
                colorEmoji = colorEmoji.split(' ')[0];
            }
            
            // Crear optgroup para la categoría
            const optgroup = document.createElement('optgroup');
            optgroup.label = `${colorEmoji} ${categoria}`;
            
            datos.variantes.forEach(variante => {
                const option = document.createElement('option');
                option.value = variante;
                option.textContent = variante;
                optgroup.appendChild(option);
            });
            
            select.appendChild(optgroup);
        });

        // Restaurar valor si existe
        if (valorActual && select.querySelector(`option[value="${valorActual}"]`)) {
            select.value = valorActual;
        }

        console.log('✅ Select de materiales actualizado con', Object.keys(materiales).length, 'categorías');
    }toggleMaterialCategory(categoria) {
        const content = document.getElementById(`content-${categoria}`);
        const toggle = document.getElementById(`toggle-${categoria}`);
        
        if (!content || !toggle) return;
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggle.textContent = '▲';
        } else {
            content.style.display = 'none';
            toggle.textContent = '▼';
        }
    }

    agregarVariante(categoria) {
        const input = document.getElementById(`nuevaVariante-${categoria}`);
        const nuevaVariante = input.value.trim();
        
        if (!nuevaVariante) {
            UI.showAlert('Por favor ingresa el nombre de la variante');
            return;
        }

        if (!this.data.configuracion.materialesPersonalizados) {
            this.data.configuracion.materialesPersonalizados = { ...this.materialesDisponibles };
        }

        this.data.configuracion.materialesPersonalizados[categoria].variantes.push(nuevaVariante);
        input.value = '';
        
        app.save();
        this.mostrarGestionMateriales();
        
        // Actualizar select con delay
        setTimeout(() => {
            this.actualizarSelectMateriales();
        }, 100);
        
        UI.showAlert(`✅ Variante "${nuevaVariante}" agregada a ${categoria}`);
    }

    eliminarVariante(categoria, index) {
        if (!UI.showConfirm(`¿Eliminar esta variante de ${categoria}?`)) return;

        this.data.configuracion.materialesPersonalizados[categoria].variantes.splice(index, 1);
        
        app.save();
        this.mostrarGestionMateriales();
        this.actualizarSelectMateriales();
        
        UI.showAlert('🗑️ Variante eliminada');
    }

    agregarCategoria() {
        const nombre = document.getElementById('nuevaCategoriaNombre').value.trim().toUpperCase();
        const emoji = document.getElementById('nuevaCategoriaEmoji').value;
        
        if (!nombre) {
            UI.showAlert('Por favor ingresa el nombre de la categoría');
            return;
        }

        if (!this.data.configuracion.materialesPersonalizados) {
            this.data.configuracion.materialesPersonalizados = { ...this.materialesDisponibles };
        }

        if (this.data.configuracion.materialesPersonalizados[nombre]) {
            UI.showAlert('Ya existe una categoría con ese nombre');
            return;
        }

        this.data.configuracion.materialesPersonalizados[nombre] = {
            color: emoji,
            variantes: [nombre] // Al menos la variante base
        };

        document.getElementById('nuevaCategoriaNombre').value = '';
        
        app.save();
        this.mostrarGestionMateriales();
        this.actualizarSelectMateriales();
        
        UI.showAlert(`✅ Categoría "${nombre}" creada correctamente`);
    }

    eliminarCategoria(categoria) {
        if (!UI.showConfirm(`¿Estás seguro de eliminar toda la categoría "${categoria}" y sus ${this.data.configuracion.materialesPersonalizados[categoria].variantes.length} variantes?`)) return;

        delete this.data.configuracion.materialesPersonalizados[categoria];
        
        app.save();
        this.mostrarGestionMateriales();
        this.actualizarSelectMateriales();
        
        UI.showAlert(`🗑️ Categoría "${categoria}" eliminada`);
    }

    exportarMateriales() {
        const materiales = {
            materiales: this.data.configuracion.materialesPersonalizados,
            fecha: new Date().toLocaleString('es-ES'),
            version: '2.0.0',
            tipo: 'materiales'
        };

        const blob = new Blob([JSON.stringify(materiales, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `materiales_impresion3d_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UI.showAlert('✅ Materiales exportados correctamente');
    }

    importarMateriales() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const datos = JSON.parse(e.target.result);
                        
                        if (datos.tipo === 'materiales' && datos.materiales) {
                            if (UI.showConfirm('¿Estás seguro de importar estos materiales? Se reemplazarán los actuales.')) {
                                this.data.configuracion.materialesPersonalizados = datos.materiales;
                                app.save();
                                this.mostrarGestionMateriales();
                                this.actualizarSelectMateriales();
                                UI.showAlert('✅ Materiales importados correctamente');
                            }
                        } else {
                            UI.showAlert('❌ El archivo no contiene materiales válidos');
                        }
                    } catch (error) {
                        UI.showAlert('❌ Error al leer el archivo de materiales');
                        console.error('Error:', error);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    resetearMateriales() {
        if (!UI.showConfirm('¿Estás seguro de resetear todos los materiales a los valores por defecto? Se perderán todas las personalizaciones.')) return;

        this.data.configuracion.materialesPersonalizados = this.getDefaultMateriales();
        app.save();
        this.mostrarGestionMateriales();
        this.actualizarSelectMateriales();
        
        UI.showAlert('🔄 Materiales restablecidos a valores por defecto');
    }

    mostrarEditorFormulas() {
        const formulasSection = document.getElementById('formulasPersonalizadas');
        if (!formulasSection) return;

        // Cargar fórmulas personalizadas si existen - INCLUYENDO FÓRMULAS FINALES
        const formulas = this.data.configuracion.formulasPersonalizadas || this.formulasPersonalizadas;
        const formulasFinales = this.data.configuracion.formulasFinales || this.getDefaultFormulasFinales();

        let html = `
            <div class="formulas-editor-simple">
                <h4>🧮 Editor Completo de Fórmulas</h4>
                <p>Personaliza todos los cálculos: costos individuales y precio final de venta.</p>
                
                <div class="formulas-sections">
                    <div class="formulas-costos-section">
                        <h5>💰 Fórmulas de Costos Individuales</h5>
                        <p>Modifica cómo se calcula cada tipo de costo por separado:</p>
                        <div class="formulas-grid">
        `;

        // SECCIÓN 1: Fórmulas de costos individuales
        Object.keys(formulas).forEach(key => {
            const formula = formulas[key];
            const isValid = this.validarFormula(formula.formula);
            
            html += `
                <div class="formula-item">
                    <div class="formula-header">
                        <span class="formula-status">${isValid ? '✅' : '❌'}</span>
                        <strong>${formula.nombre}</strong>
                    </div>
                    <p class="formula-description">${formula.descripcion}</p>
                    <textarea 
                        id="formula_${key}" 
                        class="formula-textarea"
                        onchange="app.managers.config.actualizarFormula('${key}', this.value)"
                        placeholder="Escribe tu fórmula aquí..."
                    >${formula.formula}</textarea>
                    <div class="formula-variables">
                        Variables disponibles: ${formula.variables?.join(', ') || 'Ver documentación'}
                    </div>
                    <div class="formula-actions">
                        <button class="btn-small" onclick="app.managers.config.probarFormula('${key}')">🧪 Probar</button>
                        <button class="btn-small" onclick="app.managers.config.resetearFormula('${key}')">🔄 Resetear</button>
                    </div>
                </div>
            `;
        });

        html += `
                        </div>
                    </div>

                    <div class="formulas-finales-section">
                        <h5>🎯 Fórmulas Finales (Precio de Venta)</h5>
                        <p>Personaliza cómo se calcula el precio final usando los costos ya calculados:</p>
                        <div class="formulas-grid">
        `;

        // SECCIÓN 2: Fórmulas finales
        Object.keys(formulasFinales).forEach(key => {
            const formula = formulasFinales[key];
            const isValid = this.validarFormula(formula.formula);
            
            html += `
                <div class="formula-item formula-final">
                    <div class="formula-header">
                        <span class="formula-status">${isValid ? '✅' : '❌'}</span>
                        <strong>${formula.nombre}</strong>
                    </div>
                    <p class="formula-description">${formula.descripcion}</p>
                    <textarea 
                        id="formulaFinal_${key}" 
                        class="formula-textarea"
                        onchange="app.managers.config.actualizarFormulaFinal('${key}', this.value)"
                        placeholder="Escribe tu fórmula aquí..."
                    >${formula.formula}</textarea>
                    <div class="formula-actions">
                        <button class="btn-small" onclick="app.managers.config.probarFormulaFinal('${key}')">🧪 Probar</button>
                        <button class="btn-small" onclick="app.managers.config.resetearFormulaFinal('${key}')">🔄 Resetear</button>
                    </div>
                </div>
            `;
        });

        html += `
                        </div>
                    </div>
                </div>
                
                <div class="formulas-examples">
                    <h5>💡 Ejemplos de Modificaciones</h5>
                    <div class="examples-grid">
                        <div class="examples-column">
                            <h6>🧮 Costos Individuales:</h6>
                            <div class="example-item">
                                <strong>🧵 Filamento con 10% descuento:</strong>
                                <code onclick="app.managers.config.aplicarEjemplo('filamento', 'cantidadGramos / 1000 * precioPorKg * (1 + desperdicioMaterial / 100) * 0.9')">
                                    cantidadGramos / 1000 * precioPorKg * (1 + desperdicioMaterial / 100) * 0.9
                                </code>
                            </div>
                            <div class="example-item">
                                <strong>⚡ Electricidad nocturna (-20%):</strong>
                                <code onclick="app.managers.config.aplicarEjemplo('electricidad', 'potencia / 1000 * tiempoHoras * costoElectricidad * 0.8')">
                                    potencia / 1000 * tiempoHoras * costoElectricidad * 0.8
                                </code>
                            </div>
                            <div class="example-item">
                                <strong>👨‍💼 Mano de obra mínima €5:</strong>
                                <code onclick="app.managers.config.aplicarEjemplo('manoObra', 'Math.max(tiempoManoObra * tarifaOperador, 5)')">
                                    Math.max(tiempoManoObra * tarifaOperador, 5)
                                </code>
                            </div>
                        </div>
                        <div class="examples-column">
                            <h6>🎯 Precio Final:</h6>
                            <div class="example-item">
                                <strong>💰 Margen variable por tamaño:</strong>
                                <code onclick="app.managers.config.aplicarEjemploFinal('precioVenta', 'cantidadGramos > 100 ? costoTotal * 1.2 : costoTotal * 1.3')">
                                    cantidadGramos > 100 ? costoTotal * 1.2 : costoTotal * 1.3
                                </code>
                            </div>
                            <div class="example-item">
                                <strong>📏 Precio mínimo €15:</strong>
                                <code onclick="app.managers.config.aplicarEjemploFinal('precioVenta', 'Math.max(costoTotal * 1.3, 15)')">
                                    Math.max(costoTotal * 1.3, 15)
                                </code>
                            </div>
                            <div class="example-item">
                                <strong>🕒 Descuento por tiempo largo:</strong>
                                <code onclick="app.managers.config.aplicarEjemploFinal('precioVenta', 'tiempoHoras > 8 ? costoTotal * 1.25 : costoTotal * (1 + margenGanancia / 100)')">
                                    tiempoHoras > 8 ? costoTotal * 1.25 : costoTotal * (1 + margenGanancia / 100)
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="formulas-actions">
                    <button class="btn btn-success" onclick="app.managers.config.guardarTodasLasFormulas()">
                        💾 Guardar Todas las Fórmulas
                    </button>
                    <button class="btn btn-secondary" onclick="app.managers.config.probarTodasLasFormulas()">
                        🧪 Probar Todas
                    </button>
                    <button class="btn btn-warning" onclick="app.managers.config.resetearTodasLasFormulas()">
                        🔄 Resetear Todo a Original
                    </button>
                </div>
                
                <div class="formulas-info">
                    <details>
                        <summary>📖 Variables Disponibles para Todas las Fórmulas</summary>
                        <div class="help-content">
                            
                            <div class="variables-section">
                                <h6>🔧 Variables de Entrada (Costos Individuales):</h6>
                                <ul>
                                    <li><code>cantidadGramos</code> - Gramos de filamento usado en la impresión</li>
                                    <li><code>tiempoHoras</code> - Horas totales de impresión</li>
                                    <li><code>precioPorKg</code> - Precio del filamento por kilogramo (€/kg)</li>
                                    <li><code>potencia</code> - Potencia de consumo de la impresora (Watts)</li>
                                    <li><code>costoElectricidad</code> - Costo de electricidad por kWh (€/kWh)</li>
                                    <li><code>factorAmortizacion</code> - Factor de amortización calculado (€/hora)</li>
                                    <li><code>desperdicioMaterial</code> - Porcentaje de desperdicio de material (%)</li>
                                    <li><code>tarifaOperador</code> - Tarifa por hora del operador (€/hora)</li>
                                    <li><code>tiempoManoObra</code> - Horas de trabajo manual requeridas</li>
                                    <li><code>costoMantenimientoPorHora</code> - Costo de mantenimiento por hora (€/hora)</li>
                                </ul>
                            </div>

                            <div class="variables-section">
                                <h6>💰 Variables Calculadas (para Fórmulas Finales):</h6>
                                <ul>
                                    <li><code>filamento</code> - Costo del filamento principal usado (€)</li>
                                    <li><code>electricidad</code> - Costo de electricidad consumida (€)</li>
                                    <li><code>mantenimiento</code> - Costo proporcional de mantenimiento (€)</li>
                                    <li><code>amortizacion</code> - Costo de amortización por hora de uso (€)</li>
                                    <li><code>manoObra</code> - Costo de la mano de obra invertida (€)</li>
                                    <li><code>filamentosAdicionales</code> - Costo de filamentos adicionales multi-material (€)</li>
                                    <li><code>boquilla</code> - Costo de desgaste de boquilla especializada (€)</li>
                                    <li><code>piezasExternas</code> - Costo de componentes adicionales (€)</li>
                                    <li><code>bufferErrores</code> - Costo adicional por factor de seguridad (€)</li>
                                </ul>
                            </div>

                            <div class="variables-section">
                                <h6>⚙️ Variables de Configuración (para Fórmulas Finales):</h6>
                                <ul>
                                    <li><code>costoTotal</code> - Suma de todos los costos calculados (€)</li>
                                    <li><code>margenGanancia</code> - Porcentaje de margen deseado (30 = 30%)</li>
                                    <li><code>redondeo</code> - Factor de redondeo (ej: 0.01, 0.05, 1.00)</li>
                                    <li><code>precio</code> - Precio de venta calculado (solo para redondeo) (€)</li>
                                </ul>
                            </div>
                            
                            <div class="variables-section">
                                <h6>🧮 Operadores Matemáticos Disponibles:</h6>
                                <ul>
                                    <li><code>+, -, *, /</code> - Operaciones básicas</li>
                                    <li><code>Math.max(a, b)</code> - Valor máximo entre a y b</li>
                                    <li><code>Math.min(a, b)</code> - Valor mínimo entre a y b</li>
                                    <li><code>Math.round(x)</code> - Redondear al entero más cercano</li>
                                    <li><code>Math.floor(x)</code> - Redondear hacia abajo</li>
                                    <li><code>Math.ceil(x)</code> - Redondear hacia arriba</li>
                                    <li><code>a > b ? c : d</code> - Condicional (si a > b entonces c, sino d)</li>
                                    <li><code>(variable || 0)</code> - Usar 0 si variable es undefined/null</li>
                                </ul>
                            </div>
                              <div style="background: var(--gradient-nebula); padding: 10px; border-radius: 5px; margin-top: 15px; border: 1px solid rgba(159, 168, 218, 0.3); color: var(--color-stellar-white);">
                                <strong>💡 Uso Recomendado:</strong>
                                <ul style="margin: 8px 0;">
                                    <li><strong>Fórmulas de Costos:</strong> Usa variables de entrada como <code>cantidadGramos, tiempoHoras, precioPorKg</code></li>
                                    <li><strong>Fórmulas Finales:</strong> Usa variables calculadas como <code>filamento, electricidad, costoTotal</code></li>
                                    <li><strong>Ambas:</strong> Puedes combinar cualquier variable según tus necesidades</li>
                                </ul>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        `;

        formulasSection.innerHTML = html;
    }

    getDefaultFormulasFinales() {
        return {
            costoTotal: {
                nombre: "Costo Total",
                formula: "filamento + electricidad + mantenimiento + amortizacion + manoObra + filamentosAdicionales + boquilla + piezasExternas + bufferErrores",
                descripcion: "Suma de todos los costos calculados individualmente"
            },
            precioVenta: {
                nombre: "Precio de Venta",
                formula: "costoTotal * (1 + margenGanancia / 100)",
                descripcion: "Aplica margen de ganancia al costo total"
            },
            aplicarRedondeo: {
                nombre: "Aplicar Redondeo",
                formula: "Math.round(precio / redondeo) * redondeo",
                descripcion: "Redondea el precio según el factor configurado"
            }
        };
    }

    aplicarEstilos() {
        if (!document.getElementById('config-styles')) {
            const style = document.createElement('style');
            style.id = 'config-styles';
            style.textContent = `
                .materiales-grid {
                    margin: 15px 0;
                }                .material-category {
                    border: 1px solid rgba(159, 168, 218, 0.3);
                    border-radius: 8px;
                    margin-bottom: 10px;
                    background: var(--gradient-nebula);
                }
                .category-header {
                    padding: 12px 15px;
                    background: var(--gradient-galaxy);
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 8px 8px 0 0;
                    transition: background-color 0.2s;
                    color: var(--color-stellar-white);
                    border: 1px solid rgba(159, 168, 218, 0.2);
                }
                .category-header:hover {
                    background: var(--gradient-stellar);
                    box-shadow: var(--glow-blue);
                }
                .toggle-icon {
                    font-weight: bold;
                    transition: transform 0.2s;
                }                .category-content {
                    padding: 15px;
                    border-top: 1px solid rgba(159, 168, 218, 0.3);
                    background: rgba(26, 26, 46, 0.4);
                    color: var(--color-stellar-white);
                }
                .variantes-list {
                    margin-bottom: 15px;
                }
                .variante-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    margin: 5px 0;
                    background: rgba(45, 58, 122, 0.4);
                    border-radius: 4px;
                    border: 1px solid rgba(159, 168, 218, 0.3);
                    color: var(--color-stellar-white);
                }
                .add-variante {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                }                .add-variante input {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid rgba(159, 168, 218, 0.4);
                    border-radius: 4px;
                    background: rgba(26, 26, 46, 0.6);
                    color: var(--color-stellar-white);
                }                .category-actions {
                    text-align: center;
                    padding-top: 10px;
                    border-top: 1px solid rgba(159, 168, 218, 0.3);
                }                .nueva-categoria {
                    background: var(--gradient-nebula);
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border: 1px solid rgba(159, 168, 218, 0.3);
                    color: var(--color-stellar-white);
                }
                .form-row {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    flex-wrap: wrap;
                }                .input-medium {
                    padding: 8px;
                    border: 1px solid rgba(159, 168, 218, 0.4);
                    border-radius: 4px;
                    flex: 1;
                    min-width: 200px;
                    background: rgba(26, 26, 46, 0.6);
                    color: var(--color-stellar-white);
                }                .input-small {
                    padding: 8px;
                    border: 1px solid rgba(159, 168, 218, 0.4);
                    border-radius: 4px;
                    width: 120px;
                    background: rgba(26, 26, 46, 0.6);
                    color: var(--color-stellar-white);
                }
                .materiales-actions {
                    text-align: center;
                    margin: 20px 0;
                }
                .materiales-actions .btn {
                    margin: 0 5px;
                }                .btn-small {
                    padding: 4px 8px;
                    font-size: 12px;
                    border: 1px solid rgba(159, 168, 218, 0.4);
                    background: var(--gradient-stellar);
                    border-radius: 4px;
                    cursor: pointer;
                    color: var(--color-stellar-white);
                    transition: all 0.2s;
                }
                .btn-small:hover {
                    background: var(--gradient-galaxy);
                    box-shadow: var(--glow-blue);
                }                .btn-danger {
                    background: var(--gradient-red-cosmic);
                    color: var(--color-stellar-white);
                    border: 1px solid rgba(220, 53, 69, 0.6);
                    transition: all 0.2s;
                }                .btn-danger:hover {
                    background: var(--gradient-danger);
                    box-shadow: 0 0 15px rgba(239, 76, 102, 0.5);
                }.formula-editor-section {
                    background: var(--gradient-nebula);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 15px 0;
                    border: 1px solid rgba(159, 168, 218, 0.3);
                    color: var(--color-stellar-white);
                }
                .formulas-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .formulas-grid {
                    display: grid;
                    gap: 15px;
                    margin: 15px 0;
                }                .formula-item {
                    background: rgba(26, 26, 46, 0.6);
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid rgba(159, 168, 218, 0.3);
                    color: var(--color-stellar-white);
                }
                .formula-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                .formula-status {
                    font-size: 14px;
                }                .formula-description {
                    color: var(--color-cosmic-mist);
                    font-size: 14px;
                    margin-bottom: 10px;
                }                .formula-textarea {
                    width: 100%;
                    min-height: 80px;
                    padding: 10px;
                    border: 1px solid rgba(159, 168, 218, 0.4);
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                    resize: vertical;
                    background: rgba(26, 26, 46, 0.6);
                    color: var(--color-stellar-white);
                }                .formula-variables {
                    margin-top: 8px;
                    color: var(--color-cosmic-mist);
                    font-size: 12px;
                }
                .formula-actions {
                    margin-top: 10px;
                    display: flex;
                    gap: 5px;
                }
                .examples-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin: 15px 0;
                }
                .example-item {
                    margin: 8px 0;
                }                .example-item code {
                    display: block;
                    background: rgba(26, 26, 46, 0.6);
                    padding: 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    margin: 5px 0;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid rgba(159, 168, 218, 0.3);
                    color: var(--color-stellar-white);
                }
                .example-item code:hover {
                    background: var(--gradient-stelar);
                    border-color: var(--color-nebula-blue);
                    box-shadow: var(--glow-blue);
                }
                .formulas-actions {
                    margin-top: 20px;
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Agregar métodos faltantes para trabajar con fórmulas
    validarFormula(formula) {
        if (!formula || typeof formula !== 'string') {
            return false;
        }
        
        try {
            // Crear función para validar sintaxis
            new Function('return ' + formula);
            return true;
        } catch (error) {
            console.warn('Fórmula inválida:', formula, error.message);
            return false;
        }
    }

    actualizarFormula(key, formula) {
        if (!this.data.configuracion.formulasPersonalizadas) {
            this.data.configuracion.formulasPersonalizadas = {...this.formulasPersonalizadas};
        }

        this.data.configuracion.formulasPersonalizadas[key].formula = formula;
        
        // Validar inmediatamente
        const isValid = this.validarFormula(formula);
        const statusElement = document.querySelector(`#formula_${key}`);
        if (statusElement) {
            const parentDiv = statusElement.closest('.formula-item');
            if (parentDiv) {
                const statusSpan = parentDiv.querySelector('.formula-status');
                if (statusSpan) {
                    statusSpan.textContent = isValid ? '✅' : '❌';
                }
            }
        }

        console.log(`🔧 Fórmula ${key} actualizada:`, formula, isValid ? '✅' : '❌');
    }

    actualizarFormulaFinal(key, formula) {
        if (!this.data.configuracion.formulasFinales) {
            this.data.configuracion.formulasFinales = this.getDefaultFormulasFinales();
        }

        this.data.configuracion.formulasFinales[key].formula = formula;
        
        // Validar inmediatamente
        const isValid = this.validarFormula(formula);
        const statusElement = document.querySelector(`#formulaFinal_${key}`);
        if (statusElement) {
            const parentDiv = statusElement.closest('.formula-item');
            if (parentDiv) {
                const statusSpan = parentDiv.querySelector('.formula-status');
                if (statusSpan) {
                    statusSpan.textContent = isValid ? '✅' : '❌';
                }
            }
        }

        console.log(`🔧 Fórmula final ${key} actualizada:`, formula, isValid ? '✅' : '❌');
    }

    aplicarEjemplo(key, formula) {
        const textarea = document.getElementById(`formula_${key}`);
        if (textarea) {
            textarea.value = formula;
            this.actualizarFormula(key, formula);
            UI.showAlert(`✅ Ejemplo aplicado a la fórmula "${key}"`);
        } else {
            console.error(`❌ No se encontró textarea para formula_${key}`);
        }
    }

    aplicarEjemploFinal(key, formula) {
        const textarea = document.getElementById(`formulaFinal_${key}`);
        if (textarea) {
            textarea.value = formula;
            this.actualizarFormulaFinal(key, formula);
            UI.showAlert(`✅ Ejemplo aplicado a la fórmula final "${key}"`);
        } else {
            console.error(`❌ No se encontró textarea para formulaFinal_${key}`);
        }
    }

    probarFormula(key) {
        const formulas = this.data.configuracion.formulasPersonalizadas || this.formulasPersonalizadas;
        const formula = formulas[key];
        
        if (!formula) {
            UI.showAlert(`❌ Fórmula ${key} no encontrada`);
            return;
        }

        const testVars = {
            cantidadGramos: 50,
            tiempoHoras: 3,
            precioPorKg: 25,
            potencia: 200,
            costoElectricidad: 0.15,
            factorAmortizacion: 0.8,
            desperdicioMaterial: 5,
            tarifaOperador: 15,
            tiempoManoObra: 0.5,
            costoMantenimientoPorHora: 0.24
        };

        try {
            const result = this.calcularConFormula(key, testVars);
            UI.showAlert(`✅ Fórmula "${formula.nombre}" funciona correctamente.\nResultado: €${result.toFixed(4)}`);
        } catch (error) {
            UI.showAlert(`❌ Error in fórmula "${formula.nombre}":\n${error.message}`);
        }
    }

    probarFormulaFinal(key) {
        const formulasFinales = this.data.configuracion.formulasFinales || this.getDefaultFormulasFinales();
        const formula = formulasFinales[key];
        
        if (!formula) {
            UI.showAlert(`❌ Fórmula final ${key} no encontrada`);
            return;
        }

        const testVars = {
            costoTotal: 15.50,
            margenGanancia: 30,
            redondeo: 0.01,
            precio: 20.15,
            filamento: 8.75,
            electricidad: 2.25,
            mantenimiento: 1.20,
            amortizacion: 2.40,
            manoObra: 0.90,
            cantidadGramos: 50,
            tiempoHoras: 3
        };

        try {
            const varNames = Object.keys(testVars);
            const varValues = Object.values(testVars);
            const func = new Function(...varNames, `return ${formula.formula};`);
            const result = func(...varValues);
            
            if (typeof result === 'number' && isFinite(result)) {
                UI.showAlert(`✅ Fórmula final "${formula.nombre}" funciona correctamente.\nResultado: €${result.toFixed(4)}`);
            } else {
                UI.showAlert(`❌ Fórmula final "${formula.nombre}" devuelve resultado inválido: ${result}`);
            }
        } catch (error) {
            UI.showAlert(`❌ Error en fórmula final "${formula.nombre}":\n${error.message}`);
        }
    }

    resetearFormula(key) {
        if (UI.showConfirm(`¿Resetear la fórmula "${key}" a su valor original?`)) {
            const formulaOriginal = this.getDefaultFormulas()[key];
            if (formulaOriginal) {
                const textarea = document.getElementById(`formula_${key}`);
                if (textarea) {
                    textarea.value = formulaOriginal.formula;
                    this.actualizarFormula(key, formulaOriginal.formula);
                    UI.showAlert(`✅ Fórmula "${key}" restablecida`);
                }
            }
        }
    }

    resetearFormulaFinal(key) {
        if (UI.showConfirm(`¿Resetear la fórmula final "${key}" a su valor original?`)) {
            const formulaOriginal = this.getDefaultFormulasFinales()[key];
            if (formulaOriginal) {
                const textarea = document.getElementById(`formulaFinal_${key}`);
                if (textarea) {
                    textarea.value = formulaOriginal.formula;
                    this.actualizarFormulaFinal(key, formulaOriginal.formula);
                    UI.showAlert(`✅ Fórmula final "${key}" restablecida`);
                }
            }
        }
    }

    calcularConFormula(key, variables) {
        const formulas = this.data.configuracion.formulasPersonalizadas || this.formulasPersonalizadas;
        const formula = formulas[key];
        
        if (!formula) {
            console.error(`❌ Fórmula ${key} no encontrada`);
            return 0;
        }

        try {
            const varNames = Object.keys(variables);
            const varValues = Object.values(variables);
            const func = new Function(...varNames, `return ${formula.formula};`);
            const result = func(...varValues);
            
            if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                return result;
            } else {
                console.error(`❌ Fórmula ${key} devolvió resultado inválido:`, result);
                return 0;
            }
        } catch (error) {
            console.error(`❌ Error ejecutando fórmula ${key}:`, error);
            return 0;
        }
    }

    guardarTodasLasFormulas() {
        if (!this.data.configuracion.formulasPersonalizadas) {
            this.data.configuracion.formulasPersonalizadas = {...this.formulasPersonalizadas};
        }

        if (!this.data.configuracion.formulasFinales) {
            this.data.configuracion.formulasFinales = this.getDefaultFormulasFinales();
        }

        // Validar todas las fórmulas antes de guardar
        let todasValidas = true;
        let errores = [];

        // Validar fórmulas de costos
        Object.keys(this.data.configuracion.formulasPersonalizadas).forEach(key => {
            const textarea = document.getElementById(`formula_${key}`);
            if (textarea) {
                const formula = textarea.value;
                if (!this.validarFormula(formula)) {
                    todasValidas = false;
                    errores.push(`Fórmula de costo "${key}" inválida`);
                }
            }
        });

        // Validar fórmulas finales
        Object.keys(this.data.configuracion.formulasFinales).forEach(key => {
            const textarea = document.getElementById(`formulaFinal_${key}`);
            if (textarea) {
                const formula = textarea.value;
                if (!this.validarFormula(formula)) {
                    todasValidas = false;
                    errores.push(`Fórmula final "${key}" inválida`);
                }
            }
        });

        if (!todasValidas) {
            const mensaje = `⚠️ Se encontraron errores en las fórmulas:\n\n${errores.join('\n')}\n\n¿Guardar de todas formas?`;
            if (!UI.showConfirm(mensaje)) {
                return;
            }
        }

        app.save();
        UI.showAlert('✅ Todas las fórmulas guardadas correctamente');
    }

    probarTodasLasFormulas() {
        console.log('🧪 Probando todas las fórmulas...');
        
        const testVars = {
            cantidadGramos: 50,
            tiempoHoras: 3,
            precioPorKg: 25,
            potencia: 200,
            costoElectricidad: 0.15,
            factorAmortizacion: 0.8,
            desperdicioMaterial: 5,
            tarifaOperador: 15,
            tiempoManoObra: 0.5,
            costoMantenimientoPorHora: 0.24
        };

        const testVarsFinales = {
            costoTotal: 15.50,
            margenGanancia: 30,
            redondeo: 0.01,
            precio: 20.15,
            filamento: 8.75,
            electricidad: 2.25,
            mantenimiento: 1.20,
            amortizacion: 2.40,
            manoObra: 0.90,
            cantidadGramos: 50,
            tiempoHoras: 3
        };

        const formulas = this.data.configuracion.formulasPersonalizadas || this.formulasPersonalizadas;
        const formulasFinales = this.data.configuracion.formulasFinales || this.getDefaultFormulasFinales();
        
        let mensaje = '🧪 RESULTADOS DE TODAS LAS FÓRMULAS:\n\n';
        let todasExitosas = true;
        
        // Probar fórmulas de costos
        mensaje += '💰 FÓRMULAS DE COSTOS:\n';
        Object.keys(formulas).forEach(key => {
            const formula = formulas[key];
            try {
                const result = this.calcularConFormula(key, testVars);
                mensaje += `✅ ${formula.nombre}: €${result.toFixed(4)}\n`;
            } catch (error) {
                mensaje += `❌ ${formula.nombre}: ERROR - ${error.message}\n`;
                todasExitosas = false;
            }
        });

        // Probar fórmulas finales
        mensaje += '\n🎯 FÓRMULAS FINALES:\n';
        Object.keys(formulasFinales).forEach(key => {
            const formula = formulasFinales[key];
            try {
                const varNames = Object.keys(testVarsFinales);
                const varValues = Object.values(testVarsFinales);
                const func = new Function(...varNames, `return ${formula.formula};`);
                const result = func(...varValues);
                
                if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                    mensaje += `✅ ${formula.nombre}: €${result.toFixed(4)}\n`;
                } else {
                    mensaje += `❌ ${formula.nombre}: Resultado inválido - ${result}\n`;
                    todasExitosas = false;
                }
            } catch (error) {
                mensaje += `❌ ${formula.nombre}: ERROR - ${error.message}\n`;
                todasExitosas = false;
            }
        });

        mensaje += `\n📊 Variables de prueba utilizadas:
• Cantidad: ${testVars.cantidadGramos}gr
• Tiempo: ${testVars.tiempoHoras}h  
• Precio/kg: €${testVars.precioPorKg}
• Potencia: ${testVars.potencia}W
• Electricidad: €${testVars.costoElectricidad}/kWh`;        console.error('❌ ConfigManager no disponible');

        if (todasExitosas) {
            mensaje += '\n\n🎉 ¡Todas las fórmulas funcionan correctamente!';
        } else {
            mensaje += '\n\n⚠️ Algunas fórmulas tienen errores. Revísalas antes de usar.';
        }        window.app.managers.config.resetearMateriales();
        alert(mensaje);

    }

    resetearTodasLasFormulas() {
        if (!UI.showConfirm('¿Estás seguro de resetear TODAS las fórmulas a sus valores originales? Se perderán todas las personalizaciones.')) {
            return;
        }

        // Resetear fórmulas de costos
        this.data.configuracion.formulasPersonalizadas = {...this.getDefaultFormulas()};
        
        // Resetear fórmulas finales
        this.data.configuracion.formulasFinales = this.getDefaultFormulasFinales();

        // Actualizar textareas de fórmulas de costos
        Object.keys(this.data.configuracion.formulasPersonalizadas).forEach(key => {
            const textarea = document.getElementById(`formula_${key}`);
            if (textarea) {
                textarea.value = this.data.configuracion.formulasPersonalizadas[key].formula;
            }
        });

        // Actualizar textareas de fórmulas finales
        Object.keys(this.data.configuracion.formulasFinales).forEach(key => {
            const textarea = document.getElementById(`formulaFinal_${key}`);
            if (textarea) {
                textarea.value = this.data.configuracion.formulasFinales[key].formula;
            }
        });
        
        app.save();
        this.updateDisplay();
        UI.showAlert('🔄 Todas las fórmulas restablecidas a valores originales');
    }

    limpiarColoresCorruptos() {
        if (!this.data.configuracion.materialesPersonalizados) return;
        
        let huboCambios = false;
        Object.keys(this.data.configuracion.materialesPersonalizados).forEach(categoria => {
            const datos = this.data.configuracion.materialesPersonalizados[categoria];
            if (datos.color && datos.color.includes(' ')) {
                // Extraer solo el emoji del color corrupto
                datos.color = datos.color.split(' ')[0];
                huboCambios = true;
            }
        });
        
        if (huboCambios) {
            app.save();
            console.log('🔧 Colores corruptos limpiados automáticamente');
        }
    }
}

// Funciones globales para compatibilidad con HTML - GESTIÓN DE MATERIALES
function toggleMaterialCategory(categoria) {
    if (window.app && window.app.managers.config) {
        window.app.managers.config.toggleMaterialCategory(categoria);
    } else {
        console.error('❌ ConfigManager no disponible');
    }
}

function agregarVariante(categoria) {
    if (window.app && window.app.managers.config) {
        window.app.managers.config.agregarVariante(categoria);
    } else {
        console.error('❌ ConfigManager no disponible');
    }
}

function eliminarVariante(categoria, index) {
    if (window.app && window.app.managers.config) {
        window.app.managers.config.eliminarVariante(categoria, index);
    } else {
        console.error('❌ ConfigManager no disponible');
    }
}

function agregarCategoria() {
    if (window.app && window.app.managers.config) {
        window.app.managers.config.agregarCategoria();
    } else {
        console.error('❌ ConfigManager no disponible');
    }
}

function eliminarCategoria(categoria) {
    if (window.app && window.app.managers.config) {
        window.app.managers.config.eliminarCategoria(categoria);
    } else {
        console.error('❌ ConfigManager no disponible');
    }
}

function exportarMateriales() {
    if (window.app && window.app.managers.config) {
        window.app.managers.config.exportarMateriales();
    } else {
        console.error('❌ ConfigManager no disponible');
    }
}

function importarMateriales() {
    if (window.app && window.app.managers.config) {
        window.app.managers.config.importarMateriales();
    } else {
        console.error('❌ ConfigManager no disponible');
    }
}

function resetearMateriales() {
    if (window.app && window.app.managers.config) {
        window.app.managers.config.resetearMateriales();
    } else {
        console.error('❌ ConfigManager no disponible');
    }
}

// Hacer las funciones disponibles globalmente
window.toggleMaterialCategory = toggleMaterialCategory;
window.agregarVariante = agregarVariante;
window.eliminarVariante = eliminarVariante;
window.agregarCategoria = agregarCategoria;
window.eliminarCategoria = eliminarCategoria;
window.exportarMateriales = exportarMateriales;
window.importarMateriales = importarMateriales;
window.resetearMateriales = resetearMateriales;
