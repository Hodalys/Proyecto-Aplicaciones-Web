/**
 * RENDERING.JS
 * Gestiona todo lo relacionado con el renderizado del juego
 */

/**
 * Dibuja todos los cuerpos del mundo físico
 */
function drawBodies() {
    for (let body = world.GetBodyList(); body; body = body.GetNext()) {
        const position = body.GetPosition();
        const angle = body.GetAngle();
        const userData = body.GetUserData();

        if (userData && userData.type) {
            ctx.save();
            ctx.translate(position.x * SCALE, position.y * SCALE);
            ctx.rotate(angle);

            const fixture = body.GetFixtureList();
            const shape = fixture.GetShape();
            let width, height, radius;
            
            let img;
            switch (userData.type) {
                case 'projectile':
                    img = images.projectile;
                    radius = shape.GetRadius() * SCALE;
                    ctx.drawImage(img, -radius, -radius, radius * 2, radius * 2);
                    break;
                case 'box':
                    img = images.box;
                    width = shape.GetVertices()[1].x * SCALE * 2;
                    height = shape.GetVertices()[2].y * SCALE * 2;
                    ctx.drawImage(img, -width / 2, -height / 2, width, height);
                    break;
                case 'target':
                    img = images.target;
                    width = shape.GetVertices()[1].x * SCALE * 2;
                    height = shape.GetVertices()[2].y * SCALE * 2;
                    ctx.drawImage(img, -width / 2, -height / 2, width, height);
                    break;
            }
            ctx.restore();
        }
    }
    
    // Dibujar catapulta por separado (es estática)
    if (catapult && !isMouseDown) {
        const pos = catapult.GetPosition();
        ctx.save();
        ctx.translate(pos.x * SCALE, pos.y * SCALE);
        ctx.drawImage(images.catapult, -30, -50, 60, 100);
        ctx.restore();
    }
}

/**
 * Dibuja la línea de tensión de la catapulta
 */
function drawTensionLine() {
    if (!projectile || !catapult) return;

    const pPos = projectile.GetPosition();
    const cPos = catapult.GetPosition();
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cPos.x * SCALE, cPos.y * SCALE);
    ctx.lineTo(pPos.x * SCALE, pPos.y * SCALE);
    ctx.stroke();
}

/**
 * Dibuja la trayectoria predicha del proyectil
 */
function drawTrajectory() {
    if (!projectile || !catapult) return;

    const pPos = projectile.GetPosition();
    const cPos = catapult.GetPosition();
    
    const forceMultiplier = 25; 
    const velocityX = (cPos.x - pPos.x) * forceMultiplier / projectile.GetMass();
    const velocityY = (cPos.y - pPos.y) * forceMultiplier / projectile.GetMass();
    
    const x0 = pPos.x;
    const y0 = pPos.y;
    const numSteps = 80;
    const timeStep = 0.03;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const dotRadius = 4;

    for (let i = 1; i <= numSteps; i++) {
        const t = i * timeStep;
        const x = x0 + velocityX * t;
        const y = y0 + velocityY * t + 0.5 * GRAVITY.y * t * t; 

        ctx.beginPath();
        ctx.arc(x * SCALE, y * SCALE, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        if (y * SCALE > canvas.height) break;
    }
}

/**
 * Dibuja la pantalla del menú
 */
function drawMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Astro Mission', canvas.width / 2, canvas.height / 2 - 100); 
    ctx.font = '24px sans-serif';
    ctx.fillText('Haz clic para iniciar', canvas.width / 2, canvas.height / 2 + 50);
}

/**
 * Dibuja la pantalla de pausa
 */
function drawPaused() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pausado', canvas.width / 2, canvas.height / 2);
}

/**
 * Dibuja la pantalla de Game Over
 */
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Fin del Juego', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px sans-serif';
    ctx.fillText('Haz clic para reiniciar', canvas.width / 2, canvas.height / 2 + 50);
}

/**
 * Dibuja la pantalla de nivel completado
 */
function drawLevelComplete() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('¡Nivel Completado!', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px sans-serif';
    ctx.fillText('Haz clic para continuar', canvas.width / 2, canvas.height / 2 + 50);
}

/**
 * Dibuja el fondo del juego
 */
function drawBackground() {
    if (images.background && images.background.complete) {
        ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * Función principal de renderizado
 */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();

    if (isMouseDown && mouseJoint && projectile) {
        drawTensionLine();
        drawTrajectory();
    }

    // Solo dibujar cuerpos si el juego está en progreso
    if (currentGameState === GameState.PLAYING) {
        drawBodies();
    }

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
