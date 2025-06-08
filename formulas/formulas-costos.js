/**
 * FÓRMULAS DE COSTOS PERSONALIZABLES
 * 
 * Este archivo contiene las fórmulas para calcular cada tipo de costo.
 * Puedes editar estas fórmulas directamente.
 * 
 * VARIABLES DISPONIBLES PARA CADA FÓRMULA:
 * - cantidadGramos: Gramos de filamento usado
 * - tiempoHoras: Horas de impresión
 * - precioPorKg: Precio del filamento por kg
 * - potencia: Potencia de la impresora en watts
 * - costoElectricidad: Costo de electricidad por kWh
 * - factorAmortizacion: Factor de amortización por hora
 * - desperdicioMaterial: Porcentaje de desperdicio
 * - tarifaOperador: Tarifa por hora del operador
 * - tiempoManoObra: Horas de trabajo manual
 * - costoMantenimientoPorHora: Costo de mantenimiento por hora
 */

window.FORMULAS_COSTOS = {
    filamento: {
        nombre: "Costo del Filamento",
        descripcion: "Peso × Precio/kg × (1 + Desperdicio%)",
        variables: ["cantidadGramos", "precioPorKg", "desperdicioMaterial"],
        formula: `
            cantidadGramos / 1000 * precioPorKg * (1 + desperdicioMaterial / 100)
        `
    },

    electricidad: {
        nombre: "Costo de Electricidad",
        descripcion: "(Potencia/1000) × Horas × Costo/kWh",
        variables: ["potencia", "tiempoHoras", "costoElectricidad"],
        formula: `
            potencia / 1000 * tiempoHoras * costoElectricidad
        `
    },

    mantenimiento: {
        nombre: "Costo de Mantenimiento",
        descripcion: "Horas × Costo mantenimiento por hora",
        variables: ["tiempoHoras", "costoMantenimientoPorHora"],
        formula: `
            tiempoHoras * costoMantenimientoPorHora
        `
    },

    amortizacion: {
        nombre: "Costo de Amortización",
        descripcion: "Horas × Factor amortización",
        variables: ["tiempoHoras", "factorAmortizacion"],
        formula: `
            tiempoHoras * factorAmortizacion
        `
    },

    manoObra: {
        nombre: "Costo de Mano de Obra",
        descripcion: "Tiempo trabajo × Tarifa/hora",
        variables: ["tiempoManoObra", "tarifaOperador"],
        formula: `
            tiempoManoObra * tarifaOperador
        `
    }
};

/**
 * EJEMPLOS DE FÓRMULAS PERSONALIZADAS
 */
window.EJEMPLOS_FORMULAS_COSTOS = {
    // Filamento con descuento por volumen
    filamentoConDescuento: `
        let costoBase = cantidadGramos / 1000 * precioPorKg * (1 + desperdicioMaterial / 100);
        let descuento = cantidadGramos > 100 ? 0.9 : 1; // 10% descuento si >100g
        return costoBase * descuento;
    `,

    // Electricidad con tarifa nocturna
    electricidadNocturna: `
        let tarifaNormal = potencia / 1000 * tiempoHoras * costoElectricidad;
        let descuentoNocturno = 0.8; // 20% descuento nocturno
        return tarifaNormal * descuentoNocturno;
    `,

    // Mantenimiento con factor de uso intensivo
    mantenimientoIntensivo: `
        let factorIntensivo = tiempoHoras > 8 ? 1.2 : 1; // +20% si >8h
        return tiempoHoras * costoMantenimientoPorHora * factorIntensivo;
    `,

    // Amortización acelerada
    amortizacionAcelerada: `
        let factorAceleracion = 1.5; // Amortizar más rápido
        return tiempoHoras * factorAmortizacion * factorAceleracion;
    `,

    // Mano de obra con tarifa mínima
    manoObraConMinimo: `
        let costoCalculado = tiempoManoObra * tarifaOperador;
        return Math.max(costoCalculado, 5); // Mínimo €5
    `
};

console.log('🧮 Fórmulas de costos cargadas desde archivo externo');
