// Sistema de Puntos Global Compartido


let temaActual = ""; // Global
import { db } from './firebase.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

async function actualizarPuntosGlobales(cantidad = 0, tema = "") {
  const uid = localStorage.getItem('mateia_uid');
  if (!uid) return;

  const ref = doc(db, 'usuarios', uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const datos = snap.data();
  const nuevosPuntos = (datos.puntos || 0) + cantidad;
  const dia = new Date().getDay();

  const nuevosDatos = {
    puntos: nuevosPuntos,
    [`graficaDiaria.${dia}`]: (datos.graficaDiaria?.[dia] || 0) + cantidad,
  };

  if (tema) {
    nuevosDatos[`progresoTemas.${tema}`] = (datos.progresoTemas?.[tema] || 0) + cantidad;
  }

  await updateDoc(ref, nuevosDatos);

  // Actualizar visual
  const display = document.getElementById("points-display");
  if (display) display.textContent = nuevosPuntos; // donde nuevosPuntos es el total actual

}


// Crear y mostrar contador en el nav si no existe
function addPointsDisplay() {
    const navBar = document.querySelector('nav');
    if (!navBar) return;

    const puntosGuardados = parseInt(localStorage.getItem('mateia_puntos_globales'));
    window.puntosGlobales = !isNaN(puntosGuardados) && puntosGuardados >= 0 ? puntosGuardados : 0;

    let pointsDisplay = document.getElementById('points-display');
    if (!pointsDisplay) {
        const wrapper = document.createElement('div');
        wrapper.className = 'usuario-wrapper';

        wrapper.innerHTML = `
            <div id="usuario-nombre" class="usuario-nombre"> Cargando...</div>
            <button id="btn-logout" title="Cerrar sesión" class="logout-btn">⏻</button>
            <div class="points-counter">
                <div class="points-icon">⭐</div>
                <div class="points-text">Puntos: <span id="points-display">${window.puntosGlobales}</span></div>
            </div>
        `;

        navBar.appendChild(wrapper);
        // ⏻ Activar cerrar sesión dinámico
        const logoutBtn = wrapper.querySelector("#btn-logout");
        if (logoutBtn) {
            import('./auth.js').then(({ cerrarSesion }) => {
                logoutBtn.addEventListener("click", cerrarSesion);
            });
        }
        const style = document.createElement('style');
        style.textContent = `
            .usuario-wrapper {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-left: auto;
                margin-right: 20px;
            }

            .usuario-nombre {
                font-weight: 500;
                color: #343a40;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .points-counter {
                display: flex;
                align-items: center;
                background-color: rgba(76, 110, 245, 0.1);
                padding: 6px 12px;
                border-radius: 50px;
            }

            .points-icon {
                font-size: 1.2rem;
                margin-right: 6px;
            }

            .points-text {
                font-weight: 600;
                color: var(--primary-color, #333);
            }
                .usuario-identidad {
            display: flex;
            align-items: center;
            gap: 8px;
            }

            .logout-btn {
                background: none;
                border: none;
                font-size: 1.1rem;
                cursor: pointer;
                color: var(--light-text);
                transition: color 0.2s ease;
            }

            .logout-btn:hover {
                color: var(--error-color, #fa5252);
            }
        `;
        document.head.appendChild(style);
    }

    if (typeof actualizarPuntosGlobales === 'function') {
        actualizarPuntosGlobales(0);
    }

    console.log("🧠 Ejecutando addPointsDisplay()");
}


// Función global para notificación de puntos
function mostrarNotificacionPuntos(cantidad) {
    const notificacion = document.createElement('div');
    notificacion.className = 'puntos-notificacion';
    notificacion.innerHTML = `<span>+${cantidad} ⭐</span>`;

    // Posicionar en pantalla superior (puedes ajustar con CSS)
  
    notificacion.style.zIndex = '9999';
    notificacion.style.background = '#4caf50';
    notificacion.style.color = 'white';
    notificacion.style.padding = '10px 15px';
    notificacion.style.borderRadius = '20px';
    notificacion.style.fontSize = '18px';
    notificacion.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    notificacion.style.opacity = '0';
    notificacion.style.transition = 'all 0.5s ease';
    notificacion.style.marginBottom = "12px";

    const contenedor = document.getElementById("notificaciones-container") || document.body;
    contenedor.prepend(notificacion);


    // Mostrar con animación
    setTimeout(() => {
        notificacion.style.opacity = '1';
        notificacion.style.transform = 'translateY(10px)';
    }, 100);

    // Quitarla después de 2.5 segundos
    setTimeout(() => {
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (notificacion.parentNode) {
                document.body.removeChild(notificacion);
            }
        }, 500);
    }, 2500);
}

