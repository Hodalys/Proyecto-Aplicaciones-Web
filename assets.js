const images = {}; // Objeto para almacenar las imágenes cargadas
// Fuentes de las imágenes que se van a cargar
const imageSources = {
    background: 'assets/images/background.png',
    catapult: 'assets/images/catapult.png',
    projectile: 'assets/images/projectile_image.jpg',
    box: 'assets/images/wood_box.png',
    target: 'assets/images/target.jpg'
};
// Función para precargar las imágenes
function preloadImages(callback) {
    let loaded = 0;
    const numImages = Object.keys(imageSources).length;
    // Itera sobre cada fuente de imagen
    for (const key in imageSources) {
        images[key] = new Image();
        images[key].src = imageSources[key];
        images[key].onload = () => {
            if (++loaded >= numImages) {
                callback();
            }
        };
        images[key].onerror = () => {
            console.error(`Error al cargar la imagen: ${imageSources[key]}`);
            if (++loaded >= numImages) {
                callback();
            }
        };
    }
}

const sounds = {};
// Fuentes de audios que se van a cargar
const soundSources = {
    music: 'assets/audio/background_music.mp3',
    //launch: 'assets/audio/launch.wav',
    //hit: 'assets/audio/hit.wav',
    //win: 'assets/audio/win.wav',
    //lose: 'assets/audio/lose.wav'
};
// Función para precargar los audios
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
            console.error(`Error al cargar audio: ${soundSources[key]}`);
            if (++loaded >= totalSounds) callback();
        });

        sounds[key] = audio;
    }
}
