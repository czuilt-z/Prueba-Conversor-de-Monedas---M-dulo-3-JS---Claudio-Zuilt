// Función para obtener tasas
const getMonedas = async () => {
    try {
        const res = await fetch("https://mindicador.cl/api/");
        const data = await res.json();

        console.log(data);

        return {
            dolar: data.dolar.valor,
            euro: data.euro.valor,
            uf: data.uf.valor,
            ivp: data.ivp.valor,
            bitcoin: data.bitcoin.valor
        };

    } catch (error) {
        console.log(error);
    }
};

// DOM
const input = document.getElementById("input_monedas");
const select = document.getElementById("select_moneda");
const button = document.getElementById("btn_convertir");
const resultado = document.getElementById("resultado");

// Historial
const getHistorial = async (moneda) => {
    try {
        const res = await fetch(`https://mindicador.cl/api/${moneda}`);
        const data = await res.json();

        const ultimos10 = data.serie.slice(0, 10).reverse();

        const fechas = ultimos10.map(d => d.fecha.slice(0, 10));
        const valores = ultimos10.map(d => d.valor);

        return { fechas, valores };

    } catch (error) {
        console.log(error);
    }
};

// Gráfico
let chart;

const renderGrafico = (fechas, valores) => {
    const ctx = document.getElementById("grafico").getContext("2d");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: fechas,
            datasets: [{
                label: "Historial últimos 10 días",
                data: valores,
                borderWidth: 2
            }]
        }
    });
};

// EVENTO al hacer clic en el botón, se realiza la conversión y se obtiene el historial para renderizar el gráfico.
button.addEventListener("click", async () => {

    const monedas = await getMonedas();

    if (!monedas) {
        resultado.innerText = "Error al obtener datos";
        return;
    }

    const monto = parseFloat(input.value);
    const monedaSeleccionada = select.value;

    // validación correcta
    if (isNaN(monto) || monto <= 0) {
        resultado.innerText = "Ingresa un monto válido";
        return;
    }

    const valor = monedas[monedaSeleccionada];
    const conversion = monto / valor;

    resultado.innerText = `Resultado: ${conversion.toFixed(2)} ${monedaSeleccionada}`;

    // gráfico
    const historial = await getHistorial(monedaSeleccionada);

    if (!historial) {
        return;
    }

    renderGrafico(historial.fechas, historial.valores);
});