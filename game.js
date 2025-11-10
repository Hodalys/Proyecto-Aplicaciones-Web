// =========================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DEL CANVAS
// =========================================================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// =========================================================
// 2. CONSTANTES Y VARIABLES GLOBALES DE BOX2D Y JUEGO
// =========================================================

// Referencias a las clases de Box2D
const b2Vec2 = Box2D.Common.Math.b2Vec2;
const b2World = Box2D.Dynamics.b2World;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
const b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
const b2ContactListener = Box2D.Dynamics.b2ContactListener;

// Estados del Juego
const GAME_STATE = {
    LOADING: 0, MENU: 1, PLAYING: 2, PAUSED: 3, GAMEOVER: 4
};

let currentState = GAME_STATE.LOADING;
let world = null;

// Variables de Control de Lanzamiento
let isMouseDown = false;
let mouseJoint = null;
let mouseX = 0;
let mouseY = 0;
let bodiesToDestroy = []; 

// Variables de Juego (HUD y Persistencia)
let gameScore = 0;
let launchAttempts = 3;
let highScore = localStorage.getItem('highScore') || 0;


// =========================================================
// 3. GESTOR DE ACTIVOS (LOADER)
// =========================================================
const ASSETS = {
    images: {
        background: 'assets/images/background.jpg',
        //catapult: 'assets/images/catapult.png',
        wood_box: 'assets/images/wood_box.jpg',
        //target_image: 'assets/images/target_image.png',
        //projectile_image: 'assets/images/projectile_image.png'
    },
    audio: {
        //music: 'assets/audio/bkg_music.mp3',
        //launch_sfx: 'assets/audio/launch.mp3',
        //hit_sfx: 'assets/audio/hit.mp3'
    }
};

let assetsLoadedCount = 0;
let totalAssets = Object.keys(ASSETS.images).length + Object.keys(ASSETS.audio).length;
const loadedAssets = { images: {}, audio: {} };

function loadAssets(callback) {
    const assetKeys = Object.keys(ASSETS.images).concat(Object.keys(ASSETS.audio));

    assetKeys.forEach(key => {
        const path = ASSETS.images[key] || ASSETS.audio[key];
        let asset;

        const assetLoaded = () => {
            assetsLoadedCount++;
            if (assetsLoadedCount >= totalAssets) callback();
        };

        if (path.includes('audio')) {
            asset = new Audio();
            asset.oncanplaythrough = assetLoaded;
            loadedAssets.audio[key] = asset;
        } else {
            asset = new Image();
            asset.onload = assetLoaded;
            loadedAssets.images[key] = asset;
        }
        asset.src = path;
        if (path.includes('audio')) asset.load();
    });
}

// =========================================================
// 4. FUNCIONES DE INICIALIZACIÓN DE BOX2D Y HELPERS DE CUERPOS
// =========================================================

function initPhysics() {
    world = new b2World(new b2Vec2(0, 10), true); 
    
    // === Inicialización del Contact Listener (Paso 2.6) ===
    let listener = new b2ContactListener();
    listener.BeginContact = function(contact) {
        handleCollision(contact, true);
    }
    listener.EndContact = function(contact) {
        handleCollision(contact, false);
    }
    world.SetContactListener(listener);
}

function createBody(x, y, width, height, type, userData, isCircle = false) {
    let bodyDef = new b2BodyDef();
    bodyDef.type = type; 
    bodyDef.position.Set(x / Game.SCALE, y / Game.SCALE);
    
    let fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2; 

    if (isCircle) {
        fixDef.shape = new b2CircleShape(width / Game.SCALE);
    } else { 
        fixDef.shape = new b2PolygonShape();
        fixDef.shape.SetAsBox(width / 2 / Game.SCALE, height / 2 / Game.SCALE);
    }

    let body = world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    body.SetUserData(userData); 
    
    return body;
}

