// reto.js totalmente reescrito — funcional y con estilo igual a ejercicios.js

const poolRetosDiarios = [
  {
    id: "diario1",
    titulo: "Suma simple",
    texto: "¿Cuánto es 7 + 8?",
    opciones: ["14", "15", "16", "17"],
    respuestaCorrecta: 1,
    recompensa: 50
  },
  {
    id: "diario2",
    titulo: "Álgebra básica",
    texto: "Resuelve: 3x + 2 = 11",
    opciones: ["x = 2", "x = 3", "x = 4", "x = 5"],
    respuestaCorrecta: 2,
    recompensa: 50
  }
];

if (!window.mateiaUser) {
  window.mateiaUser = {
    retosCompletados: 0,
    puntosTotales: 0,
    retoDiarioCompletado: false,
    fechaUltimoReto: null
  };
}

function guardarUserData() {
  localStorage.setItem("mateiaUser", JSON.stringify(window.mateiaUser));
}

function cargarUserData() {
  const data = localStorage.getItem("mateiaUser");
  if (data) Object.assign(window.mateiaUser, JSON.parse(data));
}

function cargarRetoDiario() {
  cargarUserData();

  const hoy = new Date().toDateString();
  const ultimaFecha = window.mateiaUser.fechaUltimoReto;

  if (ultimaFecha !== hoy) {
    const retoDelDia = poolRetosDiarios[Math.floor(Math.random() * poolRetosDiarios.length)];
    localStorage.setItem("retoDiario", JSON.stringify(retoDelDia));
    window.mateiaUser.retoDiarioCompletado = false;
    window.mateiaUser.fechaUltimoReto = hoy;
    guardarUserData();
  }

  const reto = JSON.parse(localStorage.getItem("retoDiario"));

  document.querySelector(".reto-diario-content h3").textContent = reto.titulo;
  document.querySelector(".reto-diario-content p").textContent = reto.texto;
  document.querySelector(".reto-daily-reward span:last-child").textContent = `Recompensa: ${reto.recompensa} puntos`;

  const btnComenzar = document.getElementById("comenzar-reto-diario");
btnComenzar.classList.remove("btn-finalizado");

if (window.mateiaUser.retoDiarioCompletado) {
  btnComenzar.disabled = true;
  btnComenzar.textContent = "Reto diario ya completado 🏁";
  btnComenzar.classList.add("btn-finalizado");
} else {
  btnComenzar.disabled = false;
  btnComenzar.textContent = "Comenzar Reto";
}

  btnComenzar.addEventListener("click", () => {
    if (!window.mateiaUser.retoDiarioCompletado) iniciarRetoDiario(reto);
  });

  iniciarContadorReset();
}

function actualizarEstadosDeBotones() {
  const hoy = new Date().toDateString();

  document.querySelectorAll(".reto-card").forEach(card => {
    const id = card.dataset.id;
    const btn = card.querySelector(".reto-btn");

    const completado = localStorage.getItem(`reto-${id}-completado`) === "true";
    const falladoHoy = localStorage.getItem(`reto-${id}-fecha`) === hoy;

    if (completado) {
      btn.disabled = true;
      btn.textContent = "Ya completado";
    } else if (falladoHoy) {
      btn.disabled = true;
      btn.textContent = "Ya lo intentaste hoy";
    } else {
      btn.disabled = false;
      btn.textContent = "Iniciar Reto";
    }
  });
}


function iniciarContadorReset() {
  const spanReset = document.getElementById("tiempo-reset");
  setInterval(() => {
    const ahora = new Date();
    const mañana = new Date();
    mañana.setHours(24, 0, 0, 0);
    const diff = mañana - ahora;
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    if (spanReset) spanReset.textContent = `Se renueva en: ${h}:${m}:${s}`;
  }, 1000);
}


