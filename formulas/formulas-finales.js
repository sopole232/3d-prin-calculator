/**
 * FÓRMULAS FINALES PERSONALIZABLES
 * 
 * Este archivo contiene las fórmulas finales que se aplican después de calcular
 * todos los costos individuales. Puedes editar estas fórmulas directamente.
 * 
 * VARIABLES DISPONIBLES:
 * - filamento: Costo del filamento principal
 * - electricidad: Costo de electricidad
 * - mantenimiento: Costo de mantenimiento
 * - amortizacion: Costo de amortización
 * - manoObra: Costo de mano de obra
 * - filamentosAdicionales: Costo de filamentos adicionales (puede ser 0)
 * - boquilla: Costo de desgaste de boquilla (puede ser 0)
 * - piezasExternas: Costo de piezas externas (puede ser 0)
 * - bufferErrores: Costo del buffer de errores
 * - costoTotal: Costo total ya calculado
 * - margenGanancia: Porcentaje de margen de ganancia
 * - redondeo: Factor de redondeo (ej: 0.01, 0.05, 1.00)
 */

window.FORMULAS_FINALES = {
    costoTotal: {
        nombre: "Costo Total",
        descripcion: "Suma todos los costos calculados",
        formula: `
            filamento + 
            electricidad + 
            mantenimiento + 
            amortizacion + 
            manoObra + 
            (filamentosAdicionales || 0) + 
            (boquilla || 0) + 
            (piezasExternas || 0) + 
            (bufferErrores || 0)
        `
    },

    precioVenta: {
        nombre: "Precio de Venta",
        descripcion: "Aplica margen de ganancia al costo total",
        formula: `
            costoTotal * (1 + margenGanancia / 100)
        `
    },

    aplicarRedondeo: {
        nombre: "Aplicar Redondeo",
        descripcion: "Redondea el precio final según la configuración",
        formula: `
            Math.round(precioVenta / redondeo) * redondeo
        `
    }
};

/**
 * EJEMPLOS DE FÓRMULAS PERSONALIZADAS
 * 
 * Puedes usar estos ejemplos como base para crear tus propias fórmulas:
 */

window.EJEMPLOS_FORMULAS_FINALES = {
    // Ejemplo 1: Costo total con descuento por volumen
    costoTotalConDescuento: `
        let costoBase = filamento + electricidad + mantenimiento + amortizacion + manoObra + (filamentosAdicionales || 0) + (boquilla || 0) + (piezasExternas || 0) + (bufferErrores || 0);
        let descuentoVolumen = filamento > 10 ? 0.95 : 1; // 5% descuento si filamento > €10
        return costoBase * descuentoVolumen;
    `,

    // Ejemplo 2: Precio con margen variable según costo
    precioConMargenVariable: `
        let margen = costoTotal < 10 ? 40 : costoTotal < 50 ? 30 : 25; // Margen variable
        return costoTotal * (1 + margen / 100);
    `,

    // Ejemplo 3: Precio mínimo garantizado
    precioConMinimo: `
        let precioCalculado = costoTotal * (1 + margenGanancia / 100);
        return Math.max(precioCalculado, 15); // Mínimo €15
    `,

    // Ejemplo 4: Redondeo personalizado por rangos
    redondeoPersonalizado: `
        if (precioVenta < 10) return Math.round(precioVenta / 0.50) * 0.50; // Redondeo a 50 centimos
        if (precioVenta < 50) return Math.round(precioVenta / 1.00) * 1.00; // Redondeo a euros
        return Math.round(precioVenta / 5.00) * 5.00; // Redondeo a 5 euros
    `,

    // Ejemplo 5: Fórmula compleja con múltiples factores
    formulaCompleja: `
        // Factor de complejidad basado en tiempo y material
        let factorComplejidad = 1;
        if (tiempoHoras > 10) factorComplejidad += 0.1; // +10% si >10h
        if (filamento > 100) factorComplejidad += 0.05; // +5% si >100g
        
        // Costo base con factor de complejidad
        let costoBase = (filamento + electricidad + mantenimiento) * factorComplejidad + 
                       amortizacion + manoObra + (filamentosAdicionales || 0) + 
                       (boquilla || 0) + (piezasExternas || 0) + (bufferErrores || 0);
        
        return costoBase;
    `
};

console.log('📋 Fórmulas finales cargadas desde archivo externo');
