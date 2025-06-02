import { db } from './firebase.js';
import { doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';
import { verificarSesion } from './auth.js';
import { actualizarPuntosGlobales, verificarInsignias, mostrarNotificacionPuntos, actualizarRachaDiaria, verificarNivel } from './global.js';

let uid = null;
let usuario = null;

verificarSesion(async (datos, id) => {
  uid = id;
  usuario = datos;
});



document.addEventListener('DOMContentLoaded', function() {
    console.log("🔎 Puntos globales al cargar ejercicios.js:", window.puntosGlobales);
    // Elementos del modal
    const ejercicioModal = document.getElementById('ejercicio-modal');
    const closeModalBtn = document.querySelector('.ejercicio-close');
    const ejercicioTitulo = document.getElementById('ejercicio-titulo');
    const ejercicioPregunta = document.getElementById('ejercicio-pregunta');
    const opcionesContainer = document.querySelector('.opciones-container');
    const loadingContainer = document.getElementById('loading-container');
    const ejercicioContenido = document.getElementById('ejercicio-contenido');

    //const btnAnterior = document.getElementById('ejercicio-anterior');
    const btnSiguiente = document.getElementById('ejercicio-siguiente');
    const btnFinalizar = document.getElementById('ejercicio-finalizar');
    const preguntaActualSpan = document.getElementById('pregunta-actual');
    const totalPreguntasSpan = document.getElementById('total-preguntas');
    const dificultadDots = document.querySelectorAll('.dificultad-dot');

    // Estado del ejercicio
    let ejercicios = [];
    let ejercicioActual = 0;
    let respuestasUsuario = [];
    let respuestasEvaluadas = [];

    let temaActual = '';
    let nivelActual = 1;



    // Función para simular la llamada a la IA
async function obtenerEjercicioDeIA(tema, nivel) {
    const apiKey = 'AIzaSyBdOh__0msjdRB0RfZdjRFtHcdy6kQ_ohQ';
    const selectedModel = "gemini-1.5-flash";

    // Prompt modificado para generar 5 ejercicios
    const prompt = `Genera 5 ejercicios de matemáticas para nivel 1 a 3 (elige uno random) sobre ${tema} con:
    - Formato JSON array con cada ejercicio conteniendo: 
      pregunta, opciones (array de 4), respuestaCorrecta (0-3), explicacion, dificultad (1-3)
    - Ejemplo de formato esperado:
    [{
        "pregunta": "Pregunta 1",
        "opciones": ["Op1", "Op2", "Op3", "Op4"],
        "respuestaCorrecta": 0,
        "explicacion": "Explicación 1",
        "dificultad": 2
    },
    {
        "pregunta": "Pregunta 2",
        "opciones": ["Op1", "Op2", "Op3", "Op4"],
        "respuestaCorrecta": 1,
        "explicacion": "Explicación 2",
        "dificultad": 1
    }]
    
    Devuelve SOLO el JSON válido, sin texto adicional.no hagas los ejericios tan faciles y tienen que ser de operaciones`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.9, // Aumentamos para mayor variedad
                    maxOutputTokens: 2000 // Más tokens para 5 ejercicios
                }
            })
        });

        if (response.ok) {
            const data = await response.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            
            // Extraer el JSON array
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("No se encontró JSON array en la respuesta");
            
            const ejercicios = JSON.parse(jsonMatch[0]);
            
            // Validar estructura de cada ejercicio
            if (!Array.isArray(ejercicios)) throw new Error("Se esperaba un array de ejercicios");
            ejercicios.forEach(ej => {
                if (!ej.pregunta || !ej.opciones || ej.respuestaCorrecta === undefined) {
                    throw new Error("Estructura de ejercicio inválida");
                }
            });
            
            return ejercicios.slice(0, 5); // Devuelve máximo 5 ejercicios
            
        } else {
            throw new Error("Error en la API");
        }
        
    } catch (error) {
        console.error('Error con Gemini:', error);
        // Datos de respaldo (5 ejercicios manuales)
        const ejerciciosBackup = {
            algebra: [
                {
                    pregunta: "Resuelve: 2x + 3 = 15",
                    opciones: ["x = 6", "x = 7", "x = 8", "x = 9"],
                    respuestaCorrecta: 0,
                    explicacion: "2x = 12 → x = 6",
                    dificultad: 1
                },
                {
                    pregunta: "Factoriza: x² - 9",
                    opciones: ["(x+3)(x-3)", "(x+9)(x-9)", "(x+3)²", "(x-3)²"],
                    respuestaCorrecta: 0,
                    explicacion: "Diferencia de cuadrados: a² - b² = (a+b)(a-b)",
                    dificultad: 2
                },
                // ... 3 ejercicios más de álgebra ...
            ],
            geometria: [
                // ... 5 ejercicios de geometría ...
            ]
        };
        return ejerciciosBackup[tema]?.slice(0, 5) || [];
    }
}

    // Función para iniciar un nuevo ejercicio
    async function iniciarEjercicio(tema, nivel) {
    // Resetear primero
    resetearModal();
    btnFinalizar.style.display = 'none'; // Asegura que siempre inicie oculto
    btnFinalizar.textContent = 'Finalizar'; // Restablece texto por si cambió
    temaActual = tema;
    nivelActual = nivel;
    ejercicioActual = 0;
    respuestasUsuario = [];
    respuestasEvaluadas = [];

    
    // Mostrar carga
    ejercicioModal.style.display = 'block';
    loadingContainer.style.display = 'block';
    ejercicioContenido.style.display = 'none';
    ejercicioTitulo.textContent = `Ejercicios de ${capitalizeFirstLetter(tema)} - Nivel ${nivel}`;
    
    // Resto de la función permanece igual...
    ejercicios = await obtenerEjercicioDeIA(tema, nivel);
    
    if (ejercicios.length === 0) {
        ejercicioPregunta.innerHTML = '<p>No se encontraron ejercicios para este tema/nivel.</p>';
        loadingContainer.style.display = 'none';
        ejercicioContenido.style.display = 'block';
        return;
    }
    
    totalPreguntasSpan.textContent = ejercicios.length;
    mostrarEjercicioActual();
}

    // Mostrar el ejercicio actual
