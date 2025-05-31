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
// Detectar clics en insignias
document.querySelectorAll(".insignia").forEach(card => {
  card.addEventListener("click", () => {
    const id = card.id;
    switch (id) {
      case "insignia_racha":
        abrirModalInsignia(
          id,
          "🔥 Racha Imparable",
          "Debes completar al menos un reto o ejercicio durante 5 días consecutivos.",
          "1/5 días",
          "+100 puntos"
        );
        break;
      case "insignia_estadistica":
        abrirModalInsignia(
          id,
          "📊 Analista de Datos",
          "Resuelve todos los retos de Estadística disponibles en la plataforma.",
          "0/3 retos",
          "+100 puntos"
        );
        break;
      case "insignia_geometria":
        abrirModalInsignia(
          id,
          "📐 Geómetra Experto",
          "Supera todos los retos de Geometría para dominar esta área.",
          "0/3 retos",
          "+100 puntos"
        );
        break;
      case "insignia_ejercicios":
        abrirModalInsignia(
          id,
          "🎓 Estudiante Constante",
          "Completa al menos 10 ejercicios de cualquier categoría.",
          "10/10 ejercicios",
          "+50 puntos"
        );
        break;
      case "insignia_retoman":
        abrirModalInsignia(
          id,
          "💡 Desafío Mental",
          "Realiza 5 retos matemáticos para poner a prueba tu mente.",
          "3/5 retos",
          "+50 puntos"
        );
        break;
      case "insignia_puntos":
        abrirModalInsignia(
          id,
          "🧠 Mente Brillante",
          "Alcanza un total de 300 puntos acumulados en la plataforma.",
          "Obtenido",
          "+200 puntos"
        );
        break;
      case "insignia_algebra":
        abrirModalInsignia(
          id,
          "➕ Genio del Álgebra",
          "Completa todos los retos disponibles en Álgebra.",
          "Obtenido",
          "+100 puntos"
        );
        break;
      case "insignia_trigonometria":
        abrirModalInsignia(
          id,
          "📐 Maestro Trigonométrico",
          "Resuelve los retos de Trigonometría con éxito.",
          "0/3 retos",
          "+100 puntos"
        );
        break;
      case "insignia_completista":
        abrirModalInsignia(
          id,
          "✅ Maestro Total",
          "Completa todos los retos de todas las áreas.",
          "3/12 retos",
          "+100 puntos"
        );
        break;
      case "insignia_maestro_final":
        abrirModalInsignia(
          id,
          "🏅 Leyenda Numérica",
          "Alcanza el nivel 5: Maestro de los Números.",
          "Nivel actual: 3/5",
          "+300 puntos"
        );
        break;
    }
  });
});

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
// Modal info
function abrirModalInfo(tipo, valor) {
  const body = document.getElementById("modal-info-body");
  let html = "";

  switch (tipo) {
    case "puntos":
      html = `
        <h2>⭐ Puntos Totales</h2>
        <p>Representa la cantidad de puntos que has acumulado al resolver ejercicios y retos.</p>
        <p><strong>Puntos actuales:</strong> ${valor}</p>
      `;
      break;
    case "racha":
      html = `
        <h2>🔥 Racha Actual</h2>
        <p>Una racha se incrementa al completar al menos un reto o ejercicio diario.</p>
        <p><strong>Días consecutivos:</strong> ${valor}</p>
      `;
      break;
    case "retos":
      html = `
        <h2>🏆 Retos Completados</h2>
        <p>Indica la cantidad total de retos que has completado en cualquier categoría.</p>
        <p><strong>Total:</strong> ${valor}</p>
      `;
      break;
    case "insignias":
      html = `
        <h2>🎖️ Insignias Ganadas</h2>
        <p>Las insignias son logros que se desbloquean al alcanzar metas específicas.</p>
        <p><strong>Has ganado:</strong> ${valor}</p>
      `;
      break;
  }

  body.innerHTML = html;
  document.getElementById("info-modal").classList.add("active");
}

function cerrarModalInfo() {
  document.getElementById("info-modal").classList.remove("active");
}

// Hacerla accesible desde el HTML
window.cerrarModalInfo = cerrarModalInfo;

// También cerrar al hacer clic fuera del contenido
document.getElementById("info-modal").addEventListener("click", e => {
  if (e.target.id === "info-modal") cerrarModalInfo();
});
// Escuchar clics en los stat-box
document.querySelectorAll(".stat-box").forEach(stat => {
  stat.addEventListener("click", () => {
    const id = stat.querySelector(".stat-value").id;
    const valor = stat.querySelector(".stat-value").textContent;
    if (id === "total-puntos") abrirModalInfo("puntos", valor);
    else if (id === "racha-actual") abrirModalInfo("racha", valor);
    else if (id === "retos-completados") abrirModalInfo("retos", valor);
    else if (id === "insignias-ganadas") abrirModalInfo("insignias", valor);
  });
});
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
function abrirModalInsignia(id, titulo, descripcion, progreso, recompensa) {
  const body = document.getElementById("modal-info-body");
  body.innerHTML = `
    <h2>${titulo}</h2>
    <p><strong>¿Cómo se desbloquea?</strong></p>
    <p>${descripcion}</p>
    <p><strong>Progreso actual:</strong> ${progreso}</p>
    <p><strong>Recompensa:</strong> ${recompensa}</p>
  `;
  document.getElementById("info-modal").classList.add("active");
}