function iniciarRetoDiario(reto) {
  const modal = document.getElementById("reto-modal");
  modal.classList.add("active");

  document.getElementById("reto-modal-titulo").textContent = reto.titulo;
  document.getElementById("reto-pregunta-num").textContent = "Pregunta única";
  document.getElementById("reto-problema").innerHTML = reto.texto;

  const opcionesCont = document.getElementById("reto-opciones");
  opcionesCont.innerHTML = "";

  document.getElementById("feedback-correcto").style.display = "none";
  document.getElementById("feedback-incorrecto").style.display = "none";
  document.getElementById("reto-resultados").style.display = "none";
  document.getElementById("reto-pregunta-container").style.display = "block";
  document.getElementById("ver-soluciones").style.display = "none";
  document.getElementById("siguiente-reto").style.display = "none";
  document.getElementById("reto-timer").textContent = "Libre";

  reto.opciones.forEach((opcion, i) => {
    const btn = document.createElement("button");
    btn.className = "opcion-btn";
    btn.textContent = opcion;
    btn.dataset.correcto = i === reto.respuestaCorrecta;
    btn.onclick = e => resolverRetoDiario(e, reto, Math.floor(Math.random() * 59) + 1); // Simulamos tiempo
    opcionesCont.appendChild(btn);
  });

  document.querySelector(".close-modal").addEventListener("click", cerrarModalYResetear);
}



function resolverRetoDiario(e, reto, tiempoTranscurrido) {
  const esCorrecta = e.target.dataset.correcto === "true";
  const opciones = document.querySelectorAll(".opcion-btn");

  opciones.forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.correcto === "true") btn.classList.add("correcta");
    else if (btn === e.target) btn.classList.add("incorrecta");
  });

  const feedbackCorrecto = document.getElementById("feedback-correcto");
  const feedbackIncorrecto = document.getElementById("feedback-incorrecto");
  document.getElementById("respuesta-correcta").textContent = reto.opciones[reto.respuestaCorrecta];

  if (esCorrecta) {
    feedbackCorrecto.style.display = "block";
    feedbackIncorrecto.style.display = "none";
    window.mateiaUser.puntosTotales += reto.recompensa;
    window.mateiaUser.retosCompletados++;
  } else {
    feedbackCorrecto.style.display = "none";
    feedbackIncorrecto.style.display = "block";
  }

  window.mateiaUser.retoDiarioCompletado = true;
  guardarUserData();

  document.getElementById("comenzar-reto-diario").disabled = true;

  if (typeof actualizarPuntosGlobales === 'function' && esCorrecta) {
    actualizarPuntosGlobales(reto.recompensa);
  }
 
  setTimeout(() => {
    mostrarResultadoDiario(esCorrecta, reto, tiempoTranscurrido);
  }, 1500);
}


function mostrarResultadoDiario(esCorrecta, reto, tiempoTranscurrido) {
  document.getElementById("reto-pregunta-container").style.display = "none";
  document.getElementById("reto-resultados").style.display = "block";

  document.getElementById("resultado-puntos").textContent = esCorrecta ? `${reto.recompensa} puntos` : "0 puntos";
  document.getElementById("resultado-tiempo").textContent = `00:${String(tiempoTranscurrido).padStart(2, '0')}`;
  document.getElementById("resultado-correctas").textContent = esCorrecta ? "1/1" : "0/1";

  // Ocultar sección de premio
  document.getElementById("resultado-premio").style.display = "none";

  // Ocultar botones de navegación no usados en retos diarios
  document.getElementById("ver-soluciones").style.display = "none";
  document.getElementById("siguiente-reto").style.display = "none";

  // Cambiar estado del botón principal
  const btnComenzar = document.getElementById("comenzar-reto-diario");
    btnComenzar.disabled = true;
    btnComenzar.textContent = "Reto diario ya completado 🏁";
    btnComenzar.classList.add("btn-finalizado");
}

function cerrarModalYResetear() {
  const modal = document.getElementById("reto-modal");
  modal.classList.remove("active");

  // Marcar como completado incluso si no se respondió
  if (!window.mateiaUser.retoDiarioCompletado) {
    window.mateiaUser.retoDiarioCompletado = true;
    guardarUserData();

    const btnComenzar = document.getElementById("comenzar-reto-diario");
    btnComenzar.disabled = true;
    btnComenzar.textContent = "Reto diario ya completado 🏁";
    btnComenzar.classList.add("btn-finalizado");
  }
}
// reto.js totalmente reescrito — funcional y con estilo igual a ejercicios.js