function setupLevel() {
    // === CREACIÓN DEL SUELO (Estático) ===
    createBody(
        GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH, 40, 
        b2Body.b2_staticBody, { type: 'ground' }
    );

    // === ESTRUCTURAS Y OBJETIVOS DE EJEMPLO ===
    // Bloque Dinámico (Caja)
    createBody(
        650, 500, 50, 50, b2Body.b2_dynamicBody, 
        { type: 'block', image: loadedAssets.images.wood_box, health: 100 }
    );
    // Objetivo Dinámico (Círculo) - Este debe ser golpeado
    createBody(
        650, 440, 20, null, b2Body.b2_dynamicBody, 
        { type: 'target', scoreValue: 100, image: loadedAssets.images.target_image },
        true
    );
    // Bloque extra
    createBody(
        600, 500, 50, 50, b2Body.b2_dynamicBody, 
        { type: 'block', image: loadedAssets.images.wood_box, health: 100 }
    );
    
    // === PROYECTIL INICIAL ===
    Game.spawnProjectile(Game.catapultX, Game.catapultY);
}

// =========================================================
// 5. MANEJO DE COLISIONES (Paso 2.6)
// =========================================================
function handleCollision(contact, isBeginning) {
    if (!isBeginning) return;

    const bodyA = contact.GetFixtureA().GetBody();
    const bodyB = contact.GetFixtureB().GetBody();

    const userDataA = bodyA.GetUserData();
    const userDataB = bodyB.GetUserData();

    if (!userDataA || !userDataB) return;

    const typeA = userDataA.type;
    const typeB = userDataB.type;
    
    // Lógica de Colisión: Proyectil golpea un Objetivo (Target)
    if ( (typeA === 'projectile' && typeB === 'target') || 
         (typeA === 'target' && typeB === 'projectile') ) {
        
        const target = typeA === 'target' ? bodyA : bodyB;
        
        if (!target.isDestroyed) { 
            target.isDestroyed = true;
            
            // Sumar puntuación
            gameScore += target.GetUserData().scoreValue;
            
            // Reproducir sonido de impacto
            loadedAssets.audio.hit_sfx.play();
            
            // Marcar el cuerpo para destrucción
            bodiesToDestroy.push(target);
        }
    }
}

