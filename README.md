# Proyecto Primer Bimestre - Angry Birds Clone

Este es un juego desarrollado con JavaScript y Box2D. El proyecto 

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

---

## 📋 Orden de Carga

Los módulos deben cargarse en este orden específico en `index.html`:

1. `constants.js` - Define constantes
2. `gameState.js` - Declara variables globales
3. `box2dInit.js` - Inicializa Box2D
4. `assetLoader.js` - Carga recursos
5. `physics.js` - Crea objetos físicos
6. `rendering.js` - Renderiza el juego
7. `input.js` - Maneja entrada
8. `audio.js` - Gestiona audio
9. `gameLogic.js` - Lógica del juego
10. `gameLoop.js` - Bucle principal
11. `ui.js` - Interfaz de usuario
12. `init.js` - Inicialización

---

## ✨ Ventajas de esta Estructura

✅ **Modularidad**: Cada módulo tiene una responsabilidad clara
✅ **Mantenibilidad**: Fácil de encontrar y modificar funcionalidades
✅ **Escalabilidad**: Fácil agregar nuevas características
✅ **Reutilización**: Los módulos pueden ser reutilizados en otros proyectos
✅ **Legibilidad**: Código más limpio y organizado
✅ **Debugging**: Más fácil identificar y solucionar problemas

---

## 🔧 Cómo Agregar Nuevas Características

1. Si es una constante → `constants.js`
2. Si es una variable global → `gameState.js`
3. Si es física �� `physics.js`
4. Si es visual → `rendering.js`
5. Si es entrada → `input.js`
6. Si es sonido → `audio.js`
7. Si es lógica de juego → `gameLogic.js`
8. Si es UI → `ui.js`

---

## 📚 Documentación Adicional

Para más información sobre la refactorización y la estructura del proyecto, consulta:

- **QUICK_START.md** - Inicio rápido (2 minutos)
- **ARCHITECTURE.md** - Descripción de la arquitectura
- **MODULES_GUIDE.md** - Guía de referencia rápida
- **modules/README.md** - Documentación detallada de cada módulo
- **STRUCTURE_DIAGRAM.md** - Diagramas visuales
- **INDEX.md** - Índice completo de documentación

---

## 🎯 Características del Juego

- ✅ 3 niveles con dificultad progresiva
- ✅ Física realista con Box2D
- ✅ Controles intuitivos (mouse y touch)
- ✅ Efectos de sonido y música
- ✅ Sistema de puntuación
- ✅ Pausa y silenciar
- ✅ Redimensionamiento automático del canvas

---

## 🐛 Solución de Problemas

### El juego no carga
- Verifica que todos los archivos estén en la carpeta correcta
- Abre la consola del navegador (F12) para ver errores
- Asegúrate de que Box2D.js se carga correctamente

### El sonido no funciona
- Verifica que los archivos de audio estén en `assets/audio/`
- Comprueba que el navegador permite reproducción de audio
- Intenta desactivar y reactivar el sonido con el botón "Silenciar"

### Los controles no responden
- Asegúrate de que el juego está en estado "PLAYING"
- Verifica que el mouse/touch está sobre el canvas
- Intenta recargar la página

---

## 📝 Notas Importantes

- El juego requiere Box2D.js para la física
- Los recursos (imágenes y sonidos) deben estar en las carpetas `assets/`
- El juego es responsive y se adapta a diferentes tamaños de pantalla
- Compatible con navegadores modernos y dispositivos móviles

---

## 🎓 Tecnologías Utilizadas

- **JavaScript (ES6+)** - Lenguaje de programación
- **Box2D.js** - Motor de física
- **Canvas API** - Renderizado gráfico
- **HTML5** - Estructura
- **CSS3** - Estilos

---

**Versión:** 2.0 (Modular)
**Estado:** ✅ Completo y Funcional
**Última actualización:** 2024