function mostrarEjercicioActual() {
    const ejercicio = ejercicios[ejercicioActual];

    // Actualizar UI
    loadingContainer.style.display = 'none';
    ejercicioContenido.style.display = 'block';
    preguntaActualSpan.textContent = ejercicioActual + 1;

    // Configurar dificultad
    dificultadDots.forEach((dot, index) => {
        dot.classList.toggle('active', index < ejercicio.dificultad);
    });

    // Mostrar pregunta
    ejercicioPregunta.textContent = ejercicio.pregunta;

    // Mostrar opciones y resetear estado
    const opcionesItems = opcionesContainer.querySelectorAll('.opcion-item');
    opcionesItems.forEach((item, index) => {
        // Limpiar clases y estado
        item.classList.remove('seleccionada', 'correcta', 'incorrecta', 'bloqueada');

        // Actualizar texto de la opción
        item.querySelector('.opcion-texto').textContent = ejercicio.opciones[index];

        // Remover cualquier event listener previo
        item.removeEventListener('click', manejarClickOpcion);

        // Agregar nuevo event listener
        item.addEventListener('click', manejarClickOpcion);
    });

    // Resetear feedback


    // Configurar botones
    btnSiguiente.disabled = true;
    btnSiguiente.style.display = ejercicioActual < ejercicios.length - 1 ? 'block' : 'none';
    btnFinalizar.style.display = ejercicioActual === ejercicios.length - 1 ? 'block' : 'none';
}

    // Seleccionar una opción
    function seleccionarOpcion(opcionIndex) {
    const ejercicio = ejercicios[ejercicioActual];
    const opcionesItems = opcionesContainer.querySelectorAll('.opcion-item');

    // Guardar respuesta
    respuestasUsuario[ejercicioActual] = opcionIndex;

    // Limpiar clases y bloquear opciones
    opcionesItems.forEach(item => {
        item.removeEventListener('click', manejarClickOpcion);
        item.classList.remove('seleccionada', 'correcta', 'incorrecta');
        item.classList.add('bloqueada');
    });

    // Marcar la opción seleccionada
    opcionesItems[opcionIndex].classList.add('seleccionada');

    // Llamar feedback
    const esCorrecta = opcionIndex === ejercicio.respuestaCorrecta;
    if (!respuestasEvaluadas[ejercicioActual]) {
    mostrarFeedback(esCorrecta);
    respuestasEvaluadas[ejercicioActual] = true;
}


    // Habilitar botón siguiente
    btnSiguiente.disabled = false;
}
// Función manejadora de clicks (mejor práctica)
function manejarClickOpcion(e) {
    const opcionItem = e.currentTarget;
    if (!opcionItem.classList.contains('bloqueada')) {
        seleccionarOpcion(parseInt(opcionItem.dataset.index));
    }
}
    

    // Mostrar retroalimentación
