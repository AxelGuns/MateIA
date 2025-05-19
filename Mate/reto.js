// retos.js - Versión mejorada con todas las funcionalidades

// 1. Sistema de Gamificación y Progreso
const SistemaRetos = (() => {
    const STORAGE_KEY = 'mateIaUserData';
    let userData = {
        retosCompletados: 0,
        puntosTotales: 0,
        rachaActual: 0,
        insignias: [],
        progresoRetos: {},
        ultimoDiaJugado: null,
        retoDiarioCompletado: false
    };

    // Insignias disponibles
    const INSIGNIAS = {
        ALGEBRA_N1: { id: 'algebra1', nombre: 'Novato Algebraico', icono: '🧮' },
        VELOCIDAD: { id: 'velocidad', nombre: 'Velocidad Mental', icono: '⚡' },
        PERFECTO: { id: 'perfecto', nombre: 'Precisión Perfecta', icono: '🎯' },
        RACHA_7: { id: 'racha7', nombre: 'Racha de 7 días', icono: '🔥' },
        DIARIO_5: { id: 'diario5', nombre: 'Retos Diarios x5', icono: '📅' }
    };

    // Cargar datos del usuario
    const cargarDatos = () => {
        const datos = localStorage.getItem(STORAGE_KEY);
        if (datos) {
            Object.assign(userData, JSON.parse(datos));
            actualizarRacha();
        }
    };

    // Guardar datos
    const guardarDatos = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    };

    // Actualizar racha diaria
    const actualizarRacha = () => {
        const hoy = new Date().toDateString();
        if (userData.ultimoDiaJugado) {
            const diffDays = Math.floor((new Date(hoy) - new Date(userData.ultimoDiaJugado)) / (1000 * 3600 * 24));
            userData.rachaActual = diffDays === 1 ? userData.rachaActual + 1 : 0;
        }
        userData.ultimoDiaJugado = hoy;
    };

    // Otorgar insignia
    const otorgarInsignia = (insigniaId) => {
        if (!userData.insignias.includes(insigniaId)) {
            userData.insignias.push(insigniaId);
            mostrarNotificacionInsignia(insigniaId);
            return true;
        }
        return false;
    };

    // Notificación de insignia
    const mostrarNotificacionInsignia = (insigniaId) => {
        const insignia = INSIGNIAS[insigniaId];
        const notificacion = document.createElement('div');
        notificacion.className = 'insignia-notificacion animate__animated animate__bounceIn';
        notificacion.innerHTML = `
            <div class="insignia-icon">${insignia.icono}</div>
            <h3>¡Nueva Insignia!</h3>
            <p>${insignia.nombre}</p>
        `;
        document.body.appendChild(notificacion);
        setTimeout(() => notificacion.remove(), 5000);
    };

    return {
        userData,
        cargarDatos,
        guardarDatos,
        otorgarInsignia,
        INSIGNIAS
    };
})();

