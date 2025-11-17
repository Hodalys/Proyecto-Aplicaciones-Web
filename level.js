// Definición de los niveles del juego
const levels = [
    // Nivel 1
    {
        boxes: [
            { x: 18, y: 15, width: 2, height: 2, type: 'static' },
            { x: 18, y: 13, width: 2, height: 2, type: 'static' },
        ],
        target: { x: 18, y: 11, width: 1.5, height: 1.5 },
        time: 45
    },
    // Nivel 2
    {
        boxes: [
            { x: 15, y: 15, width: 1, height: 5, type: 'static' },
            { x: 20, y: 15, width: 1, height: 5, type: 'static' },
            { x: 17.5, y: 12, width: 6, height: 1, type: 'static' }
        ],
        target: { x: 17.5, y: 11, width: 1.5, height: 1.5 },
        time: 60
    },
    // Nivel 3
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
// Función para cargar un nivel específico
function loadLevel(levelIndex) {
    // Elimina todos los cuerpos del mundo
    let body = world.GetBodyList();
    while (body) {
        const next = body.GetNext();
        world.DestroyBody(body); // Destruye el cuerpo actual
        body = next; // Avanza al siguiente cuerpo
    }

    const level = levels[levelIndex]; // Obtiene el nivel actual
    timer = level.time; // Establece el temporizador del nivel
    
    // Crea el suelo del nivel
    ground = createBox(
        canvas.width / 2 / SCALE,
        (canvas.height - 10) / SCALE,
        canvas.width / SCALE,
        20 / SCALE,
        'static'
    );
    ground.SetUserData({ type: 'ground' });

    // Crea la catapulta
    catapult = createBox(5, 15, 0.5, 3, 'static');
    catapult.GetFixtureList().SetSensor(true);
    catapult.SetUserData({ type: 'catapult' });

    // Inicializa los proyectiles
    projectiles = [1, 2, 3];
    currentProjectileIndex = 0;
    createNextProjectile();

    // Crea las cajas del nivel
    level.boxes.forEach(box => {
        const newBox = createBox(box.x, box.y, box.width, box.height, box.type);
        newBox.SetUserData({ type: 'box' });
    });

    // Crea el objetivo del nivel
    const targetBox = createBox(
        level.target.x,
        level.target.y,
        level.target.width,
        level.target.height,
        'dynamic'
    );
    targetBox.SetUserData({ type: 'target' }); // Establece el tipo de objeto

    setupContactListener(); // Configura el listener de contactos

    console.log("Nivel", levelIndex + 1, "cargado con éxito."); // Mensaje de éxito
}
