/**
 * AUDIO.JS
 * Gestiona la reproducción de música y efectos de sonido
 */

/**
 * Reproduce la música de fondo
 */
function playMusic() {
    if (!isMuted) {
        const music = sounds.music;
        music.loop = true;
        music.volume = 0.02;
        music.play().catch(() => {});
    }
}

/**
 * Detiene la música de fondo
 */
function stopMusic() {
    const music = sounds.music;
    music.pause();
    music.currentTime = 0;
}

/**
 * Reproduce un efecto de sonido
 * @param {string} name - Nombre del efecto de sonido a reproducir
 */
function playSoundEffect(name) {
    if (!isMuted && sounds[name]) {
        const sound = sounds[name];
        sound.volume = 0.1;
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}
