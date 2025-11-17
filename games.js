// Box2D Aliases - Se inicializarán cuando Box2D esté disponible
let b2World, b2Vec2, b2BodyDef, b2Body, b2FixtureDef, b2PolygonShape, 
b2CircleShape, b2MouseJointDef, b2DistanceJointDef;
let b2DebugDraw; // Para la depuración visual

// Constantes del juego
const SCALE = 30; // 30 píxeles = 1 metro
let GRAVITY; // Se inicializará después de que Box2D esté disponible

// Estado del juego
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game-over',
    LEVEL_COMPLETE: 'level-complete'
};
let currentGameState = GameState.MENU; // Estado inicial del juego

// Variables del juego
let canvas, ctx; // Elemento canvas y su contexto
let world; // Mundo físico de Box2D
let lastTime = 0; // Tiempo de la última actualización
let isMouseDown = false; // Estado del mouse
let mouseJoint = null; // Joint del mouse
let projectile = null; // Proyectil actual
let slingJoint = null; // Joint de la honda
let catapult; // Catapulta
let ground; // Suelo del mundo
let projectiles = []; // Lista de proyectiles
let currentProjectileIndex = 0; // Índice del proyectil actual

// Inicializar el juego
window.onload = function() {
    try {
        if (!initBox2D()) {
            alert('Error: Box2D no se pudo cargar. Por favor, recarga la página.');
            return;
        }
        // Configura el canvas
        canvas = document.getElementById('gameCanvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        ctx = canvas.getContext('2d');
        // Precarga imágenes y sonidos antes de iniciar el juego
        preloadImages(() => {
            preloadSounds(() => {
                setupUI(); // Configura la interfaz de usuario
                window.addEventListener('resize', resizeCanvas);
                // Inicializa el mundo de Box2D con gravedad
                world = new b2World(GRAVITY, true);
                addEventListeners();

                currentGameState = GameState.MENU;
                requestAnimationFrame(gameLoop);
            });
        });
    } catch (e) {
        // Captura errores durante la inicialización
        console.error('Error durante la inicialización:', e);
        alert('Ocurrió un error durante la inicialización del juego. Por favor, revisa la consola para más detalles.');
    }
};
