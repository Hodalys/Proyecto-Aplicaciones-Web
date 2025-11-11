// game.js (versión robusta adaptada a Box2d local)

// ==============================
// CONFIGURACIÓN DEL CANVAS
// ==============================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
// Visual aid para verificar que el canvas existe
canvas.style.backgroundColor = '#000'; // luego puedes quitarlo

// ==============================
// DEFINICIÓN DE ASSETS
// ==============================
const ASSETS = {
  images: {
    background: 'assets/images/background.png',
    catapult: 'assets/images/catapult.png',
    wood_box: 'assets/images/wood_box.png',
    target_image: 'assets/images/target.jpg',
    projectile_image: 'assets/images/projectile_image.jpg'
  },
  audio: {
    // rellenar si tienes audio
  }
};

const loadedAssets = { images: {}, audio: {} };

// ==============================
// CARGA DE ASSETS (con fallback y callback)
// ==============================
function loadAssets(callback) {
  const imageKeys = Object.keys(ASSETS.images);
  const audioKeys = Object.keys(ASSETS.audio || {});
  const totalAssets = imageKeys.length + audioKeys.length;
  let assetsLoaded = 0;

  const checkLoaded = () => {
    assetsLoaded++;
    console.log(`Asset cargado (${assetsLoaded}/${totalAssets})`);
    if (assetsLoaded === totalAssets) {
      console.log("✅ Todos los assets cargados correctamente");
      callback();
    }
  };

  // Si no hay assets, llama al callback inmediatamente
  if (totalAssets === 0) {
    console.log("No hay assets a cargar");
    callback();
    return;
  }

  imageKeys.forEach(key => {
    const img = new Image();
    img.onload = checkLoaded;
    img.onerror = () => {
      console.warn(`⚠️ Error cargando imagen ${ASSETS.images[key]}. Se continuará de todas formas.`);
      checkLoaded();
    };
    img.src = ASSETS.images[key];
    loadedAssets.images[key] = img;
  });

  // Si hubiera audio, tratar de cargar con oncanplaythrough y onerror similar
}

// ==============================
// ESTADOS DEL JUEGO
// ==============================
const GAME_STATE = { LOADING: 0, MENU: 1, PLAYING: 2, GAMEOVER: 3 };
let currentState = GAME_STATE.LOADING;
let gameScore = 0;
let launchAttempts = 3;
let highScore = localStorage.getItem('highScore') || 0;

// ==============================
// ADAPTAR / ALIAS A Box2D (defensivo)
// ==============================
let Box2DRoot = (typeof Box2D !== 'undefined') ? Box2D : (window.Box2D || null);
if (!Box2DRoot) {
  console.error('Box2D no está definido. Asegúrate de que lib/Box2d.min.js se cargue correctamente antes de game.js');
}

let b2Vec2, b2World, b2BodyDef, b2Body, b2FixtureDef, b2PolygonShape, b2CircleShape, b2MouseJointDef;
try {
  if (Box2DRoot) {
    // Las rutas dentro del archivo que subiste usan Box2D.Common.Math etc.
    b2Vec2 = Box2DRoot.Common.Math.b2Vec2;
    b2World = Box2DRoot.Dynamics.b2World;
    b2BodyDef = Box2DRoot.Dynamics.b2BodyDef;
    b2Body = Box2DRoot.Dynamics.b2Body;
    b2FixtureDef = Box2DRoot.Dynamics.b2FixtureDef;
    b2PolygonShape = Box2DRoot.Collision.Shapes.b2PolygonShape;
    b2CircleShape = Box2DRoot.Collision.Shapes.b2CircleShape;
    b2MouseJointDef = Box2DRoot.Dynamics.Joints.b2MouseJointDef;
  }
} catch (err) {
  console.error('Error al crear aliases para Box2D:', err);
}

// Verificación rápida
if (!b2Vec2 || !b2World) {
  console.warn('Algunos alias de Box2D no se pudieron resolver. Mostrare más detalles y evitaré llamadas que rompan el flujo.');
}

// ==============================
// FÍSICA (inicialización segura)
// ==============================
let world = null;
function initPhysics() {
  try {
    if (!b2World || !b2Vec2) {
      throw new Error('Box2D no está disponible (b2World o b2Vec2 undefined).');
    }
    world = new b2World(new b2Vec2(0, 10), true);
    console.log('Mundo físico creado correctamente');
  } catch (err) {
    console.error('No se pudo inicializar la física:', err);
    world = null;
  }
}

// ==============================
// CREACIÓN DE CUERPOS (robusta)
// ==============================
function createBody(x, y, width, height, type, userData, isCircle = false) {
  if (!world) {
    console.warn('createBody llamado pero world es null. Se ignorará la creación física.');
    return null;
  }
  try {
    let bodyDef = new b2BodyDef();
    bodyDef.type = type;
    bodyDef.position.Set(x / 30, y / 30);

    let fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    // Corregir nombre variable y manejar null height para círculos
    if (isCircle) {
      const radius = (width != null) ? (width / 30) : ( (height != null) ? (height/30) : 1 );
      fixDef.shape = new b2CircleShape(radius);
    } else {
      const w = (width != null) ? (width / 2 / 30) : 0.5;
      const h = (height != null) ? (height / 2 / 30) : 0.5;
      let shape = new b2PolygonShape();
      shape.SetAsBox(w, h);
      fixDef.shape = shape;
    }

    const body = world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    body.SetUserData(userData || {});
    return body;
  } catch (err) {
    console.error('Error creando cuerpo:', err);
    return null;
  }
}

