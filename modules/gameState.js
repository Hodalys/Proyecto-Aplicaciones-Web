/**
 * GAMESTATE.JS
 * Gestiona el estado global del juego y variables compartidas
 */

// Box2D Aliases - Se inicializarán cuando Box2D esté disponible
let b2World, b2Vec2, b2BodyDef, b2Body, b2FixtureDef, b2PolygonShape, b2CircleShape, b2MouseJointDef, b2DistanceJointDef;
let b2DebugDraw;
let GRAVITY;

// Canvas and Context
let canvas, ctx;

// Physics World
let world;
let debugDraw;

// Game State
let currentGameState = GameState.MENU;

// Game Variables
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

// UI Elements
let levelUI, highScoreUI, pauseButton, muteButton, timerUI;

// Game Progress
let currentLevel = 0;
let highScore = 0;
let isMuted = false;
let timer = 0;

// Assets
const images = {};
const sounds = {};
