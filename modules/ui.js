/**
 * UI.JS
 * Gestiona la interfaz de usuario y eventos de UI
 */

/**
 * Configura los event listeners de la UI
 */
function setupUI() {
    canvas.addEventListener('click', onCanvasClick);
    
    pauseButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentGameState === GameState.PLAYING) pauseGame();
        else if (currentGameState === GameState.PAUSED) resumeGame();
    });
    
    muteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        isMuted = !isMuted;
        muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
        if (isMuted) stopMusic();
        else playMusic();
    });
}

/**
 * Actualiza el HUD (Heads-Up Display)
 */
function updateHUD() {
    levelUI.textContent = currentLevel + 1;
    highScoreUI.textContent = highScore;
    timerUI.textContent = Math.ceil(timer);
}

/**
 * Redimensiona el canvas cuando la ventana cambia de tamaño
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (world) {
        if (ground) world.DestroyBody(ground);
        ground = createBox(
            canvas.width / 2 / SCALE,
            (canvas.height - 10) / SCALE,
            canvas.width / SCALE,
            20 / SCALE,
            'static'
        );
    }
}
