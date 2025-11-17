// Box2D Aliases - Se inicializarán cuando Box2D esté disponible
let b2World, b2Vec2, b2BodyDef, b2Body, b2FixtureDef, b2PolygonShape, b2CircleShape, b2MouseJointDef, b2DistanceJointDef;
let b2DebugDraw;

// Game Constants
const SCALE = 30; // 30 pixels = 1 meter
let GRAVITY; // Se inicializará después de que Box2D esté disponible

// Game State
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game-over',
    LEVEL_COMPLETE: 'level-complete'
};
let currentGameState = GameState.MENU;

// Game Variables
let canvas, ctx;
let world;
let debugDraw;
let lastTime = 0;
let isMouseDown = false;
let mouseJoint = null;
let projectile = null;
let slingJoint = null;
let catapult;
let ground;
let projectiles = [];
let currentProjectileIndex = 0;
let isTransitioning = false;

// Image Assets
const images = {};
const imageSources = {
    background: 'assets/images/background.avif',
    catapult: 'assets/images/catapult.png',
    projectile: 'assets/images/projectile_image.webp',
    box: 'assets/images/wood_box.png',
    target: 'assets/images/target.png'
};

function preloadImages(callback) {
    let loaded = 0;
    const numImages = Object.keys(imageSources).length;
    for (const key in imageSources) {
        images[key] = new Image();
        images[key].src = imageSources[key];
        images[key].onload = () => {
            if (++loaded >= numImages) {
                callback();
            }
        };
        images[key].onerror = () => {
            console.error(`Failed to load image: ${imageSources[key]}`);
            if (++loaded >= numImages) {
                callback();
            }
        };
    }
}

// Audio Assets
const sounds = {};
const soundSources = {
    music: 'assets/audio/background_music.mp3',
    //win: 'assets/audio/win.mp3',
    lose: 'assets/audio/lose.mp3'
};

function preloadSounds(callback) {
    let loaded = 0;
    const totalSounds = Object.keys(soundSources).length;

    for (const key in soundSources) {
        const audio = new Audio();
        audio.src = soundSources[key];
        audio.load();

        audio.addEventListener('canplaythrough', () => {
            if (++loaded >= totalSounds) callback();
        });

        audio.addEventListener('error', () => {
            console.error(`Error loading audio: ${soundSources[key]}`);
            if (++loaded >= totalSounds) callback();
        });

        sounds[key] = audio;
    }
}

// Inicializar Box2D cuando esté disponible
function initBox2D() {
    if (typeof Box2D === 'undefined') {
        console.error('Box2D no está disponible');
        return false;
    }
    
    try {
        // Obtener referencias de Box2D
        const dynamics = Box2D.Dynamics;
        const common = Box2D.Common;
        const collision = Box2D.Collision;
        const shapes = collision.Shapes;
        const math = common.Math;
        const joints = dynamics.Joints;
        
        b2World = dynamics.b2World;
        b2Vec2 = math.b2Vec2;
        b2BodyDef = dynamics.b2BodyDef;
        b2Body = dynamics.b2Body;
        b2FixtureDef = dynamics.b2FixtureDef;
        b2PolygonShape = shapes.b2PolygonShape;
        b2CircleShape = shapes.b2CircleShape;
        b2MouseJointDef = joints.b2MouseJointDef;
        b2DistanceJointDef = joints.b2DistanceJointDef;
        
        if (dynamics.b2DebugDraw) {
            b2DebugDraw = dynamics.b2DebugDraw;
        }
        
        GRAVITY = new b2Vec2(0, 10);
        console.log('Box2D inicializado correctamente');
        return true;
    } catch (e) {
        console.error('Error al inicializar Box2D:', e);
        return false;
    }
}


// UI & Level Data
let currentLevel = 0;
let highScore = 0;
let isMuted = false;
let timer = 0;
let levelUI, highScoreUI, pauseButton, muteButton, timerUI;

