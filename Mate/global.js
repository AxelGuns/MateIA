// Sistema de Puntos Global Compartido

// Inicializar variable global desde localStorage
const puntosGuardados = parseInt(localStorage.getItem('mateia_puntos_globales'));
window.puntosGlobales = !isNaN(puntosGuardados) && puntosGuardados >= 0 ? puntosGuardados : 0;
let temaActual = ""; // Global

// Función para actualizar puntos
function actualizarPuntosGlobales(delta, tema = null) {
    window.puntosGlobales += delta;
    localStorage.setItem('mateia_puntos_globales', window.puntosGlobales);

    // 🔁 Forzar actualización real del display
    const display = document.getElementById('points-display');
    if (display) {
        display.textContent = window.puntosGlobales;
    }

    // También actualiza si hay más elementos
    document.querySelectorAll('.puntos-globales').forEach(el => {
        el.textContent = window.puntosGlobales;
    });
    registrarEstadistica(delta, tema);
    console.log("📊 Puntos actualizados:", window.puntosGlobales);
}

function registrarEstadistica(puntos, tema = null) {
    const hoy = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const entrada = { fecha: hoy, puntos, tema };
    const stats = JSON.parse(localStorage.getItem("mateia_estadisticas") || "[]");
    stats.push(entrada);
    localStorage.setItem("mateia_estadisticas", JSON.stringify(stats));
}


