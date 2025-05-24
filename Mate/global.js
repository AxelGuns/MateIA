// Sistema de Puntos Global Compartido

// Inicializar variable global desde localStorage
const puntosGuardados = parseInt(localStorage.getItem('mateia_puntos_globales'));
window.puntosGlobales = !isNaN(puntosGuardados) && puntosGuardados >= 0 ? puntosGuardados : 0;

// Función para actualizar puntos
function actualizarPuntosGlobales(delta) {
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

    console.log("📊 Puntos actualizados:", window.puntosGlobales);
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
    notificacion.style.position = 'fixed';
    notificacion.style.top = '20px';
    notificacion.style.right = '20px';
    notificacion.style.zIndex = '9999';
    notificacion.style.background = '#4caf50';
    notificacion.style.color = 'white';
    notificacion.style.padding = '10px 15px';
    notificacion.style.borderRadius = '20px';
    notificacion.style.fontSize = '18px';
    notificacion.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    notificacion.style.opacity = '0';
    notificacion.style.transition = 'all 0.5s ease';

    document.body.appendChild(notificacion);

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

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', addPointsDisplay);