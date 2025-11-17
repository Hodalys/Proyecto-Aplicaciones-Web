/**
 * INIT.JS
 * Inicializa el juego y carga todos los recursos
 */

/**
 * Inicializa el juego cuando la página carga
 */
window.onload = function() {
    try {
        // Inicializar Box2D primero
        if (!initBox2D()) {
            alert('Error: Box2D no se pudo cargar. Por favor, recarga la página.');
            return;
        }
        
        // Obtener referencias del DOM
        canvas = document.getElementById('gameCanvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        ctx = canvas.getContext('2d');
        levelUI = document.getElementById('level');
        highScoreUI = document.getElementById('high-score');
        pauseButton = document.getElementById('pause-button');
        muteButton = document.getElementById('mute-button');
        timerUI = document.getElementById('timer');

        // Cargar puntuación alta
        highScore = localStorage.getItem('highScore') || 0;
        highScoreUI.textContent = highScore;

        // Cargar recursos
        preloadImages(() => {
            preloadSounds(() => {
                setupUI();
                window.addEventListener('resize', resizeCanvas);

                // Crear mundo físico
                world = new b2World(GRAVITY, true);
                addEventListeners();

                // Iniciar juego
                currentGameState = GameState.MENU;
                requestAnimationFrame(gameLoop);
            });
        });
    } catch (e) {
        console.error('Error during initialization:', e);
        alert('An error occurred during game initialization. Please check the console for details.');
    }
};
