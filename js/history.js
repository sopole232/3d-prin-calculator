class HistoryManager {
    constructor(data) {
        this.data = data;
    }

    updateDisplay() {
        const container = document.getElementById('listaHistorico');
        if (!container) return;

        if (!this.data.historico || this.data.historico.length === 0) {
            container.innerHTML = '<p>No hay cálculos en el histórico.</p>';
            return;
        }

        let html = '';
        this.data.historico.forEach(calculo => {
            html += `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">                        <div class="history-info">
                            <h4>${calculo.perfil} - ${calculo.filamento}</h4>
                            <p><strong>Fecha:</strong> ${calculo.fecha}</p>
                            <p><strong>Cantidad:</strong> ${calculo.cantidad}g | <strong>Tiempo:</strong> ${calculo.tiempo}h</p>
                        </div>
                        <div class="history-pricing">
                            <div class="history-price">€${calculo.precioVenta.toFixed(2)}</div>
                            <div class="history-cost">Costo: €${calculo.costoTotal.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    static limpiar() {
        if (!UI.showConfirm('¿Estás seguro de eliminar todo el histórico?')) return;
        
        if (window.app) {
            window.app.data.historico = [];
            window.app.save();
            window.app.managers.history.updateDisplay();
            UI.updateCounters(window.app.data);
            UI.showAlert('🗑️ Histórico limpiado');
        }
    }

    limpiar() {
        HistoryManager.limpiar();
    }
}

function limpiarHistorico() {
    if (window.app && window.app.managers.history) {
        window.app.managers.history.limpiar();
    }
}
