// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // ========= NAVEGACIÓN MÓVIL =========
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenuBtn = document.querySelector('.close-menu');

    // Abrir menú móvil
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.add('active');
        });
    }

    // Cerrar menú móvil
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    }

    // Cerrar al hacer clic fuera del menú
    document.addEventListener('click', function(event) {
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(event.target) && 
            event.target !== mobileMenuBtn) {
            mobileMenu.classList.remove('active');
        }
    });

    // ========= PESTAÑAS DE EJERCICIOS =========
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Quitar clase 'active' de todos los botones
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir clase 'active' al botón actual
            this.classList.add('active');
            
            // Aquí se cargarían los ejercicios correspondientes
            loadExercises(this.textContent.trim());
        });
    });

    // ========= PESTAÑAS DE TABLA DE CLASIFICACIÓN =========
    const leaderboardTabs = document.querySelectorAll('.leaderboard-tab');
    
    leaderboardTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Quitar clase 'active' de todas las pestañas
            leaderboardTabs.forEach(t => t.classList.remove('active'));
            
            // Añadir clase 'active' a la pestaña actual
            this.classList.add('active');
            
            // Cargar los datos de la tabla correspondiente
            loadLeaderboardData(this.textContent.trim());
        });
    });

    // ========= SISTEMA DE PUNTOS =========
    let userPoints = 0;
    let currentQuestionNumber = 3; // Empezamos en la pregunta 3 (como en el HTML)
    let totalQuestions = 10;

    // Función para actualizar puntos
    function updatePoints(points) {
        userPoints += points;
        
        // Si tenemos un elemento para mostrar los puntos, actualizarlo
        const pointsDisplay = document.getElementById('points-display');
        if (pointsDisplay) {
            pointsDisplay.textContent = userPoints;
        }
        
        // Almacenar en localStorage para mantener entre sesiones
        localStorage.setItem('mateia_points', userPoints);
        
        // Verificar logros basados en puntos
        checkAchievementsBasedOnPoints(userPoints);
    }
    
    // Función para ir a la siguiente pregunta
    function goToNextQuestion() {
        currentQuestionNumber++;
        if (currentQuestionNumber > totalQuestions) {
            currentQuestionNumber = 1; // Reiniciar si llegamos al final
        }
        
        // Actualizar indicador de pregunta
        const questionIndicator = document.querySelector('.exercise-header div:last-child');
        if (questionIndicator) {
            questionIndicator.textContent = `Pregunta ${currentQuestionNumber}/${totalQuestions}`;
        }
        
        // Obtener tema actual seleccionado
        const activeTabBtn = document.querySelector('.tab-btn.active');
        const currentTopic = activeTabBtn ? activeTabBtn.textContent.trim() : 'Álgebra';
        
        // Cargar nuevo ejercicio
        loadExercises(currentTopic);
    }
    
    // Verificar logros basados en puntos
    function checkAchievementsBasedOnPoints(points) {
        // Ejemplo de lógica para otorgar logros:
        if (points >= 100 && !localStorage.getItem('achievement_100_points')) {
            // Guardar que ya se obtuvo este logro
            localStorage.setItem('achievement_100_points', 'true');
            
            // Mostrar notificación de logro
            showAchievementNotification('¡Has obtenido 100 puntos! 🎉');
        }
        
        if (points >= 500 && !localStorage.getItem('achievement_500_points')) {
            localStorage.setItem('achievement_500_points', 'true');
            showAchievementNotification('¡Has superado los 500 puntos! 🏆');
        }
    }
    
    // Mostrar notificación de logro
    function showAchievementNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-icon">🏆</div>
            <div class="achievement-notification-text">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.add('active');
        }, 50);
        
        // Remover después de un tiempo
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 4000);
    }

    // ========= SISTEMA DE LOGROS =========
    // Función para abrir modal de logros
    window.openAchievementModal = function(achievementId) {
        // Datos de ejemplo para los logros
        const achievementData = {
            'algebra-master': {
                title: 'Maestro del Álgebra',
                description: 'Has completado todas las lecciones de álgebra.',
                reward: '500 puntos y medalla dorada',
                progress: '75% completado',
                tips: 'Completa los desafíos avanzados para conseguir este logro más rápido.'
            },
            'perfect-score': {
                title: 'Puntaje Perfecto',
                description: 'Obtén 100% en 5 pruebas seguidas.',
                reward: '300 puntos y nueva insignia',
                progress: '3/5 pruebas perfectas',
                tips: 'Revisa bien tus respuestas antes de enviarlas.'
            },
            'speed-solver': {
                title: 'Solucionador Veloz',
                description: 'Resuelve 20 problemas en menos de 10 minutos.',
                reward: '250 puntos y acceso a ejercicios cronometrados',
                progress: '12/20 problemas resueltos',
                tips: 'Practica con ejercicios de velocidad en la sección de Retos.'
            },
            'streak-master': {
                title: 'Racha de 30 días',
                description: 'Practica matemáticas durante 30 días seguidos.',
                reward: '400 puntos y multiplicador de experiencia x2',
                progress: '14/30 días',
                tips: 'Haz al menos un ejercicio cada día para mantener tu racha.'
            }
        };

        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'achievement-modal';
        
        const achievement = achievementData[achievementId];
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="achievement-modal-header">
                    <div class="achievement-icon large">${getAchievementIcon(achievementId)}</div>
                    <h2>${achievement.title}</h2>
                </div>
                <div class="achievement-modal-body">
                    <p><strong>Descripción:</strong> ${achievement.description}</p>
                    <p><strong>Recompensa:</strong> ${achievement.reward}</p>
                    <p><strong>Progreso actual:</strong> ${achievement.progress}</p>
                    <p><strong>Consejos:</strong> ${achievement.tips}</p>
                </div>
                <div class="modal-actions">
                    <a class="btn btn-primary" href="ejercicios.html">¡Vamos por él!</a>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animar la entrada del modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 50);
        
        // Cerrar modal
            closeModalBtn.addEventListener('click', () => {
        ejercicioModal.style.display = 'none';
        // Restablecer el contenido del modal
        resetearModal();
            }); 

        // Cerrar con clic fuera del contenido
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            }
        });
    };

    function getAchievementIcon(achievementId) {
        const icons = {
            'algebra-master': '🏆',
            'perfect-score': '🌟',
            'speed-solver': '⚡',
            'streak-master': '🔥'
        };
        return icons[achievementId] || '🎯';
    }

    // ========= SISTEMA DE RESPUESTAS =========
    window.checkAnswer = function(button, isCorrect) {
        // Remover clases previas
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(opt => {
            opt.classList.remove('correct', 'incorrect');
            opt.disabled = true;
        });
        
        // Añadir clase correspondiente
        if (isCorrect) {
            button.classList.add('correct');
            showFeedback('¡Respuesta correcta! 🎉', true);
            
            // Sumar puntos - Simulación
            updatePoints(10);
            
            // Actualizar pregunta después de 2 segundos
            setTimeout(() => {
                goToNextQuestion();
            }, 2000);
        } else {
            button.classList.add('incorrect');
            
            // Mostrar la respuesta correcta
            allOptions.forEach(opt => {
                if (opt.onclick.toString().includes('true')) {
                    opt.classList.add('correct');
                }
            });
            
            showFeedback('¡Respuesta incorrecta! Inténtalo de nuevo.', false);
            
            // Restar puntos - Simulación
            updatePoints(-2);
        }
        
        // Re-habilitar botones después de 3 segundos
        setTimeout(() => {
            allOptions.forEach(opt => {
                opt.disabled = false;
                opt.classList.remove('correct', 'incorrect');
            });
        }, 3000);
    };

    function showFeedback(message, isCorrect) {
        // Crear elemento de retroalimentación
        const feedback = document.createElement('div');
        feedback.className = `feedback ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`;
        feedback.textContent = message;
        
        // Añadir al contenedor de ejercicios
        const exerciseContent = document.querySelector('.exercise-content');
        exerciseContent.appendChild(feedback);
        
        // Animar entrada
        setTimeout(() => {
            feedback.classList.add('active');
        }, 50);
        
        // Eliminar después de un tiempo
        setTimeout(() => {
            feedback.classList.remove('active');
            setTimeout(() => {
                exerciseContent.removeChild(feedback);
            }, 300);
        }, 2500);
    }
    const apiKey = 'AIzaSyBdOh__0msjdRB0RfZdjRFtHcdy6kQ_ohQ';
    // ========= CARGA DE EJERCICIOS =========
    async function loadExercises(topic) {
        // Mostrar estado de carga
        const exerciseProblem = document.querySelector('.exercise-problem');
        if (exerciseProblem) {
            exerciseProblem.textContent = "Generando ejercicio...";
        }
        
        // Configurar el prompt para la IA
        const prompt = `Genera un ejercicio de matemáticas para tercero de secundaria sobre ${topic} con las siguientes características:
        - Formato JSON con: question, options (array de 4 opciones), correctIndex (0-3), difficulty (1-3)
        - Dificultad adecuada para tercero de secundaria
        - Pregunta clara y concisa
        - Opciones de respuesta plausibles pero solo una correcta
        - Ejemplo de formato esperado:
        {
            "question": "Pregunta de ejemplo",
            "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
            "correctIndex": 0,
            "difficulty": 2
        }
        
        Devuelve SOLO el JSON, sin texto adicional.`;
        console.log("Prompt enviado a la IA:", prompt); 
        try {
            const selectedModel = "gemini-1.5-flash"; // Usamos el modelo Pro para mejor razonamiento
            
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
                        temperature: 0.7,
                        maxOutputTokens: 800
                    }
                })
            });
    
            if (response.ok) {
                const data = await response.json();
                const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                
                // Intentar extraer el JSON de la respuesta
                let jsonResponse;
                try {
                    // Buscar el JSON dentro del texto de respuesta (la IA podría añadir texto adicional)
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        jsonResponse = JSON.parse(jsonMatch[0]);
                        console.log("JSON parseado:", jsonResponse);
                    } else {
                        throw new Error("No se encontró formato JSON en la respuesta");
                    }
                } catch (e) {
                    console.error("Error al parsear JSON:", e);
                    throw new Error("La IA no devolvió un formato válido");
                }
    
                // Verificar que el ejercicio tenga la estructura correcta
                if (!jsonResponse.question || !jsonResponse.options || jsonResponse.correctIndex === undefined || !jsonResponse.difficulty) {
                    throw new Error("La estructura del ejercicio no es válida");
                }
    
                // Mostrar el ejercicio generado
                updateExerciseUI(jsonResponse);
                
            } else {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                showError("Error al generar el ejercicio. Intenta de nuevo.");
            }
        } catch (error) {
            console.error('Error:', error);
            showError("Ocurrió un error al comunicarse con la IA. Por favor, intenta de nuevo.");
        }
    }
    
    function updateExerciseUI(exercise) {
        const exerciseProblem = document.querySelector('.exercise-problem');
        const optionsGrid = document.querySelector('.options-grid');
        const difficultyDots = document.querySelectorAll('.difficulty-dot');
        
        if (exerciseProblem && optionsGrid) {
            // Actualizar pregunta
            exerciseProblem.textContent = exercise.question;
            
            // Actualizar opciones
            optionsGrid.innerHTML = '';
            exercise.options.forEach((option, index) => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = option;
                btn.onclick = function() { checkAnswer(this, index === exercise.correctIndex); };
                optionsGrid.appendChild(btn);
            });
            
            // Actualizar dificultad
            if (difficultyDots) {
                difficultyDots.forEach((dot, index) => {
                    if (index < exercise.difficulty) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        }
    }
    
    function showError(message) {
        const exerciseProblem = document.querySelector('.exercise-problem');
        if (exerciseProblem) {
            exerciseProblem.textContent = message;
        }
        
        const optionsGrid = document.querySelector('.options-grid');
        if (optionsGrid) {
            optionsGrid.innerHTML = '<button onclick="location.reload()">Reintentar</button>';
        }
    }

    // ========= CARGA DE DATOS DE TABLA DE CLASIFICACIÓN =========
    function loadLeaderboardData(timeframe) {
        // Datos de ejemplo para diferentes períodos
        const leaderboardData = {
            'Semanal': [
                { rank: 1, name: 'Ana G.', points: 875, level: 12 },
                { rank: 2, name: 'Pablo M.', points: 750, level: 10 },
                { rank: 3, name: 'Carlos R.', points: 720, level: 9 },
                { rank: 4, name: 'Tú', points: 690, level: 8, isCurrentUser: true },
                { rank: 5, name: 'Elena F.', points: 650, level: 8 }
            ],
            'Mensual': [
                { rank: 1, name: 'Sofia L.', points: 3250, level: 17 },
                { rank: 2, name: 'Miguel A.', points: 2980, level: 16 },
                { rank: 3, name: 'Ana G.', points: 2700, level: 15 },
                { rank: 4, name: 'Daniel N.', points: 2500, level: 14 },
                { rank: 5, name: 'Tú', points: 2350, level: 13, isCurrentUser: true }
            ],
            'De Todos los Tiempos': [
                { rank: 1, name: 'Roberto K.', points: 15240, level: 35 },
                { rank: 2, name: 'Luisa H.', points: 14500, level: 32 },
                { rank: 3, name: 'Pablo R.', points: 13820, level: 30 },
                { rank: 4, name: 'Carmen S.', points: 12750, level: 28 },
                { rank: 5, name: 'Diego M.', points: 11980, level: 25 },
                { rank: 12, name: 'Tú', points: 7650, level: 18, isCurrentUser: true }
            ]
        };

        const leaderboardCard = document.querySelector('.leaderboard-card');
        
        // Si existe el contenedor de leaderboard
        if (leaderboardCard) {
            // Mantener el encabezado
            const header = leaderboardCard.querySelector('.leaderboard-header');
            leaderboardCard.innerHTML = '';
            
            // Volver a añadir el encabezado
            if (header) {
                leaderboardCard.appendChild(header);
            }
            
            // Añadir filas con datos
            const data = leaderboardData[timeframe] || leaderboardData['Semanal'];
            data.forEach(entry => {
                const row = document.createElement('div');
                row.className = `leaderboard-row ${entry.isCurrentUser ? 'current-user' : ''}`;
                
                row.innerHTML = `
                    <div>${entry.rank}</div>
                    <div>${entry.name}</div>
                    <div>${entry.points}</div>
                    <div>${entry.level}</div>
                `;
                
                leaderboardCard.appendChild(row);
            });
        }
    }

    // ========= SISTEMA DE PERFIL Y PROGRESO =========
    // Cargar puntos guardados
    function loadSavedUserData() {
        // Cargar puntos si existen
        const savedPoints = localStorage.getItem('mateia_points');
        if (savedPoints) {
            userPoints = parseInt(savedPoints);
            
            // Actualizar UI
            const pointsDisplay = document.getElementById('points-display');
            if (pointsDisplay) {
                pointsDisplay.textContent = userPoints;
            }
        }
        
        // Cargar último tema visitado
        const lastTopic = localStorage.getItem('mateia_last_topic');
        if (lastTopic) {
            // Activar la pestaña correspondiente
            const tabButtons = document.querySelectorAll('.tab-btn');
            tabButtons.forEach(btn => {
                if (btn.textContent.trim() === lastTopic) {
                    btn.click();
                }
            });
        }
        
        // Cargar datos de progreso de temas
        const topicsProgress = JSON.parse(localStorage.getItem('mateia_topics_progress')) || {
            'Álgebra': 75,
            'Geometría': 40,
            'Estadística': 20,
            'Trigonometría': 0
        };
        
        // Actualizar barras de progreso
        updateTopicsProgress(topicsProgress);
    }
    
    // Actualizar barras de progreso de temas
    function updateTopicsProgress(progressData) {
        const progressBars = document.querySelectorAll('.progress-bar');
        const statsContainers = document.querySelectorAll('.topic-content .stats span:first-child');
        
        progressBars.forEach((bar, index) => {
            const topicName = bar.closest('.topic-card').querySelector('h3').textContent;
            const progress = progressData[topicName] || 0;
            
            bar.style.width = progress + '%';
            
            if (statsContainers[index]) {
                statsContainers[index].textContent = progress + '% Completado';
            }
        });
    }
    
    // Añadir header con puntos al DOM
    function addPointsDisplay() {
        // Verificar si el header de puntos ya existe
        if (document.getElementById('points-display')) return;
        
        const navBar = document.querySelector('nav');
        if (navBar) {
            const pointsElement = document.createElement('div');
            pointsElement.className = 'points-counter';
            pointsElement.innerHTML = `
                <div class="points-icon">⭐</div>
                <div class="points-text">Puntos: <span id="points-display">${userPoints}</span></div>
            `;
            
            navBar.appendChild(pointsElement);
            
            // Añadir estilo para el contador de puntos
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
                    color: var(--primary-color);
                }
                .achievement-notification {
                    position: fixed;
                    top: 20px;
                    right: -300px;
                    background-color: var(--primary-color);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    transition: right 0.5s ease;
                    z-index: 1000;
                }
                .achievement-notification.active {
                    right: 20px;
                }
                .achievement-notification-icon {
                    font-size: 1.5rem;
                    margin-right: 15px;
                }
                .achievement-notification-text {
                    font-weight: 500;
                }
                @media (max-width: 768px) {
                    .points-counter {
                        margin-right: 10px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ========= INICIALIZACIÓN =========
    // Añadir display de puntos
    addPointsDisplay();
    
    // Cargar ejercicios iniciales
    loadExercises('Álgebra');
    
    // Cargar datos iniciales de leaderboard
    loadLeaderboardData('Semanal');
    
    // Cargar datos guardados del usuario
    loadSavedUserData();
    
    // Simulación de progreso dinámico
    simulateProgress();
    
    // Configurar botones de navegación de ejercicios
    const prevButton = document.querySelector('.exercise-actions .btn:first-child');
    const nextButton = document.querySelector('.exercise-actions .btn-primary');
    
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            currentQuestionNumber--;
            if (currentQuestionNumber < 1) {
                currentQuestionNumber = totalQuestions;
            }
            
            // Actualizar indicador de pregunta
            const questionIndicator = document.querySelector('.exercise-header div:last-child');
            if (questionIndicator) {
                questionIndicator.textContent = `Pregunta ${currentQuestionNumber}/${totalQuestions}`;
            }
            
            // Cargar ejercicio previo
            const activeTabBtn = document.querySelector('.tab-btn.active');
            const currentTopic = activeTabBtn ? activeTabBtn.textContent.trim() : 'Álgebra';
            loadExercises(currentTopic);
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            goToNextQuestion();
        });
    }
});

// Simulación de progreso y actividad dinámica
function simulateProgress() {
    // Actualizar progreso visual de vez en cuando
    setInterval(() => {
        // Seleccionar una barra de progreso aleatoria
        const progressBars = document.querySelectorAll('.progress-bar');
        const randomBar = progressBars[Math.floor(Math.random() * progressBars.length)];
        
        if (randomBar) {
            // Obtener porcentaje actual
            let currentWidth = parseInt(randomBar.style.width);
            if (isNaN(currentWidth)) currentWidth = 0;
            
            // Aumentar ligeramente
            if (currentWidth < 100) {
                const newWidth = Math.min(currentWidth + Math.floor(Math.random() * 5) + 1, 100);
                randomBar.style.width = newWidth + '%';
                
                // Actualizar texto de porcentaje
                const statsContainer = randomBar.closest('.topic-content').querySelector('.stats span:first-child');
                if (statsContainer) {
                    statsContainer.textContent = newWidth + '% Completado';
                }
            }
        }
    }, 30000); // Cada 30 segundos
}