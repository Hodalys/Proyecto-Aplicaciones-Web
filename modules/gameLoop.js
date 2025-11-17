/**
 * GAMELOOP.JS
 * Gestiona el bucle principal del juego
 */

/**
 * Bucle principal del juego
 * @param {number} timestamp - Timestamp actual
 */
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

/**
 * Actualiza la lógica del juego
 * @param {number} deltaTime - Tiempo transcurrido desde el último frame
 */
function update(deltaTime) {
    switch (currentGameState) {
        case GameState.PLAYING:
            world.Step(deltaTime, 8, 3);
            world.ClearForces();
            timer -= deltaTime;
            if (timer <= 0) {
                timer = 0;
                gameOver();
            }
            break;
        case GameState.MENU:
        case GameState.PAUSED:
            break;
        case GameState.GAME_OVER:
        case GameState.LEVEL_COMPLETE:
            // No actualizar el mundo
            break;
    }
    updateHUD();
}
