const puntos = parseInt(localStorage.getItem('mateia_puntos_globales')) || 0;

// Definición de niveles
const niveles = [
    { nivel: 1, nombre: "Novato Numérico", minimo: 0 },
    { nivel: 2, nombre: "Explorador Matemático", minimo: 300 },
    { nivel: 3, nombre: "Estratega Numérico", minimo: 600 },
    { nivel: 4, nombre: "Lógico Avanzado", minimo: 900 },
    { nivel: 5, nombre: "Maestro de los Números", minimo: 1200 }
];

// Determinar nivel actual
let nivelActual = niveles[0];
let siguienteNivel = niveles[niveles.length - 1];

for (let i = 0; i < niveles.length; i++) {
    if (puntos >= niveles[i].minimo) {
        nivelActual = niveles[i];
        siguienteNivel = niveles[i + 1] || niveles[i];
    }
}
const nivelAnterior = parseInt(localStorage.getItem("mateia_nivel_actual")) || 1;

if (nivelActual.nivel > nivelAnterior) {
    // Guardar nuevo nivel
    localStorage.setItem("mateia_nivel_actual", nivelActual.nivel);

    // Mostrar notificación visual
    mostrarNotificacionNivel(nivelActual.nivel, nivelActual.nombre);
}

const puntosParaNivelActual = nivelActual.minimo;
const puntosParaSiguiente = siguienteNivel.minimo;
const faltan = Math.max(puntosParaSiguiente - puntos, 0);
const porcentaje = Math.min(((puntos - puntosParaNivelActual) / (puntosParaSiguiente - puntosParaNivelActual)) * 100, 100);

// Actualizar en HTML
document.getElementById("nivel-badge").textContent = nivelActual.nivel;
document.getElementById("nivel-actual").textContent = `Nivel ${nivelActual.nivel}: ${nivelActual.nombre}`;
document.getElementById("puntos-nivel").textContent = `${puntos}/${puntosParaSiguiente} puntos`;

const fill = document.querySelector(".nivel-progress-fill");
if (fill) fill.style.width = `${porcentaje}%`;

const siguienteText = document.querySelector(".siguiente-nivel");
if (siguienteText) {
    siguienteText.innerHTML = `
        <span>Siguiente: Nivel ${siguienteNivel.nivel} - ${siguienteNivel.nombre}</span>
        <span>Faltan: ${faltan} puntos</span>
    `;
}

document.addEventListener("DOMContentLoaded", function () {
    generarGraficoSemanal();
    generarGraficoPorAreas();
});

function generarGraficoSemanal() {
    const stats = JSON.parse(localStorage.getItem("mateia_estadisticas") || "[]");
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const puntosPorDia = Array(7).fill(0);

    stats.forEach(entry => {
        const dia = new Date(entry.fecha).getDay();
        puntosPorDia[dia] += entry.puntos;
    });

    new Chart(document.getElementById("grafico-rendimiento"), {
        type: "bar",
        data: {
            labels: dias,
            datasets: [{
                label: "Puntos ganados",
                data: puntosPorDia,
                backgroundColor: "#42a5f5"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}



function graficarDominioPorAreas() {
    const stats = JSON.parse(localStorage.getItem("mateia_estadisticas") || "[]");

    const temas = ["algebra", "geometria", "estadistica", "trigonometria"];
    const colores = ["#4caf50", "#81c784", "#a5d6a7", "#c8e6c9"];
    const puntosPorTema = {
        algebra: 0,
        geometria: 0,
        estadistica: 0,
        trigonometria: 0
    };

    stats.forEach(item => {
        const tema = item.tema;
        if (tema && puntosPorTema.hasOwnProperty(tema)) {
            puntosPorTema[tema] += item.puntos;
        }
    });

    const data = {
        labels: temas,
        datasets: [{
            label: "Puntos por área",
            data: temas.map(t => puntosPorTema[t]),
            backgroundColor: "#66bb6a"
        }]
    };

    const ctx = document.getElementById("grafico-areas").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: data,
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: true },
                title: {
                    display: false
                }
            }
        }
    });
}


document.addEventListener("DOMContentLoaded", () => {
  // Cargar los datos del usuario
  const data = localStorage.getItem("mateiaUser");
  if (data) {
    const usuario = JSON.parse(data);
    // Mostrar retos completados
    document.getElementById("retos-completados").textContent = usuario.retosCompletados || 0;
  }

  // Mostrar puntos totales desde la variable global (más confiable)
  if (typeof window.puntosGlobales !== 'undefined') {
    document.getElementById("total-puntos").textContent = window.puntosGlobales;

  } else {
    // Por si acaso no ha corrido addPointsDisplay() todavía
    const puntos = parseInt(localStorage.getItem('mateia_puntos_globales')) || 0;
    document.getElementById("puntos-totales").textContent = puntos;
  }
   // Rachas 
    const racha = parseInt(localStorage.getItem("mateia_racha_actual")) || 0;
    document.getElementById("racha-actual").textContent = racha;

  // Insginias
  verificarInsignias();
  graficarDominioPorAreas(); // ✅ Esta es la correcta

});