// =========================================================
// 6. OBJETO Y LÓGICA DEL JUEGO (Game)
// =========================================================
const Game = {
    SCALE: 30, 
    currentProjectile: null, 
    catapultX: 100, 
    catapultY: 500,

    spawnProjectile(x, y) {
        if (Game.currentProjectile) world.DestroyBody(Game.currentProjectile);

        Game.currentProjectile = createBody(
            x, y, 25, null, 
            b2Body.b2_dynamicBody, 
            { type: 'projectile', image: loadedAssets.images.projectile_image },
            true
        );
        Game.currentProjectile.SetFixedRotation(true);
        Game.currentProjectile.SetAwake(false);
    },
    
    update() {
        if (currentState === GAME_STATE.PLAYING) {
            // Actualización de la física de Box2D
            world.Step(1 / 60, 10, 10);
            world.ClearForces();
            
            // Actualizar el MouseJoint (Lanzamiento)
            if (mouseJoint) {
                mouseJoint.SetTarget(new b2Vec2(mouseX / Game.SCALE, mouseY / Game.SCALE));
            }

            // === DESTRUCCIÓN SEGURA DE CUERPOS (Paso 2.6) ===
            for (let i = 0; i < bodiesToDestroy.length; i++) {
                const body = bodiesToDestroy[i];
                if (world.IsLocked() === false && body) {
                    world.DestroyBody(body);
                }
            }
            bodiesToDestroy = []; 
            
            // Lógica de Victoria/Derrota/Game Over
            if (launchAttempts <= 0 && !Game.currentProjectile && world.GetBodyList().GetNext() === null) {
                // Si se acabaron los intentos y no quedan cuerpos, termina.
                Game.changeState(GAME_STATE.GAMEOVER);
                // Actualizar High Score
                if (gameScore > highScore) {
                    highScore = gameScore;
                    localStorage.setItem('highScore', highScore);
                }
            }
        }
    },

    draw() {
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';

        if (currentState === GAME_STATE.LOADING) {
            const progressText = `Cargando... (${assetsLoadedCount}/${totalAssets})`;
            ctx.fillText(progressText, GAME_WIDTH / 2 - ctx.measureText(progressText).width / 2, GAME_HEIGHT / 2);

        } else if (currentState === GAME_STATE.MENU) {
            const menuWidth = GAME_WIDTH / 2;
            const menuHeight = GAME_HEIGHT / 2;
            const menuX = GAME_WIDTH / 4;
            const menuY = GAME_HEIGHT / 4;

            ctx.fillStyle = 'rgba(173, 216, 230, 0.9)';
            ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
            
            ctx.fillStyle = 'black';
            ctx.font = '30px Arial';
            let titleText = 'PUZZLE DE FÍSICA 2D';
            ctx.fillText(titleText, GAME_WIDTH / 2 - ctx.measureText(titleText).width / 2, GAME_HEIGHT / 2 - 30);
            
            ctx.font = '20px Arial';
            let clickText = 'Haz clic o toca para JUGAR';
            ctx.fillText(clickText, GAME_WIDTH / 2 - ctx.measureText(clickText).width / 2, GAME_HEIGHT / 2 + 30);
            ctx.fillText(`High Score: ${highScore}`, GAME_WIDTH / 2 - ctx.measureText(`High Score: ${highScore}`).width / 2, GAME_HEIGHT / 2 + 80);

        } else if (currentState === GAME_STATE.PLAYING) {
            
            // 1. Dibujar el fondo
            ctx.drawImage(loadedAssets.images.background, 0, 0, GAME_WIDTH, GAME_HEIGHT);
            
            // 2. Dibujar la Catapulta (Parte estática del UI)
            ctx.drawImage(loadedAssets.images.catapult, Game.catapultX - 50, Game.catapultY - 50, 100, 100);

            // 3. Dibujo de línea de estiramiento
            if (isMouseDown && mouseJoint && Game.currentProjectile) {
                const bodyPos = Game.currentProjectile.GetPosition();
                const projX = bodyPos.x * Game.SCALE;
                const projY = bodyPos.y * Game.SCALE;

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(Game.catapultX, Game.catapultY);
                ctx.lineTo(projX, projY);
                ctx.stroke();
            }

            // 4. Dibujo de OBJETOS FÍSICOS
            for (let b = world.GetBodyList(); b; b = b.GetNext()) {
                const userData = b.GetUserData();
                // Omitir el GroundBody (el primer cuerpo de Box2D)
                if (b.GetType() === b2Body.b2_staticBody && userData.type !== 'ground') continue;

                if (userData && userData.image) {
                    const bodyPos = b.GetPosition();
                    const posX = bodyPos.x * Game.SCALE;
                    const posY = bodyPos.y * Game.SCALE;
                    const angle = b.GetAngle();
                    
                    ctx.save();
                    ctx.translate(posX, posY);
                    ctx.rotate(angle);
                    
                    const img = userData.image;
                    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
                    
                    ctx.restore();
                }
            }
            
            // 5. Dibuja el HUD
            ctx.fillStyle = 'white';
            ctx.fillText(`Intentos: ${launchAttempts}`, 10, 30);
            ctx.fillText(`Puntuación: ${gameScore}`, 10, 60);
            ctx.fillText(`High Score: ${highScore}`, 10, 90);

        } else if (currentState === GAME_STATE.GAMEOVER) {
             // Pantalla de Game Over
             ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
             ctx.fillRect(GAME_WIDTH / 4, GAME_HEIGHT / 4, GAME_WIDTH / 2, GAME_HEIGHT / 2);
             ctx.fillStyle = 'white';
             ctx.font = '40px Arial';
             let goText = 'GAME OVER';
             ctx.fillText(goText, GAME_WIDTH / 2 - ctx.measureText(goText).width / 2, GAME_HEIGHT / 2 - 30);
             ctx.font = '24px Arial';
             let finalScoreText = `Puntuación Final: ${gameScore}`;
             ctx.fillText(finalScoreText, GAME_WIDTH / 2 - ctx.measureText(finalScoreText).width / 2, GAME_HEIGHT / 2 + 30);
        }
    },

    changeState(newState) {
        currentState = newState;
    }
};