export async function actualizarRachaDiaria() {
  const uid = localStorage.getItem("mateia_uid");
  if (!uid) return;

  const ref = doc(db, "usuarios", uid);
  await new Promise(resolve => setTimeout(resolve, 150));
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const datos = snap.data();
  const hoy = new Date().toDateString();
  const ayer = new Date(Date.now() - 86400000).toDateString();
  const ultimaFecha = datos.fechaUltimoReto;
  const rachaActual = datos.racha || 0;

  // ⚡ PRIMER DÍA: si no hay racha o es 0, y fecha coincide con hoy
  if (rachaActual === 0 && ultimaFecha === hoy) {
  console.log("🚀 Primera racha registrada");
  await updateDoc(ref, {
    racha: 1
  });
  return 1;
}
  if (ultimaFecha === hoy) return; // ya se contó hoy

  let nuevaRacha = rachaActual;
  if (ultimaFecha === ayer) {
    nuevaRacha++;
  } else {
    nuevaRacha = 1;
  }

  await updateDoc(ref, {
    racha: nuevaRacha,
    fechaUltimoReto: hoy
  });

  const el = document.getElementById("racha-actual");
  if (el) {
    el.textContent = nuevaRacha;
    el.classList.add("racha-animada");
    setTimeout(() => el.classList.remove("racha-animada"), 1000);
  }

  return nuevaRacha;
}





function mostrarNotificacionNivel(nivel, nombre) {
    const noti = document.createElement("div");
    noti.className = "nivel-notificacion";
    noti.innerHTML = `
        <div class="noti-icon">📈</div>
        <div class="noti-text">
            <strong>¡Subiste al Nivel ${nivel}!</strong><br>
            ${nombre}
        </div>
    `;


    noti.style.zIndex = "9999";
    noti.style.padding = "15px";
    noti.style.background = "#1976D2";
    noti.style.color = "white";
    noti.style.borderRadius = "10px";
    noti.style.fontSize = "16px";
    noti.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
    noti.style.opacity = "0";
    noti.style.transition = "all 0.4s ease";
    noti.style.marginBottom = "12px";

    const contenedor = document.getElementById("notificaciones-container") || document.body;
    contenedor.prepend(noti);
    setTimeout(() => {
        noti.style.opacity = "1";
        noti.style.transform = "translateY(10px)";
    }, 50);

    setTimeout(() => {
        noti.style.opacity = "0";
        noti.style.transform = "translateY(-10px)";
        setTimeout(() => noti.remove(), 500);
    }, 4000);
}


export async function verificarInsignias() {
  const uid = localStorage.getItem("mateia_uid");
  if (!uid) return;

  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const completados = data.retosCompletadosLista || [];
  const desbloqueadas = new Set(data.insignias || []);
  const nuevas = [];

  const nivel = data.nivel || 1;
  const puntos = data.puntos || 0;
  const racha = data.racha || 0;
  const ejercicios = data.ejerciciosCompletados || 0;

  const revisaRetos = (ids) => ids.every(id => completados.includes(id));
  const cuentaRetos = (ids) => ids.filter(id => completados.includes(id)).length;

  const reglas = [
    {
      id: "insignia_racha",
      condicion: racha >= 5,
      progreso: `Progreso: ${racha}/5 días`,
      recompensa: 100
    },
    {
      id: "insignia_estadistica",
      condicion: revisaRetos(["estadistica1", "estadistica2", "estadistica3"]),
      progreso: `Progreso: ${cuentaRetos(["estadistica1", "estadistica2", "estadistica3"])}/3`,
      recompensa: 100
    },
    {
      id: "insignia_geometria",
      condicion: revisaRetos(["geometria1", "geometria2", "geometria3"]),
      progreso: `Progreso: ${cuentaRetos(["geometria1", "geometria2", "geometria3"])}/3`,
      recompensa: 100
    },
    {
      id: "insignia_trigonometria",
      condicion: revisaRetos(["trigonometria1", "trigonometria2", "trigonometria3"]),
      progreso: `Progreso: ${cuentaRetos(["trigonometria1", "trigonometria2", "trigonometria3"])}/3`,
      recompensa: 100
    },
    {
      id: "insignia_algebra",
      condicion: revisaRetos(["algebra1", "algebra2", "algebra3"]),
      progreso: `Progreso: ${cuentaRetos(["algebra1", "algebra2", "algebra3"])}/3`,
      recompensa: 100
    },
    {
      id: "insignia_retoman",
      condicion: completados.length >= 5,
      progreso: `Progreso: ${completados.length}/5`,
      recompensa: 100
    },
    {
      id: "insignia_ejercicios",
      condicion: ejercicios >= 10,
      progreso: `Progreso: ${ejercicios}/10`,
      recompensa: 50
    },
    {
      id: "insignia_puntos",
      condicion: puntos >= 300,
      progreso: `Progreso: ${Math.min(puntos, 300)}/300`,
      recompensa: 200
    },
    {
      id: "insignia_completista",
      condicion: completados.length >= 12,
      progreso: `Progreso: ${completados.length}/12`,
      recompensa: 150
    },
    {
      id: "insignia_maestro_final",
      condicion: nivel >= 5,
      progreso: `Nivel actual: ${nivel}/5`,
      recompensa: 300
    }
  ];

  let recompensaTotal = 0;
  let desbloqueadasAhora = [...desbloqueadas];

  reglas.forEach(({ id, condicion, progreso, recompensa }) => {
    const bloque = document.getElementById(id);
    if (bloque) {
      const progresoDiv = bloque.querySelector(".insignia-progreso");
      if (progresoDiv) progresoDiv.textContent = condicion ? `Obtenido: ${new Date().toLocaleDateString("es-MX")}` : progreso;
    }

    if (condicion && !desbloqueadas.has(id)) {
      nuevas.push({ id, recompensa });
      recompensaTotal += recompensa;
      desbloqueadasAhora.push(id);
      mostrarInsigniaNotificacion(id, recompensa);
    }

    // Quitar clases si está desbloqueada
    if (condicion || desbloqueadas.has(id)) {
      bloque?.classList.remove("locked");
      bloque?.querySelector(".insignia-img")?.classList.remove("locked");
    }
  });

  if (nuevas.length > 0) {
    await updateDoc(ref, {
      insignias: desbloqueadasAhora,
      puntos: puntos + recompensaTotal
    });
  }

  const contador = document.getElementById("insignias-ganadas");
  if (contador) contador.textContent = `${desbloqueadasAhora.length}/10`;
}






