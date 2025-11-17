/**
 * ASSETLOADER.JS
 * Gestiona la carga de imágenes y sonidos
 */

/**
 * Precarga todas las imágenes del juego
 * @param {Function} callback - Función a ejecutar cuando todas las imágenes estén cargadas
 */
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

/**
 * Precarga todos los sonidos del juego
 * @param {Function} callback - Función a ejecutar cuando todos los sonidos estén cargados
 */
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