const poolRetosCategorias = {
  // ALGEBRA
  "algebra1": {
    titulo: "Ecuaciones Lineales",
    texto: "Resuelve: 2x + 5 = 15",
    opciones: ["x = 5", "x = 4", "x = 6", "x = 3"],
    respuestaCorrecta: 0,
    recompensa: 20,
    tema: "algebra"
  },
  "algebra2": {
    titulo: "Factorización",
    texto: "Factoriza: x² - 16",
    opciones: ["(x+4)(x-4)", "(x+8)(x-2)", "(x+2)(x-8)", "(x+16)(x-1)"],
    respuestaCorrecta: 0,
    recompensa: 35,
    tema: "algebra"
  },
  "algebra3": {
    titulo: "Ecuaciones Cuadráticas",
    texto: "Resuelve: x² - 3x - 4 = 0",
    opciones: ["x = 4 o -1", "x = 2 o 2", "x = -4 o 1", "x = 3 o 1"],
    respuestaCorrecta: 0,
    recompensa: 50,
    tema: "algebra"
  },

  // GEOMETRIA
  "geometria1": {
    titulo: "Perímetros y Áreas",
    texto: "¿Cuál es el área de un rectángulo de 5x3 cm?",
    opciones: ["15 cm²", "8 cm²", "10 cm²", "18 cm²"],
    respuestaCorrecta: 0,
    recompensa: 25,
    tema: "geometria"
  },
  "geometria2": {
    titulo: "Área de triángulo",
    texto: "¿Cuál es el área de un triángulo de base 6 cm y altura 4 cm?",
    opciones: ["12 cm²", "24 cm²", "10 cm²", "16 cm²"],
    respuestaCorrecta: 0,
    recompensa: 20,
    tema: "geometria"
  },
  "geometria3": {
    titulo: "Circunferencia",
    texto: "¿Cuál es la fórmula de la circunferencia de un círculo?",
    opciones: ["2πr", "πr²", "πd", "r²/π"],
    respuestaCorrecta: 0,
    recompensa: 25,
    tema: "geometria"
  },

  // ESTADISTICA
  "estadistica1": {
    titulo: "Tendencia Central",
    texto: "¿Cuál es la media de: 2, 4, 6, 8, 10?",
    opciones: ["6", "5", "7", "8"],
    respuestaCorrecta: 0,
    recompensa: 25,
    tema: "estadistica"
  },
  "estadistica2": {
    titulo: "Moda",
    texto: "¿Cuál es la moda de: 2, 4, 4, 5, 6?",
    opciones: ["4", "5", "6", "2"],
    respuestaCorrecta: 0,
    recompensa: 20,
    tema: "estadistica"
  },
  "estadistica3": {
    titulo: "Mediana",
    texto: "¿Cuál es la mediana de: 3, 1, 4, 1, 5?",
    opciones: ["3", "4", "1", "5"],
    respuestaCorrecta: 0,
    recompensa: 25,
    tema: "estadistica"
  },

  // TRIGONOMETRIA
  "trigonometria1": {
    titulo: "Razones Trigonométricas",
    texto: "Si sin(θ) = 3/5, ¿cuánto vale cos(θ) para un triángulo rectángulo?",
    opciones: ["4/5", "3/4", "5/3", "2/5"],
    respuestaCorrecta: 0,
    recompensa: 30,
    tema: "trigonometria"
  },
  "trigonometria2": {
    titulo: "Tangente",
    texto: "¿Cuál es la tangente de un ángulo agudo?",
    opciones: ["opuesto/adyacente", "adyacente/hipotenusa", "opuesto/hipotenusa", "hipotenusa/adyacente"],
    respuestaCorrecta: 0,
    recompensa: 30,
    tema: "trigonometria"
  },
  "trigonometria3": {
    titulo: "Relación pitagórica",
    texto: "¿Cuál es la relación pitagórica básica?",
    opciones: ["a² + b² = c²", "a + b = c", "a² - b² = c", "ab = c²"],
    respuestaCorrecta: 0,
    recompensa: 30,
    tema: "trigonometria"
  }
};



document.querySelectorAll(".categoria-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".categoria-tab").forEach(tab => tab.classList.remove("active"));
    btn.classList.add("active");

    const categoria = btn.dataset.categoria;
    document.querySelectorAll(".categoria-retos").forEach(cont => cont.classList.remove("active"));
    document.getElementById(`${categoria}-retos`).classList.add("active");
    actualizarEstadosDeBotones();

  });
});

document.querySelectorAll(".reto-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const retoId = btn.closest(".reto-card").dataset.id;
    iniciarRetoCategoria(poolRetosCategorias[retoId], btn, retoId);
  });
});