const levels = [
    // Level 1
    {
        boxes: [
            { x: 18, y: 15, width: 2, height: 2, type: 'static' },
            { x: 18, y: 13, width: 2, height: 2, type: 'static' },
        ],
        target: { x: 18, y: 11, width: 1.5, height: 1.5 },
        time: 45
    },
    // Level 2
    {
        boxes: [
            { x: 15, y: 15, width: 1, height: 5, type: 'static' },
            { x: 20, y: 15, width: 1, height: 5, type: 'static' },
            { x: 17.5, y: 12, width: 6, height: 1, type: 'static' }
        ],
        target: { x: 17.5, y: 11, width: 1.5, height: 1.5 },
        time: 60
    },
    // Level 3
    {
        boxes: [
            { x: 14, y: 15, width: .5, height: 8, type: 'static' },
            { x: 22, y: 15, width: .5, height: 8, type: 'static' },
            { x: 18, y: 10, width: 8, height: .5, type: 'static' },
            { x: 18, y: 15, width: 1, height: 1, type: 'dynamic' },
        ],
        target: { x: 18, y: 9, width: 1.5, height: 1.5 },
        time: 75
    }
];


// --- Initialization ---
window.onload = function() {
    try {
        // Inicializar Box2D primero
        if (!initBox2D()) {
            alert('Error: Box2D no se pudo cargar. Por favor, recarga la página.');
            return;
        }
        
        canvas = document.getElementById('gameCanvas');
        
        // Establecer dimensiones del canvas
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        ctx = canvas.getContext('2d');
        levelUI = document.getElementById('level');
        highScoreUI = document.getElementById('high-score');
        pauseButton = document.getElementById('pause-button');
        muteButton = document.getElementById('mute-button');
        timerUI = document.getElementById('timer');

        highScore = localStorage.getItem('highScore') || 0;
        highScoreUI.textContent = highScore;

        preloadImages(() => {
            preloadSounds(() => {
                setupUI();
                window.addEventListener('resize', resizeCanvas);

                world = new b2World(GRAVITY, true);
                addEventListeners();

                currentGameState = GameState.MENU;
                requestAnimationFrame(gameLoop);
            });
        });
    } catch (e) {
        console.error('Error during initialization:', e);
        alert('An error occurred during game initialization. Please check the console for details.');
    }
};

function setupUI() {
    canvas.addEventListener('click', onCanvasClick);
    pauseButton.addEventListener('click', (e) => { // Agregamos 'e' para el evento
        e.preventDefault();
        e.stopPropagation(); // Previene que el clic llegue al canvas
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

function addEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleMouseDown(e.touches[0]); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleMouseMove(e.touches[0]); });
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); handleMouseUp(e.changedTouches[0]); });
}

// --- Game Loop ---
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp; // evita delta enorme
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

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
            // Don't step the world
            break;
    }
    updateHUD();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar fondo si está disponible, si no usar color de fallback
    if (images.background && images.background.complete) {
        ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

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
    // Draw catapult image separately as it's static and doesn't have a body in the same way
    if (catapult && !isMouseDown) {
        const pos = catapult.GetPosition();
        ctx.save();
        ctx.translate(pos.x * SCALE, pos.y * SCALE);
        ctx.drawImage(images.catapult, -30, -50, 60, 100); // Adjust size as needed
        ctx.restore();
    }
}


function drawMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Angry Birds Clone', canvas.width / 2, canvas.height / 2 - 100);
    ctx.font = '24px sans-serif';
    ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2 + 50);
}

function drawPaused() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px sans-serif';
    ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 50);
}

function drawLevelComplete() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Level Complete!', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px sans-serif';
    ctx.fillText('Click to Continue', canvas.width / 2, canvas.height / 2 + 50);
}

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