function mostrarInsigniaNotificacion(insigniaId, puntos) {
        const insigniaNombre = {
        "insignia_racha": "🔥 Racha Imparable",
        "insignia_estadistica": "📊 Analista de Datos",
        "insignia_geometria": "📐 Geómetra Experto",
        "insignia_ejercicios": "🎓 Estudiante Constante",
        "insignia_retoman": "💡 Desafío Mental",
        "insignia_puntos": "🧠 Mente Brillante",
        "insignia_algebra": "➕ Genio del Álgebra",
        "insignia_trigonometria": "📐 Maestro Trigonométrico",
        "insignia_completista": "✅ Maestro Total",
        "insignia_maestro_final": "🏅 Leyenda Numérica"

    };

    const mensaje = `¡Desbloqueaste la insignia <strong>${insigniaNombre[insigniaId]}</strong>! +${puntos} ⭐`;

    const noti = document.createElement("div");
    noti.className = "insignia-notificacion";
    noti.innerHTML = `
        <div class="noti-icon">🎖️</div>
        <div class="noti-text">${mensaje}</div>
    `;

    noti.style.zIndex = "9999";
    noti.style.padding = "15px";
    noti.style.background = "#4CAF50";
    noti.style.color = "white";
    noti.style.borderRadius = "10px";
    noti.style.fontSize = "16px";
    noti.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
    noti.style.opacity = "0";
    noti.style.transition = "all 0.4s ease";
    noti.style.marginBottom = "12px";

    const contenedor = document.getElementById("notificaciones-container") || document.body;
    contenedor.prepend(noti);

    setTimeout(() => {
        noti.style.opacity = "1";
        noti.style.transform = "translateY(10px)";
    }, 50);

    setTimeout(() => {
        noti.style.opacity = "0";
        noti.style.transform = "translateY(-10px)";
        setTimeout(() => noti.remove(), 500);
    }, 4000);
}
export async function verificarNivel() {
  const uid = localStorage.getItem("mateia_uid");
  if (!uid) return;

  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const datos = snap.data();
  const puntos = datos.puntos || 0;

  const niveles = [
    { nivel: 1, nombre: "Novato Numérico", minimo: 0 },
    { nivel: 2, nombre: "Explorador Matemático", minimo: 300 },
    { nivel: 3, nombre: "Estratega Numérico", minimo: 600 },
    { nivel: 4, nombre: "Lógico Avanzado", minimo: 900 },
    { nivel: 5, nombre: "Maestro de los Números", minimo: 1200 }
  ];

  let nivelActual = niveles[0];
  for (let i = 0; i < niveles.length; i++) {
    if (puntos >= niveles[i].minimo) {
      nivelActual = niveles[i];
    }
  }

  const previo = datos.nivel || 1;

  if (nivelActual.nivel > previo) {
    await updateDoc(ref, {
      nivel: nivelActual.nivel
    });
    localStorage.setItem("mateia_nivel_actual", nivelActual.nivel);
    mostrarNotificacionNivel(nivelActual.nivel, nivelActual.nombre);
  }
}


export {
  addPointsDisplay,
  actualizarPuntosGlobales,
  mostrarNotificacionPuntos,
  mostrarNotificacionNivel,

};



// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', addPointsDisplay);