function iniciarRetoCategoria(reto, boton, retoId) {
  const modal = document.getElementById("reto-modal");
  modal.classList.add("active");

  const hoy = new Date().toDateString();
  const claveBloqueo = `reto-${retoId}-fecha`;

  // Si ya fue intentado hoy, solo cierra el modal
  if (localStorage.getItem(claveBloqueo) === hoy) {
    modal.classList.remove("active");
    return;
  }

  document.getElementById("reto-modal-titulo").textContent = reto.titulo;
  document.getElementById("reto-pregunta-num").textContent = "Pregunta única";
  document.getElementById("reto-problema").innerHTML = reto.texto;

  const opcionesCont = document.getElementById("reto-opciones");
  opcionesCont.innerHTML = "";

  document.getElementById("feedback-correcto").style.display = "none";
  document.getElementById("feedback-incorrecto").style.display = "none";
  document.getElementById("reto-resultados").style.display = "none";
  document.getElementById("reto-pregunta-container").style.display = "block";
  document.getElementById("ver-soluciones").style.display = "none";
  document.getElementById("siguiente-reto").style.display = "none";
  document.getElementById("reto-timer").textContent = "Libre";

  reto.opciones.forEach((opcion, i) => {
    const btn = document.createElement("button");
    btn.className = "opcion-btn";
    btn.textContent = opcion;
    btn.dataset.correcto = i === reto.respuestaCorrecta;

    btn.onclick = e => {
      const esCorrecta = e.target.dataset.correcto === "true";
      const opciones = document.querySelectorAll(".opcion-btn");

      opciones.forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.correcto === "true") btn.classList.add("correcta");
        else if (btn === e.target) btn.classList.add("incorrecta");
      });

      const feedbackCorrecto = document.getElementById("feedback-correcto");
      const feedbackIncorrecto = document.getElementById("feedback-incorrecto");
      document.getElementById("respuesta-correcta").textContent = reto.opciones[reto.respuestaCorrecta];

      if (esCorrecta) {
        feedbackCorrecto.style.display = "block";
        feedbackIncorrecto.style.display = "none";

        window.mateiaUser.puntosTotales += reto.recompensa;
        window.mateiaUser.retosCompletados++;

        localStorage.setItem(`reto-${retoId}-completado`, "true");

        if (typeof updatePoints === 'function') {
            updatePoints(reto.recompensa);
          }
          if (typeof actualizarPuntosGlobales === 'function') {
          actualizarPuntosGlobales(reto.recompensa, reto.tema);
         } 
          

        setTimeout(() => {
            if (typeof verificarNivel === 'function') {
                verificarNivel();
            }
        }, 100); // Espera mínima para que puntos se reflejen en window.puntosGlobales



        if (typeof mostrarNotificacionPuntos === 'function') {
          mostrarNotificacionPuntos(reto.recompensa);
        }
          if (typeof verificarInsignias === 'function') verificarInsignias();

        boton.disabled = true;
        boton.textContent = "Ya completado";

      } else {
        feedbackCorrecto.style.display = "none";
        feedbackIncorrecto.style.display = "block";

        boton.disabled = true;
        boton.textContent = "Fallaste hoy";
      }

      guardarUserData();
      localStorage.setItem(claveBloqueo, hoy);

      setTimeout(() => {
        mostrarResultadoDiario(esCorrecta, reto, "--");
      }, 1500);
    };

    opcionesCont.appendChild(btn);
  });

  document.querySelector(".close-modal").onclick = () => {
    document.getElementById("reto-modal").classList.remove("active");
  };
}


document.addEventListener("DOMContentLoaded", () => {
  cargarRetoDiario();
  

  // IMPORTANTE: Mover esto aquí
  document.querySelectorAll(".categoria-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".categoria-tab").forEach(tab => tab.classList.remove("active"));
      btn.classList.add("active");

      const categoria = btn.dataset.categoria;
      document.querySelectorAll(".categoria-retos").forEach(cont => cont.classList.remove("active"));
      document.getElementById(`${categoria}-retos`).classList.add("active");
      actualizarEstadosDeBotones();
    });
  });

  document.querySelectorAll(".reto-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const retoId = btn.closest(".reto-card").dataset.id;
      iniciarRetoCategoria(poolRetosCategorias[retoId], btn, retoId);
    });
  });

  setTimeout(() => {
    actualizarEstadosDeBotones();
  }, 100);
  verificarInsignias();
  // Este es el fix:
  const closeBtn = document.querySelector(".close-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("reto-modal").classList.remove("active");
    });
  }
});

