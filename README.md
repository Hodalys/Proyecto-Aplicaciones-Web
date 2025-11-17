# Proyecto Primer Bimestre - Astro Mission
Autores:
- Hodalys López
- Bryan Yunga
---

## 🚀 Ejecución

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para cargar Box2D.js)

### Cómo Ejecutar
1. Abre el archivo `index.html` en tu navegador web
2. El juego cargará automáticamente
3. Haz clic en la pantalla para iniciar

### Estructura de Carpetas
```
Proyecto-Aplicaciones-Web/
├── index.html                 # Archivo principal
├── css/
│   └── styles.css            # Estilos del juego
├── assets/
│   ├── audio/                # Archivos de sonido
│   │   ├── background_music.mp3
│   │   ├── win.mp3
│   │   └── lose.mp3
│   └── images/               # Imágenes del juego
│       ├── background.avif
│       ├── catapult.png
│       ├── projectile_image.webp
│       ├── target.png
│       └── wood_box.png
├── lib/
│   └── Box2D.js              # Librería de física
└── modules/                  # Módulos del juego
    ├── constants.js
    ├── gameState.js
    ├── box2dInit.js
    ├── assetLoader.js
    ├── physics.js
    ├── rendering.js
    ├── input.js
    ├── audio.js
    ├── gameLogic.js
    ├── gameLoop.js
    ├── ui.js
    └── init.js
```

---

## 🎮 Controles

### Controles del Juego
- **Mouse/Trackpad:**
  - Arrastra el proyectil hacia atrás para cargar
  - Suelta para lanzar
  - La línea blanca muestra la trayectoria predicha

- **Touch (Móvil/Tablet):**
  - Toca y arrastra el proyectil hacia atrás
  - Suelta para lanzar
  - Funciona igual que con mouse

### Botones de Control
- **Pausar/Reanudar:** Pausa el juego durante la partida
- **Silenciar/Activar Sonido:** Controla la música y efectos de sonido

### Objetivo del Juego
1. Lanza el proyectil hacia el objetivo
2. Golpea el objetivo antes de que se agote el tiempo
3. Completa todos los niveles para ganar

---

## 📐 Estructura de Módulos

### 1. **constants.js**
Define todas las constantes y configuraciones del juego:
- Escala del juego (SCALE)
- Estados del juego (GameState)
- Definición de niveles
- Rutas de imágenes y sonidos

### 2. **gameState.js**
Declara todas las variables globales del juego:
- Referencias de Box2D
- Variables del canvas y contexto
- Estado actual del juego
- Elementos de UI
- Progreso del juego (nivel, puntuación, etc.)
- Contenedores de assets (imágenes y sonidos)

### 3. **box2dInit.js**
Inicializa la librería Box2D:
- Función `initBox2D()` - Configura todas las referencias de Box2D

### 4. **assetLoader.js**
Gestiona la carga de recursos:
- `preloadImages()` - Carga todas las imágenes
- `preloadSounds()` - Carga todos los sonidos

### 5. **physics.js**
Crea objetos físicos en Box2D:
- `createBox()` - Crea cajas rectangulares
- `createCircle()` - Crea círculos (proyectiles)
- `getMouseCoords()` - Convierte coordenadas del mouse al mundo físico

### 6. **rendering.js**
Gestiona todo el renderizado visual:
- `drawBodies()` - Dibuja todos los cuerpos del mundo
- `drawTensionLine()` - Dibuja la línea de tensión de la catapulta
- `drawTrajectory()` - Dibuja la trayectoria predicha
- `drawMenu()`, `drawPaused()`, `drawGameOver()`, `drawLevelComplete()` - Pantallas de UI
- `drawBackground()` - Dibuja el fondo
- `draw()` - Función principal de renderizado

### 7. **input.js**
Gestiona la entrada del usuario:
- `handleMouseDown()` - Maneja presionar el mouse
- `handleMouseMove()` - Maneja mover el mouse
- `handleMouseUp()` - Maneja soltar el mouse
- `addEventListeners()` - Agrega listeners para mouse y touch

### 8. **audio.js**
Gestiona la reproducción de audio:
- `playMusic()` - Reproduce la música de fondo
- `stopMusic()` - Detiene la música
- `playSoundEffect()` - Reproduce efectos de sonido

### 9. **gameLogic.js**
Contiene la lógica principal del juego:
- `loadLevel()` - Carga un nivel
- `createNextProjectile()` - Crea el siguiente proyectil
- `setupContactListener()` - Configura detección de colisiones
- `startGame()`, `pauseGame()`, `resumeGame()` - Control de estado
- `gameOver()`, `levelComplete()` - Fin de nivel
- `onCanvasClick()` - Maneja clics en el canvas

### 10. **gameLoop.js**
Gestiona el bucle principal del juego:
- `gameLoop()` - Bucle de animación principal
- `update()` - Actualiza la lógica del juego

### 11. **ui.js**
Gestiona la interfaz de usuario:
- `setupUI()` - Configura event listeners de UI
- `updateHUD()` - Actualiza el HUD (nivel, puntuación, tiempo)
- `resizeCanvas()` - Redimensiona el canvas

### 12. **init.js**
Inicializa el juego:
- `window.onload` - Punto de entrada principal
- Carga todos los recursos
- Configura el mundo físico
- Inicia el bucle de juego
