// Configuración de la interfaz de usuario
function setupUI() {
    canvas.addEventListener('click', onCanvasClick); // Agrega un evento de clic al canvas

    // Configura el botón de pausa
    pauseButton.addEventListener('click', (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto
        e.stopPropagation(); // Detiene la propagación del evento
        if (currentGameState === GameState.PLAYING) {
            pauseGame();
        } else if (currentGameState === GameState.PAUSED) {
            resumeGame();
        }
    });

    // Configura el botón de mute
    muteButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Detiene la propagación del evento
        isMuted = !isMuted; // Alterna el estado de mute
        muteButton.textContent = isMuted ? 'Unmute' : 'Mute'; // Cambia el texto del botón
        if (isMuted) {
            stopMusic();
        } else {
            playMusic();
        }
    });
}

// Función actualizar la interfaz de usuario (HUD)
function updateHUD() {
    levelUI.textContent = currentLevel + 1; // Muestra el nivel actual
    highScoreUI.textContent = highScore; // Muestra la puntuación más alta
    timerUI.textContent = Math.ceil(timer); // Muestra el tiempo restante, redondeado hacia arriba
}

// Función redimensionar el canvas
function resizeCanvas() {
    canvas.width = window.innerWidth; // Establece el ancho del canvas al ancho de la ventana
    canvas.height = window.innerHeight; // Establece la altura del canvas a la altura de la ventana
    if (world) {
        if (ground) world.DestroyBody(ground); // Destruye el cuerpo del suelo si existe
        // Crea un nuevo suelo con las dimensiones del canvas
        ground = createBox(
            canvas.width / 2 / SCALE,
            (canvas.height - 10) / SCALE,
            canvas.width / SCALE,
            20 / SCALE,
            'static'
        );
    }
}