// Crear y mostrar contador en el nav si no existe
function addPointsDisplay() {
    const navBar = document.querySelector('nav');
    if (!navBar) return;

    const puntosGuardados = parseInt(localStorage.getItem('mateia_puntos_globales'));
    window.puntosGlobales = !isNaN(puntosGuardados) && puntosGuardados >= 0 ? puntosGuardados : 0;

    let pointsDisplay = document.getElementById('points-display');

    if (!pointsDisplay) {
        const pointsElement = document.createElement('div');
        pointsElement.className = 'points-counter';
        pointsElement.innerHTML = `
            <div class="points-icon">⭐</div>
            <div class="points-text">Puntos: <span id="points-display">${window.puntosGlobales}</span></div>
        `;
        navBar.appendChild(pointsElement);

        const style = document.createElement('style');
        style.textContent = `
            .points-counter {
                display: flex;
                align-items: center;
                background-color: rgba(76, 110, 245, 0.1);
                padding: 8px 15px;
                border-radius: 50px;
                margin-left: auto;
                margin-right: 20px;
            }
            .points-icon {
                font-size: 1.2rem;
                margin-right: 8px;
            }
            .points-text {
                font-weight: 600;
                color: var(--primary-color, #333);
            }
        `;
        document.head.appendChild(style);
    }

    // 👇 Esta línea es la magia
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

function actualizarRachaDiaria() {
    const ahora = new Date();
    const hoyStr = ahora.toDateString(); // e.g. "Mon May 27 2025"
    const ultimaFecha = localStorage.getItem("mateia_ultima_fecha_actividad");
    let rachaActual = parseInt(localStorage.getItem("mateia_racha_actual")) || 0;

    // Si ya registró racha hoy, no hacer nada
    if (ultimaFecha === hoyStr) return;

    // Ver si fue ayer
    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = ayer.toDateString();

    if (ultimaFecha === ayerStr) {
        rachaActual += 1;
    } else {
        rachaActual = 1;
    }

    // Guardar racha actualizada y fecha
    localStorage.setItem("mateia_racha_actual", rachaActual);
    localStorage.setItem("mateia_ultima_fecha_actividad", hoyStr);

    // Actualizar visualmente si estamos en la página de progreso
    const rachaSpan = document.getElementById("racha-actual");
    if (rachaSpan) rachaSpan.textContent = rachaActual;
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


function verificarInsignias() {
    const insignias = [
        {
            id: "insignia_racha",
            condicion: () => parseInt(localStorage.getItem("mateia_racha_actual")) >= 5,
            progreso: () => `${parseInt(localStorage.getItem("mateia_racha_actual")) || 0}/5 días`,
            recompensa: 100
        },
        {
            id: "insignia_estadistica",
            condicion: () => ["estadistica1", "estadistica2", "estadistica3"].every(id => localStorage.getItem(`reto-${id}-completado`) === "true"),
            progreso: () => {
                const completados = ["estadistica1", "estadistica2", "estadistica3"].filter(id => localStorage.getItem(`reto-${id}-completado`) === "true").length;
                return `${completados}/3`;
            },
            recompensa: 100
        },
        {
            id: "insignia_geometria",
            condicion: () => ["geometria1", "geometria2", "geometria3"].every(id => localStorage.getItem(`reto-${id}-completado`) === "true"),
            progreso: () => {
                const completados = ["geometria1", "geometria2", "geometria3"].filter(id => localStorage.getItem(`reto-${id}-completado`) === "true").length;
                return `${completados}/3`;
            },
            recompensa: 100
        },
        {
            id: "insignia_trigonometria",
            condicion: () => ["trigonometria1", "trigonometria2", "trigonometria3"].every(id => localStorage.getItem(`reto-${id}-completado`) === "true"),
            progreso: () => {
                const completados = ["trigonometria1", "trigonometria2", "trigonometria3"].filter(id => localStorage.getItem(`reto-${id}-completado`) === "true").length;
                return `${completados}/3`;
            },
            recompensa: 100
        },
        {
            id: "insignia_algebra",
            condicion: () => ["algebra1", "algebra2", "algebra3"].every(id => localStorage.getItem(`reto-${id}-completado`) === "true"),
            progreso: () => {
                const completados = ["algebra1", "algebra2", "algebra3"].filter(id => localStorage.getItem(`reto-${id}-completado`) === "true").length;
                return `${completados}/3`;
            },
            recompensa: 100
        },
        {
            id: "insignia_retoman",
            condicion: () => {
                let count = 0;
                for (let key in localStorage) {
                    if (key.startsWith("reto-") && key.endsWith("-completado") && localStorage.getItem(key) === "true") count++;
                }
                return count >= 12;
            },
            progreso: () => {
                let count = 0;
                for (let key in localStorage) {
                    if (key.startsWith("reto-") && key.endsWith("-completado") && localStorage.getItem(key) === "true") count++;
                }
                return `${Math.min(count, 12)}/12`;
            },
            recompensa: 100
        },
        {
            id: "insignia_ejercicios",
            condicion: () => parseInt(localStorage.getItem("mateia_ejercicios_completados")) >= 10,
            progreso: () => `${parseInt(localStorage.getItem("mateia_ejercicios_completados")) || 0}/10`,
            recompensa: 50
        },
        {
            id: "insignia_puntos",
            condicion: () => window.puntosGlobales >= 300,
            progreso: () => `${Math.min(window.puntosGlobales, 300)}/300`,
            recompensa: 200
        },
        {
            id: "insignia_completista",
            condicion: () => {
                let count = 0;
                for (let key in localStorage) {
                if (key.startsWith("reto-") && key.endsWith("-completado") && localStorage.getItem(key) === "true") count++;
                }
                return count >= 12;
            },
            progreso: () => {
                let count = 0;
                for (let key in localStorage) {
                if (key.startsWith("reto-") && key.endsWith("-completado") && localStorage.getItem(key) === "true") count++;
                }
                return `${count}/12 retos completados`;
            },
            recompensa: 150
            },
            {
            id: "insignia_maestro_final",
            condicion: () => {
                const nivel = parseInt(localStorage.getItem("mateia_nivel_actual")) || 1;
                return nivel === 5;
            },
            progreso: () => {
                const nivel = parseInt(localStorage.getItem("mateia_nivel_actual")) || 1;
                return `Nivel actual: ${nivel}/5`;
            },
            recompensa: 300
            }

    ];

    let ganadas = 0;

    insignias.forEach(ins => {
        const desbloqueada = localStorage.getItem(`${ins.id}_desbloqueada`) === "true";
        const cumple = ins.condicion();
        const bloque = document.getElementById(ins.id);

        if (bloque) {
            const progresoDiv = bloque.querySelector(".insignia-progreso");
            if (progresoDiv) progresoDiv.textContent = cumple ? `Obtenido: ${new Date().toLocaleDateString("es-MX", { day: '2-digit', month: 'short', year: 'numeric' })}` : `Progreso: ${ins.progreso()}`;
        }

        if (cumple && !desbloqueada) {
            localStorage.setItem(`${ins.id}_desbloqueada`, "true");
            actualizarPuntosGlobales(ins.recompensa);
            mostrarInsigniaNotificacion(ins.id, ins.recompensa);
        }

        // Siempre quitar clases si está desbloqueada
        if (localStorage.getItem(`${ins.id}_desbloqueada`) === "true") {
            ganadas++;
            bloque?.classList.remove("locked");
            bloque?.querySelector(".insignia-img")?.classList.remove("locked");
        }
    });

    const contador = document.getElementById("insignias-ganadas");
    if (contador) contador.textContent = `${ganadas}/10`;
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
function verificarNivel() {
    const puntos = window.puntosGlobales || 0;

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

    const nivelPrevio = parseInt(localStorage.getItem("mateia_nivel_actual")) || 1;
    if (nivelActual.nivel > nivelPrevio) {
        localStorage.setItem("mateia_nivel_actual", nivelActual.nivel);
        if (typeof mostrarNotificacionNivel === "function") {
            mostrarNotificacionNivel(nivelActual.nivel, nivelActual.nombre);
        }
    }
}


// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', addPointsDisplay);