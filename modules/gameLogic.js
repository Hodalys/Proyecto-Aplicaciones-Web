/**
 * GAMELOGIC.JS
 * Gestiona la lógica principal del juego, niveles y colisiones
 */

/**
 * Carga un nivel específico
 * @param {number} levelIndex - Índice del nivel a cargar
 */
function loadLevel(levelIndex) {
    // 1. Limpiar cuerpos existentes
    let body = world.GetBodyList();
    while (body) {
        const next = body.GetNext();
        world.DestroyBody(body);
        body = next;
    }

    const level = levels[levelIndex];
    timer = level.time;

    // 2. Recrear el suelo
    ground = createBox(
        canvas.width / 2 / SCALE,
        (canvas.height - 10) / SCALE,
        canvas.width / SCALE,
        20 / SCALE,
        'static'
    );
    ground.SetUserData({ type: 'ground' });

    // 3. Crear la catapulta
    catapult = createBox(5, 15, 0.5, 3, 'static');
    catapult.GetFixtureList().SetSensor(true);
    catapult.SetUserData({ type: 'catapult' });

    // 4. Reiniciar proyectiles
    projectiles = [1, 2, 3];
    currentProjectileIndex = 0;
    createNextProjectile();

    // 5. Crear cajas
    level.boxes.forEach(box => {
        const newBox = createBox(box.x, box.y, box.width, box.height, box.type);
        newBox.SetUserData({ type: 'box' });
    });

    // 6. Crear objetivo
    const targetBox = createBox(
        level.target.x,
        level.target.y,
        level.target.width,
        level.target.height,
        'dynamic'
    );
    targetBox.SetUserData({ type: 'target' });

    // 7. Configurar listener de colisiones
    setupContactListener();

    console.log("Level", levelIndex + 1, "loaded successfully.");
}

/**
 * Crea el siguiente proyectil
 */
function createNextProjectile() {
    if (currentProjectileIndex >= projectiles.length) {
        console.log("No quedan proyectiles");
        return;
    }

    const px = catapult.GetPosition().x - 1.5;
    const py = catapult.GetPosition().y - 2.5;
    projectile = createCircle(px, py, 0.7);
    projectile.SetUserData({ type: 'projectile' });
}

/**
 * Configura el listener de colisiones
 */
function setupContactListener() {
    const listener = new Box2D.Dynamics.b2ContactListener();
    listener.BeginContact = (contact) => {
        const fixtureA = contact.GetFixtureA();
        const fixtureB = contact.GetFixtureB();
        const bodyA = fixtureA.GetBody();
        const bodyB = fixtureB.GetBody();

        const userDataA = bodyA.GetUserData();
        const userDataB = bodyB.GetUserData();

        if (userDataA && userDataB) {
            // Proyectil golpea objetivo
            if ((userDataA.type === 'projectile' && userDataB.type === 'target') ||
                (userDataA.type === 'target' && userDataB.type === 'projectile')) {
                playSoundEffect('win');
                
                const targetBody = userDataA.type === 'target' ? bodyA : bodyB;
                if (targetBody) {
                    world.DestroyBody(targetBody);
                }
                
                // Esperar a que el sonido termine antes de cambiar de nivel
                setTimeout(() => {
                    levelComplete();
                }, 500);
            }
        }
    };
    world.SetContactListener(listener);
}

/**
 * Inicia el juego
 */
function startGame() {
    currentGameState = GameState.PLAYING;
    loadLevel(currentLevel);
    if (!isMuted) {
        playMusic();
    }
}

/**
 * Pausa el juego
 */
function pauseGame() {
    currentGameState = GameState.PAUSED;
    pauseButton.textContent = 'Resume';
}

/**
 * Reanuda el juego
 */
function resumeGame() {
    currentGameState = GameState.PLAYING;
    pauseButton.textContent = 'Pause';
}

/**
 * Termina el juego (Game Over)
 */
function gameOver() {
    currentGameState = GameState.GAME_OVER;
    playSoundEffect('lose');
    if (currentLevel > highScore) {
        highScore = currentLevel;
        localStorage.setItem('highScore', highScore);
    }
}

/**
 * Marca el nivel como completado
 */
function levelComplete() {
    currentGameState = GameState.LEVEL_COMPLETE;

    if (currentLevel + 1 > highScore) {
        highScore = currentLevel + 1;
        localStorage.setItem('highScore', highScore);
    }
}

/**
 * Maneja el clic en el canvas
 */
function onCanvasClick() {
    if (currentGameState === GameState.MENU) {
        startGame();
    } 
    else if (currentGameState === GameState.LEVEL_COMPLETE) {
        currentLevel++;
        if (currentLevel < levels.length) {
            loadLevel(currentLevel);
            currentGameState = GameState.PLAYING;
        } else {
            currentGameState = GameState.GAME_OVER;
        }
    } 
    else if (currentGameState === GameState.GAME_OVER) {
        window.location.reload();
    }
}
