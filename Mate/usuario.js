// usuario.js con Firebase
import { db } from './firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';
import { verificarInsignias } from './global.js';

document.addEventListener("DOMContentLoaded", async () => {
  const uid = localStorage.getItem('mateia_uid');
  if (!uid) return location.href = 'login.html';

  const ref = doc(db, 'usuarios', uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert('Usuario no encontrado.');
    return;
  }

  const usuario = snap.data();

  // Mostrar puntos
  const puntos = usuario.puntos || 0;
  document.getElementById("total-puntos").textContent = puntos;

  // Calcular nivel
  const niveles = [
    { nivel: 1, nombre: "Novato Numérico", minimo: 0 },
    { nivel: 2, nombre: "Explorador Matemático", minimo: 300 },
    { nivel: 3, nombre: "Estratega Numérico", minimo: 600 },
    { nivel: 4, nombre: "Lógico Avanzado", minimo: 900 },
    { nivel: 5, nombre: "Maestro de los Números", minimo: 1200 }
  ];

  let nivelActual = niveles[0], siguienteNivel = niveles[niveles.length - 1];
  for (let i = 0; i < niveles.length; i++) {
    if (puntos >= niveles[i].minimo) {
      nivelActual = niveles[i];
      siguienteNivel = niveles[i + 1] || niveles[i];
    }
  }

  const puntosParaNivelActual = nivelActual.minimo;
  const puntosParaSiguiente = siguienteNivel.minimo;
  const faltan = Math.max(puntosParaSiguiente - puntos, 0);
  const porcentaje = Math.min(((puntos - puntosParaNivelActual) / (puntosParaSiguiente - puntosParaNivelActual)) * 100, 100);

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

  // Racha
  document.getElementById("racha-actual").textContent = usuario.racha || 0;

  // Retos completados
  document.getElementById("retos-completados").textContent = (typeof usuario.retosCompletados === 'number') ? usuario.retosCompletados : 0;


  // Gráficos
  const puntosSemana = Array(7).fill(0);
  if (usuario.graficaDiaria) {
    Object.entries(usuario.graficaDiaria).forEach(([k, v]) => {
      const i = parseInt(k);
      if (i >= 0 && i <= 6) puntosSemana[i] = v;
    });
  }
  generarGraficoSemanal(puntosSemana);
  graficarDominioPorAreas(usuario.progresoTemas || {});

  verificarInsignias();
});

function generarGraficoSemanal(puntosPorDia) {
  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

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

function graficarDominioPorAreas(puntosPorTema) {
  const temas = ["algebra", "geometria", "estadistica", "trigonometria"];
  const data = {
    labels: temas,
    datasets: [{
      label: "Puntos por área",
      data: temas.map(t => puntosPorTema[t] || 0),
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
        title: { display: false }
      }
    }
  });
}