// 2. Controlador de Retos
const RetoController = (() => {
    let retoActual = null;
    let preguntaActual = 0;
    let tiempoRestante = 0;
    let timerInterval;
    let respuestasCorrectas = 0;

    // Iniciar reto
    const iniciarReto = (retoId) => {
        retoActual = retosData[retoId];
        preguntaActual = 0;
        respuestasCorrectas = 0;
        tiempoRestante = retoActual.tiempoLimite;
        
        actualizarTemporizador();
        mostrarPregunta();
        iniciarTemporizador();
        mostrarModal();
    };

    // Mostrar pregunta
    const mostrarPregunta = () => {
        const pregunta = retoActual.preguntas[preguntaActual];
        const opcionesContainer = document.getElementById('reto-opciones');
        
        document.getElementById('reto-pregunta-num').textContent = 
            `Pregunta ${preguntaActual + 1} de ${retoActual.totalPreguntas}`;
        document.getElementById('reto-problema').innerHTML = pregunta.texto;
        
        opcionesContainer.innerHTML = '';
        pregunta.opciones.forEach((opcion, index) => {
            const boton = document.createElement('button');
            boton.className = 'opcion-btn';
            boton.innerHTML = opcion;
            boton.dataset.correcto = index === pregunta.respuestaCorrecta;
            boton.addEventListener('click', manejarRespuesta);
            opcionesContainer.appendChild(boton);
        });
    };

    // Manejar respuesta
    const manejarRespuesta = (e) => {
        const botones = document.querySelectorAll('.opcion-btn');
        botones.forEach(boton => boton.disabled = true);
        
        const seleccionado = e.target;
        const esCorrecta = seleccionado.dataset.correcto === 'true';
        
        if (esCorrecta) {
            seleccionado.classList.add('correcta');
            respuestasCorrectas++;
        } else {
            seleccionado.classList.add('incorrecta');
            document.querySelector('[data-correcto="true"]').classList.add('correcta');
        }

        mostrarFeedback(esCorrecta);
        setTimeout(siguientePregunta, 1500);
    };

    // Siguiente pregunta
    const siguientePregunta = () => {
        preguntaActual++;
        if (preguntaActual < retoActual.totalPreguntas) {
            mostrarPregunta();
        } else {
            finalizarReto();
        }
    };

    // Finalizar reto
    const finalizarReto = () => {
        clearInterval(timerInterval);
        const tiempoUsado = retoActual.tiempoLimite - tiempoRestante;
        const porcentajeExito = (respuestasCorrectas / retoActual.totalPreguntas) * 100;
        
        // Calcular puntos
        let puntos = Math.round((porcentajeExito / 100) * retoActual.puntos);
        if (tiempoUsado < retoActual.tiempoLimite * 0.5) puntos *= 1.2;
        
        // Actualizar usuario
        SistemaRetos.userData.puntosTotales += puntos;
        SistemaRetos.userData.retosCompletados++;
        
        // Actualizar progreso
        if (!SistemaRetos.userData.progresoRetos[retoActual.id]) {
            SistemaRetos.userData.progresoRetos[retoActual.id] = {
                completado: false,
                mejorPuntuacion: 0
            };
        }
        
        if (porcentajeExito >= 80) {
            SistemaRetos.userData.progresoRetos[retoActual.id].completado = true;
        }
        
        // Mostrar resultados
        mostrarResultados(puntos, tiempoUsado);
        SistemaRetos.guardarDatos();
        actualizarUI();
    };

    // Temporizador
    const iniciarTemporizador = () => {
        timerInterval = setInterval(() => {
            tiempoRestante--;
            actualizarTemporizador();
            if (tiempoRestante <= 0) finalizarReto();
        }, 1000);
    };

    // Mostrar resultados
    const mostrarResultados = (puntos, tiempo) => {
        document.getElementById('reto-pregunta-container').style.display = 'none';
        document.getElementById('reto-resultados').style.display = 'block';
        
        document.getElementById('resultado-puntos').textContent = `${puntos} puntos`;
        document.getElementById('resultado-tiempo').textContent = 
            `${Math.floor(tiempo / 60)}:${String(tiempo % 60).padStart(2, '0')}`;
        document.getElementById('resultado-correctas').textContent = 
            `${respuestasCorrectas}/${retoActual.totalPreguntas}`;
        
        if (respuestasCorrectas === retoActual.totalPreguntas) {
            SistemaRetos.otorgarInsignia('PERFECTO');
        }
    };

    return { iniciarReto };
})();

// 3. Interfaz de Usuario
const UIController = (() => {
    // Actualizar estadísticas
    const actualizarEstadisticas = () => {
        document.getElementById('retos-completados').textContent = SistemaRetos.userData.retosCompletados;
        document.getElementById('puntos-totales').textContent = SistemaRetos.userData.puntosTotales;
        document.getElementById('racha-actual').textContent = SistemaRetos.userData.rachaActual;
        document.getElementById('insignias-ganadas').textContent = 
            `${SistemaRetos.userData.insignias.length}/${Object.keys(SistemaRetos.INSIGNIAS).length}`;
    };

    // Actualizar progreso retos
    const actualizarProgresoRetos = () => {
        document.querySelectorAll('.reto-card').forEach(card => {
            const retoId = card.dataset.id;
            const progreso = SistemaRetos.userData.progresoRetos[retoId] || { completado: false };
            const barra = card.querySelector('.progress-fill');
            
            if (progreso.completado) {
                barra.style.width = '100%';
                card.querySelector('.reto-btn').disabled = true;
            }
        });
    };

    // Actualizar insignias
    const actualizarInsignias = () => {
        document.querySelectorAll('.insignia').forEach(insignia => {
            const id = insignia.id.split('-')[1];
            if (SistemaRetos.userData.insignias.includes(id)) {
                insignia.querySelector('.insignia-img').classList.remove('locked');
            }
        });
    };

    return {
        actualizarEstadisticas,
        actualizarProgresoRetos,
        actualizarInsignias
    };
})();

// 4. Inicialización
document.addEventListener('DOMContentLoaded', () => {
    SistemaRetos.cargarDatos();
    UIController.actualizarEstadisticas();
    UIController.actualizarProgresoRetos();
    UIController.actualizarInsignias();

    // Event listeners
    document.querySelectorAll('.reto-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const retoId = e.target.closest('.reto-card').dataset.id;
            RetoController.iniciarReto(retoId);
        });
    });

    // Temporizador diario
    setInterval(() => {
        const ahora = new Date();
        const resetTime = new Date();
        resetTime.setHours(24, 0, 0, 0);
        const diff = resetTime - ahora;
        
        const horas = Math.floor(diff / 3600000);
        const minutos = Math.floor((diff % 3600000) / 60000);
        const segundos = Math.floor((diff % 60000) / 1000);
        
        document.getElementById('tiempo-reset').textContent = 
            `Se renueva en: ${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    }, 1000);
});