// ==============================
// NIVELES / ENTIDADES
// ==============================
function setupLevel() {
  if (!world) {
    console.warn('setupLevel ignorado porque world no está inicializado');
    return;
  }
  try {
    const b2_staticBody = b2Body ? b2Body.b2_staticBody : (Box2DRoot && Box2DRoot.Dynamics && Box2DRoot.Dynamics.b2Body ? Box2DRoot.Dynamics.b2Body.b2_staticBody : 0);
    const b2_dynamicBody = b2Body ? b2Body.b2_dynamicBody : (Box2DRoot && Box2DRoot.Dynamics && Box2DRoot.Dynamics.b2Body ? Box2DRoot.Dynamics.b2Body.b2_dynamicBody : 2);

    // Suelo
    createBody(400, 580, 800, 40, b2_staticBody, { type: 'ground' });

    // Bloques
    createBody(650, 500, 50, 50, b2_dynamicBody, {
      type: 'block',
      image: loadedAssets.images.wood_box
    });

    createBody(600, 500, 50, 50, b2_dynamicBody, {
      type: 'block',
      image: loadedAssets.images.wood_box
    });

    // Objetivo (círculo)
    createBody(650, 440, 20, 20, b2_dynamicBody, {
      type: 'target',
      scoreValue: 100,
      image: loadedAssets.images.target_image
    }, true);

    // Proyectil
    spawnProjectile(100, 500);

    console.log('Nivel configurado');
  } catch (err) {
    console.error('Error en setupLevel:', err);
  }
}

// ==============================
// PROYECTIL
// ==============================
let currentProjectile = null;
function spawnProjectile(x, y) {
  if (!world) return;
  try {
    if (currentProjectile) world.DestroyBody(currentProjectile);
    currentProjectile = createBody(x, y, 25, 25, (b2Body? b2Body.b2_dynamicBody : 2), {
      type: 'projectile',
      image: loadedAssets.images.projectile_image
    }, true);
    if (currentProjectile && currentProjectile.SetFixedRotation) currentProjectile.SetFixedRotation(true);
    if (currentProjectile && currentProjectile.SetAwake) currentProjectile.SetAwake(false);
  } catch (err) {
    console.error('Error en spawnProjectile:', err);
  }
}

// ==============================
// DIBUJO
// ==============================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (currentState === GAME_STATE.LOADING) {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Cargando...', 50, 50);
    return;
  }

  if (currentState === GAME_STATE.MENU) {
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(200, 150, 400, 300);
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('PUZZLE DE FÍSICA 2D', 250, 230);
    ctx.font = '20px Arial';
    ctx.fillText('Haz clic para jugar', 300, 300);
    ctx.fillText(`High Score: ${highScore}`, 280, 350);
    return;
  }

  if (currentState === GAME_STATE.PLAYING) {
    // background
    if (loadedAssets.images.background && loadedAssets.images.background.complete) {
      try { ctx.drawImage(loadedAssets.images.background, 0, 0, canvas.width, canvas.height); } catch(e){/* ignore draw errors */ }
    } else {
      ctx.fillStyle = '#113';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // catapult
    if (loadedAssets.images.catapult && loadedAssets.images.catapult.complete) {
      try { ctx.drawImage(loadedAssets.images.catapult, 50, canvas.height - 150, 100, 100); } catch(e){ }
    }

    if (world) {
      for (let b = world.GetBodyList(); b; b = b.GetNext()) {
        const userData = b.GetUserData && b.GetUserData();
        if (userData && userData.image) {
          const pos = b.GetPosition();
          const x = pos.x * 30;
          const y = pos.y * 30;
          try { ctx.drawImage(userData.image, x - 25, y - 25, 50, 50); } catch(e) {}
        }
      }
    }

    // HUD
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Intentos: ${launchAttempts}`, 10, 30);
    ctx.fillText(`Puntuación: ${gameScore}`, 10, 60);
  }
}

// ==============================
// BUCLE
// ==============================
function update() {
  // placeholder para lógica de juego
}

function gameLoop() {
  try {
    if (currentState === GAME_STATE.PLAYING && world) {
      world.Step(1 / 60, 10, 10);
      world.ClearForces && world.ClearForces();
    }
  } catch (err) {
    console.error('Error dentro del step de física:', err);
  }
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ==============================
// CONTROL DE MOUSE / CLICS
// ==============================
canvas.addEventListener('click', () => {
  if (currentState === GAME_STATE.MENU) {
    currentState = GAME_STATE.PLAYING;
    console.log('Estado -> PLAYING');
  } else if (currentState === GAME_STATE.PLAYING) {
    // ejemplo: respawn proyectil si haces click
    spawnProjectile(100, canvas.height - 100);
  }
});

// ==============================
// INICIO
// ==============================
function startGame() {
  console.log('startGame: iniciando...');
  currentState = GAME_STATE.LOADING;
  initPhysics();
  loadAssets(() => {
    try {
      setupLevel();
      currentState = GAME_STATE.MENU;
      requestAnimationFrame(gameLoop);
      console.log('Juego arrancado. Estado MENU');
    } catch (err) {
      console.error('Error al iniciar nivel / gameLoop:', err);
    }
  });
}

// Si quieres ver logs inmediatos
console.log('game.js cargado - iniciando startGame()');
startGame();