function drawTrajectory() {
    if (!projectile || !catapult) return;

    const pPos = projectile.GetPosition();
    const cPos = catapult.GetPosition();
    //Calcular el lanzamiento
    const forceMultiplier = 25; 
    const velocityX = (cPos.x - pPos.x) * forceMultiplier / projectile.GetMass();
    const velocityY = (cPos.y - pPos.y) * forceMultiplier / projectile.GetMass();
    
    const x0 = pPos.x;
    const y0 = pPos.y;
    const numSteps = 80;
    const timeStep = 0.03;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Puntos blancos semitransparentes
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

// --- Game State Management ---
function startGame() {
    currentGameState = GameState.PLAYING;
    loadLevel(currentLevel);
    if (!isMuted) {
        playMusic();
    }
}

function pauseGame() {
    currentGameState = GameState.PAUSED;
    pauseButton.textContent = 'Resume';
}

function resumeGame() {
    currentGameState = GameState.PLAYING;
    pauseButton.textContent = 'Pause';
}

function gameOver() {
    currentGameState = GameState.GAME_OVER;
    playSoundEffect('lose');
    if (currentLevel > highScore) {
        highScore = currentLevel;
        localStorage.setItem('highScore', highScore);
    }
}

function levelComplete() {
    currentGameState = GameState.LEVEL_COMPLETE;

    if (currentLevel + 1 > highScore) {
        highScore = currentLevel + 1;
        localStorage.setItem('highScore', highScore);
    }
}

function updateHUD() {
    levelUI.textContent = currentLevel + 1;
    highScoreUI.textContent = highScore;
    timerUI.textContent = Math.ceil(timer);
}

// --- Level Loading ---
function loadLevel(levelIndex) {
    // 1. Clear existing bodies SAFELY
    let body = world.GetBodyList();
    while (body) {
        const next = body.GetNext();
        world.DestroyBody(body);
        body = next;
    }

    const level = levels[levelIndex];
    timer = level.time;

    // 2. RECREATE GROUND FIRST (very important)
    ground = createBox(
        canvas.width / 2 / SCALE,
        (canvas.height - 10) / SCALE,
        canvas.width / SCALE,
        20 / SCALE,
        'static'
    );
    ground.SetUserData({ type: 'ground' });

    // 3. Create Catapult BODY as sensor
    catapult = createBox(5, 15, 0.5, 3, 'static');
    catapult.GetFixtureList().SetSensor(true);
    catapult.SetUserData({ type: 'catapult' });

    // 4. Reset projectiles
    projectiles = [1, 2, 3];
    currentProjectileIndex = 0;
    createNextProjectile();

    // 5. Create Boxes
    level.boxes.forEach(box => {
        const newBox = createBox(box.x, box.y, box.width, box.height, box.type);
        newBox.SetUserData({ type: 'box' });
    });

    // 6. Create Target
    const targetBox = createBox(
        level.target.x,
        level.target.y,
        level.target.width,
        level.target.height,
        'dynamic'
    );
    targetBox.SetUserData({ type: 'target' });

    // 7. Contact listener
    setupContactListener();

    console.log("Level", levelIndex + 1, "loaded successfully.");
}

// --- Box2D Object Creation ---
function createBox(x, y, width, height, type) {
    const bodyDef = new b2BodyDef();
    bodyDef.type = type === 'dynamic' ? b2Body.b2_dynamicBody : b2Body.b2_staticBody;
    bodyDef.position.Set(x, y);

    const fixtureDef = new b2FixtureDef();
    fixtureDef.shape = new b2PolygonShape();
    fixtureDef.shape.SetAsBox(width / 2, height / 2);
    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.2;

    const body = world.CreateBody(bodyDef);
    body.CreateFixture(fixtureDef);
    return body;
}

function createCircle(x, y, radius) {
    const bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(x, y);

    const fixtureDef = new b2FixtureDef();
    fixtureDef.shape = new b2CircleShape(radius);
    fixtureDef.density = 1.5;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.4;

    const body = world.CreateBody(bodyDef);
    body.CreateFixture(fixtureDef);
    return body;
}

// --- Input Handling ---
function handleMouseDown(e) {
    if (currentGameState !== GameState.PLAYING || mouseJoint) return;

    const point = getMouseCoords(e);
    const aabb = new Box2D.Collision.b2AABB();
    aabb.lowerBound.Set(point.x - 0.001, point.y - 0.001);
    aabb.upperBound.Set(point.x + 0.001, point.y + 0.001);

    world.QueryAABB(fixture => {
        const body = fixture.GetBody();
        const userData = body.GetUserData();
        if (userData && userData.type === 'projectile' && body.GetType() === b2Body.b2_dynamicBody) {
            if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), point)) {
                const md = new b2MouseJointDef();
                md.bodyA = ground;
                md.bodyB = body;
                md.target.Set(point.x, point.y);
                md.maxForce = 300.0 * body.GetMass();
                mouseJoint = world.CreateJoint(md);
                body.SetAwake(true);
                body.SetFixedRotation(true);
                isMouseDown = true;
                return false; // Stop searching
            }
        }
        return true;
    }, aabb);
}