// =========================================================
// 7. BUCLE PRINCIPAL (Game Loop) Y ARRANQUE
// =========================================================
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime; 
    lastTime = timestamp;

    Game.update(deltaTime);
    Game.draw();

    requestAnimationFrame(gameLoop);
}

function startUp() {
    initPhysics();
    
    loadAssets(() => {
        setupLevel(); 
        Game.changeState(GAME_STATE.MENU);
        requestAnimationFrame(gameLoop);
    });
}
startUp();

// =========================================================
// 8. MANEJO DE EVENTOS (Mouse y Touch)
// =========================================================
function updateMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    
    mouseX = clientX - rect.left;
    mouseY = clientY - rect.top;
    
    if (e.touches) e.preventDefault(); 
}

function handleDown(e) {
    // Si no estamos jugando, si ya estamos arrastrando, o si no hay proyectil
    if (currentState !== GAME_STATE.PLAYING || mouseJoint || !Game.currentProjectile) return;

    updateMousePos(e);

    const distance = Math.sqrt(Math.pow(mouseX - Game.catapultX, 2) + Math.pow(mouseY - Game.catapultY, 2));
    if (distance > 100) return;

    isMouseDown = true;
    const body = Game.currentProjectile; 
    const mouseWorld = new b2Vec2(mouseX / Game.SCALE, mouseY / Game.SCALE);

    let md = new b2MouseJointDef();
    md.bodyA = world.GetGroundBody(); 
    md.bodyB = body;
    md.target.Set(mouseWorld.x, mouseWorld.y);
    md.collideConnected = true;
    md.maxForce = 300.0 * body.GetMass();
    
    mouseJoint = world.CreateJoint(md);
    body.SetAwake(true);
}

function handleMove(e) {
    if (!isMouseDown) return;

    updateMousePos(e);
    if (mouseJoint) {
        // Limitar la distancia de estiramiento a un radio de 100px
        const limitVector = new b2Vec2(
            (mouseX - Game.catapultX) / Game.SCALE, 
            (mouseY - Game.catapultY) / Game.SCALE
        );
        
        if (limitVector.Length() * Game.SCALE > 100) {
            limitVector.Normalize();
            limitVector.Multiply(100 / Game.SCALE);
            
            const targetX = Game.catapultX / Game.SCALE + limitVector.x;
            const targetY = Game.catapultY / Game.SCALE + limitVector.y;
            mouseJoint.SetTarget(new b2Vec2(targetX, targetY));
        } else {
            mouseJoint.SetTarget(new b2Vec2(mouseX / Game.SCALE, mouseY / Game.SCALE));
        }
    }
}

function handleUp() {
    isMouseDown = false;
    
    if (mouseJoint) {
        world.DestroyJoint(mouseJoint);
        mouseJoint = null;
        loadedAssets.audio.launch_sfx.play();
        launchAttempts--;
    }
}

// Eventos del juego
canvas.addEventListener('click', (e) => {
    if (currentState === GAME_STATE.MENU) Game.changeState(GAME_STATE.PLAYING);
        //falta la logica
    if (currentState === GAME_STATE.GAMEOVER) {
        window.location.reload(); 
    }
});

// Eventos de interacción (Mouse y Touch)
canvas.addEventListener('mousedown', handleDown);
canvas.addEventListener('touchstart', handleDown);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('mouseup', handleUp);
canvas.addEventListener('touchend', handleUp);