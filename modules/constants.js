/**
 * CONSTANTS.JS
 * Contiene todas las constantes y configuraciones del juego
 */

// Game Constants
const SCALE = 30; // 30 pixels = 1 meter

// Game State
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game-over',
    LEVEL_COMPLETE: 'level-complete'
};

// Level Data
const levels = [
    // Level 1
    {
        boxes: [
            { x: 18, y: 15, width: 2, height: 2, type: 'static' },
            { x: 18, y: 13, width: 2, height: 2, type: 'static' },
        ],
        target: { x: 18, y: 11, width: 1.5, height: 1.5 },
        time: 20
    },
    // Level 2
    {
        boxes: [
            { x: 15, y: 15, width: 1, height: 5, type: 'static' },
            { x: 20, y: 15, width: 1, height: 5, type: 'static' },
            { x: 17.5, y: 12, width: 6, height: 1, type: 'static' }
        ],
        target: { x: 17.5, y: 11, width: 1.5, height: 1.5 },
        time: 20
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
        time: 20
    }
];

// Image Assets Configuration
const imageSources = {
    background: 'assets/images/background.avif',
    catapult: 'assets/images/catapult.png',
    projectile: 'assets/images/projectile_image.webp',
    box: 'assets/images/wood_box.png',
    target: 'assets/images/target.png'
};

// Audio Assets Configuration
const soundSources = {
    music: 'assets/audio/background_music.mp3',
    win: 'assets/audio/win.mp3',
    lose: 'assets/audio/lose.mp3'
};
