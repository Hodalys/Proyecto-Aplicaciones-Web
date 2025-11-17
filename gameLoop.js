// Función del bucle principal del juego
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp; // evita delta enorme
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    // Actualiza la lógica del juego y dibuja el estado actual en el canvas
    update(deltaTime);
    draw();
    // Solicita el siguiente frame para continuar el bucle
    requestAnimationFrame(gameLoop);
}

// Función actualizar el estado del juego
function update(deltaTime) {
    // Controla el comportamiento del juego según el estado actual
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
            break;
    }
    updateHUD(); // Actualiza la interfaz de usuario (HUD)
}

// Función dibujar en el canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Dibuja el fondo si la imagen está cargada
    if (images.background && images.background.complete) {
        ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // Si el mouse está presionado, dibuja la línea de tensión y la trayectoria del proyectil
    if (isMouseDown && mouseJoint && projectile) {
        drawTensionLine();
        drawTrajectory();
    }
    // Dibuja los cuerpos del mundo solo si el juego está en progreso
    if (currentGameState === GameState.PLAYING) {
        drawBodies();
    }
    // Dibuja la interfaz correspondiente según el estado actual del juego
    switch (currentGameState) {
        case GameState.MENU:
            drawMenu();
            break;
        case GameState.PAUSED:
            drawPaused();
            break;
        case GameState.GAME_OVER:
            drawGameOver();
            break;
        case GameState.LEVEL_COMPLETE:
            drawLevelComplete();
            break;
    }
}