function handleMouseMove(e) {
    if (!isMouseDown || !mouseJoint) return;
    const point = getMouseCoords(e);
    mouseJoint.SetTarget(new b2Vec2(point.x, point.y));
}

function handleMouseUp(e) {
    if (!isMouseDown || !mouseJoint) return;

    const projectileBody = mouseJoint.GetBodyB();
    world.DestroyJoint(mouseJoint);
    mouseJoint = null;

    if (slingJoint) {
        world.DestroyJoint(slingJoint);
        slingJoint = null;
    }
    if (projectileBody.GetUserData()?.type === 'projectile') {
        const catapultPosition = catapult.GetPosition();
        const projectilePosition = projectileBody.GetPosition();
        const forceMultiplier = 25; // usa el MISMO valor que drawTrajectory
        const dx = catapultPosition.x - projectilePosition.x;
        const dy = catapultPosition.y - projectilePosition.y;

        const velX = dx * forceMultiplier / projectileBody.GetMass();
        const velY = dy * forceMultiplier / projectileBody.GetMass();

        projectileBody.SetFixedRotation(false);
        projectileBody.SetLinearVelocity(new b2Vec2(velX, velY));
    }
    
    isMouseDown = false;
    setTimeout(() => {
        currentProjectileIndex++;
        if (currentProjectileIndex < projectiles.length) {
            createNextProjectile();
        }else {
            console.log("Sin proyectiles");
        }
    }, 800);
}

function getMouseCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / SCALE;
    const y = (e.clientY - rect.top) / SCALE;
    return new b2Vec2(x, y);
}


// --- Collision Detection ---
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
            // Projectile hits target
            if ((userDataA.type === 'projectile' && userDataB.type === 'target') ||
                (userDataA.type === 'target' && userDataB.type === 'projectile')) {
                playSoundEffect('win');
                // Derribar el objetivo
                
                const targetBody = userDataA.type === 'target' ? bodyA : bodyB;
                if (targetBody) {
                    world.DestroyBody(targetBody);
                }
                levelComplete();
            }
        }
    };
    world.SetContactListener(listener);
}


// --- Utility Functions ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (world) {
        // Recreate ground
        if(ground) world.DestroyBody(ground);
        ground = createBox(canvas.width / 2 / SCALE, (canvas.height - 10) / SCALE, canvas.width / SCALE, 20 / SCALE, 'static');
    }
}

// Funcion para crear el siguiente proyectil
function createNextProjectile() {
    if (currentProjectileIndex >= projectiles.length) {
        console.log("No quedan proyectiles");
        return;
    }

    const px = catapult.GetPosition().x - 1.5;   // ligeramente a la izquierda
    const py = catapult.GetPosition().y - 2.5;   // MUCHO más arriba
    projectile = createCircle(px, py, 0.7);
    projectile.SetUserData({ type: 'projectile' });
}

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

function playMusic() {
    if (!isMuted) {
        const music = sounds.music;
        music.loop = true;
        music.volume = 0.02;
        music.play().catch(() => {});
    }
}

function stopMusic() {
    const music = sounds.music;
    music.pause();
    music.currentTime = 0;
}

function playSoundEffect(name) {
    if (!isMuted && sounds[name]) {
        if (name === 'lose') sounds[name].volume = 0.1;
        const sound = sounds[name];
        sound.volume = 0.1;
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}