// Mostrar retroalimentación
async function mostrarFeedback(esCorrecta) {
  const ejercicio = ejercicios[ejercicioActual];
  const opcionesItems = opcionesContainer.querySelectorAll('.opcion-item');
  const respuesta = respuestasUsuario[ejercicioActual];

  // Mostrar solo los colores visuales
  if (respuesta !== undefined && opcionesItems[respuesta]) {
    if (esCorrecta) {
      opcionesItems[respuesta].classList.add('correcta');
    } else {
      opcionesItems[respuesta].classList.add('incorrecta');
    }
  }

  if (!esCorrecta && ejercicio.respuestaCorrecta !== undefined) {
    opcionesItems[ejercicio.respuestaCorrecta]?.classList.add('correcta');
  }

  if (esCorrecta) {
    const hoyISO = new Date().toISOString().split('T')[0];
    const hoyTexto = new Date().toDateString();
    const ref = doc(db, 'usuarios', uid);
    const snap = await getDoc(ref);
    const datosActualizados = snap.data();
    usuario = datosActualizados;

    const debeActualizarRacha = !datosActualizados.ultimaActividad || datosActualizados.ultimaActividad !== hoyISO;
    const nuevosPuntos = (datosActualizados.puntos || 0) + 10;

    await updateDoc(ref, {
      puntos: nuevosPuntos,
      [`progresoTemas.${temaActual}`]: (datosActualizados.progresoTemas?.[temaActual] || 0) + 10,
      ejerciciosCompletados: (datosActualizados.ejerciciosCompletados || 0) + 1,
      [`graficaDiaria.${hoyISO}`]: (datosActualizados.graficaDiaria?.[hoyISO] || 0) + 1,
      ultimaActividad: hoyISO,
      fechaUltimoReto: hoyTexto
    });

    await new Promise(resolve => setTimeout(resolve, 300));
    const nuevaRacha = await actualizarRachaDiaria();

    usuario.ejerciciosCompletados = (usuario.ejerciciosCompletados || 0) + 1;
    usuario.progresoTemas = {
      ...usuario.progresoTemas,
      [temaActual]: (usuario.progresoTemas?.[temaActual] || 0) + 10
    };
    usuario.graficaDiaria = {
      ...usuario.graficaDiaria,
      [hoyISO]: (usuario.graficaDiaria?.[hoyISO] || 0) + 1
    };
    if (debeActualizarRacha) usuario.ultimaActividad = hoyISO;

    // ✅ Actualizar contador visual
    window.puntosGlobales = nuevosPuntos;
    const display = document.getElementById('points-display');
    if (display) display.textContent = nuevosPuntos;

    verificarNivel();
    if (debeActualizarRacha) await actualizarRachaDiaria();
    verificarInsignias();
    mostrarNotificacionPuntos(10);
  }
}





    // Navegar entre ejercicios
    function navegarEjercicio(direccion) {
        const nuevoEjercicio = ejercicioActual + direccion;
        if (nuevoEjercicio < 0 || nuevoEjercicio >= ejercicios.length) return;
        
        ejercicioActual = nuevoEjercicio;
        mostrarEjercicioActual();
    }

