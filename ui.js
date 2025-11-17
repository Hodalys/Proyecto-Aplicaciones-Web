// Función actualizar la interfaz de usuario (HUD)
function updateHUD() {
    levelUI.textContent = currentLevel + 1; // Muestra el nivel actual
    highScoreUI.textContent = highScore; // Muestra la puntuación más alta
    timerUI.textContent = Math.ceil(timer); // Muestra el tiempo restante, redondeado hacia arriba
}

// Función redimensionar el canvas
function resizeCanvas() {
    canvas.width = window.innerWidth; // Establece el ancho del canvas al ancho de la ventana
    canvas.height = window.innerHeight; // Establece la altura del canvas a la altura de la ventana
    if (world) {
        if (ground) world.DestroyBody(ground); // Destruye el cuerpo del suelo si existe
        // Crea un nuevo suelo con las dimensiones del canvas
        ground = createBox(
            canvas.width / 2 / SCALE,
            (canvas.height - 10) / SCALE,
            canvas.width / SCALE,
            20 / SCALE,
            'static'
        );
    }
}

