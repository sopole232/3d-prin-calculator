// Script para limpiar colores corruptos
const fs = require('fs');

console.log('🔧 Iniciando limpieza de colores corruptos...');

// Leer datos actuales
let data = {};
try {
    const dataStr = fs.readFileSync('data.json', 'utf8');
    data = JSON.parse(dataStr);
} catch (e) {
    console.log('❌ No se pudo leer data.json:', e.message);
    process.exit(1);
}

console.log('📊 Verificando datos de materiales...');

// Función de limpieza de colores corruptos
function limpiarColoresCorruptos() {
    if (!data.configuracion?.materialesPersonalizados) {
        console.log('ℹ️  No hay materiales personalizados para limpiar');
        return false;
    }
    
    let huboCambios = false;
    Object.keys(data.configuracion.materialesPersonalizados).forEach(categoria => {
        const datos = data.configuracion.materialesPersonalizados[categoria];
        if (datos.color && datos.color.includes(' ')) {
            console.log(`⚠️  Color corrupto encontrado en ${categoria}: "${datos.color}"`);
            // Extraer solo el emoji del color corrupto
            const colorLimpio = datos.color.split(' ')[0];
            datos.color = colorLimpio;
            console.log(`✅ Limpiado a: "${colorLimpio}"`);
            huboCambios = true;
        }
    });
    
    return huboCambios;
}

// Ejecutar limpieza
const huboCambios = limpiarColoresCorruptos();

if (huboCambios) {
    // Guardar cambios
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    console.log('💾 Datos corruptos limpiados y guardados');
} else {
    console.log('✅ No se encontraron colores corruptos');
}

// Mostrar estado actual de materiales
console.log('\n📋 Estado actual de materiales:');
if (data.configuracion?.materialesPersonalizados) {
    Object.keys(data.configuracion.materialesPersonalizados).forEach(categoria => {
        const datos = data.configuracion.materialesPersonalizados[categoria];
        console.log(`  ${datos.color} ${categoria} (${datos.variantes?.length || 0} variantes)`);
    });
} else {
    console.log('  No hay materiales personalizados');
}

console.log('\n🎉 Limpieza completada');