let reiniciarModo = false;
btnFinalizar.addEventListener('click', function() {
    if (reiniciarModo) {
        // Modo reinicio - Volver a empezar
        ejercicioActual = 0;
        respuestasUsuario = [];
        respuestasEvaluadas = [];

        reiniciarModo = false;

        // Restablecer completamente la UI
        opcionesContainer.style.display = 'grid';
        ejercicioPregunta.textContent = ''; // Usar textContent en lugar de innerHTML

        btnFinalizar.textContent = 'Finalizar';
        
        // Restaurar estado inicial de los botones
        btnSiguiente.style.display = 'block';
        btnSiguiente.disabled = true;
        btnFinalizar.style.display = 'none';
        btnAnterior.disabled = true;

        // Limpiar selecciones de opciones
        const opcionesItems = opcionesContainer.querySelectorAll('.opcion-item');
        opcionesItems.forEach(item => {
            item.classList.remove('seleccionada', 'correcta', 'incorrecta');
        });

        // Mostrar el primer ejercicio nuevamente
        mostrarEjercicioActual();
    } else {
        // Modo normal - Finalizar ejercicios
        finalizarEjercicios();
    }
});


    // Finalizar sesión
 function finalizarEjercicios() {
    const correctas = respuestasUsuario.reduce((total, respuesta, index) => {
        return total + (respuesta === ejercicios[index].respuestaCorrecta ? 1 : 0);
    }, 0);

    const porcentaje = Math.round((correctas / ejercicios.length) * 100);

    // Mostrar resultados
    ejercicioPregunta.innerHTML = `
        <h3>Resultados del ejercicio</h3>
        <p>Has completado ${ejercicios.length} preguntas:</p>
        <div class="resultado-bar">
            <div class="resultado-progreso" style="width: ${porcentaje}%"></div>
        </div>
        <p>${correctas} de ${ejercicios.length} correctas (${porcentaje}%)</p>
    `;



    // Cambiar el botón finalizar a "volver a empezar"
   // Cambiar el botón finalizar a "Finalizar" que cierra el modal
    btnFinalizar.textContent = 'Finalizar';
    reiniciarModo = false;

    // Asegurar que el botón esté visible y funcional
    btnFinalizar.style.display = 'block';

   btnFinalizar.onclick = () => {
    ejercicioModal.style.display = "none";
    resetearModal();
};

}

function resetearModal() {
    loadingContainer.style.display = 'none';
    ejercicioContenido.style.display = 'none';
    opcionesContainer.style.display = 'grid';
   
    btnSiguiente.style.display = 'block';
    btnSiguiente.disabled = true;
    btnFinalizar.style.display = 'none';
    reiniciarModo = false;
    
    // Limpiar selecciones de opciones
    const opcionesItems = opcionesContainer.querySelectorAll('.opcion-item');
    opcionesItems.forEach(item => {
        item.classList.remove('seleccionada', 'correcta', 'incorrecta');
    });
}


    // Helper para capitalizar
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Event listeners
    closeModalBtn.addEventListener('click', () => {
        ejercicioModal.style.display = 'none';
    });

    //btnAnterior.addEventListener('click', () => navegarEjercicio(-1));
    btnSiguiente.addEventListener('click', () => navegarEjercicio(1));
   

    // Cerrar modal al hacer clic fuera
    ejercicioModal.addEventListener('click', (e) => {
    if (e.target === ejercicioModal) {
        ejercicioModal.style.display = 'none';
        resetearModal();
    }
});

 

    // ===== CONEXIÓN CON LOS BOTONES "PRACTICAR" =====
    
    // 1. Para los botones en las tarjetas grandes
    document.querySelectorAll('.ejercicio-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tema = this.closest('.ejercicio-card').dataset.tema;
            iniciarEjercicio(tema, 1); // Nivel 1 por defecto
        });
    });
    
    // 2. Para los botones "Iniciar" en la lista de ejercicios
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('ejercicio-iniciar')) {
            const tema = document.getElementById('tema-select').value;
            const nivel = parseInt(document.querySelector('.nivel-btn.active').dataset.nivel);
            iniciarEjercicio(tema, nivel);
        }
    });
    
    // 3. Para los botones "Continuar" en ejercicios recientes
    document.querySelectorAll('.reciente-card .btn-primary').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const tema = this.closest('.reciente-card').querySelector('.reciente-tema').textContent.toLowerCase();
            iniciarEjercicio(tema, 1); // Nivel 1 por defecto
        });
    });
    
    // 4. Para el botón "Empezar ahora" en recomendados
    document.querySelector('.recomendado-card .btn-primary').addEventListener('click', function(e) {
        e.preventDefault();
        const tema = this.closest('.recomendado-card').querySelector('.recomendado-tema').textContent.toLowerCase();
        const nivel = parseInt(this.closest('.recomendado-card').querySelector('.recomendado-level').textContent.split(' ')[1]);
        iniciarEjercicio(tema, nivel);
    });
    verificarInsignias();
});
