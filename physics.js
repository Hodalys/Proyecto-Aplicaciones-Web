// Función para crear un cuadrado en el mundo físico
function createBox(x, y, width, height, type) {
    const bodyDef = new b2BodyDef(); // Definición del cuerpo
    bodyDef.type = type === 'dynamic' ? b2Body.b2_dynamicBody : b2Body.b2_staticBody; 
    bodyDef.position.Set(x, y); // Establece la posición

    const fixtureDef = new b2FixtureDef(); // Definición del fixture
    fixtureDef.shape = new b2PolygonShape(); // Forma del fixture
    fixtureDef.shape.SetAsBox(width / 2, height / 2); // Define la forma como un rectángulo
    fixtureDef.density = 1.0; // Densidad del objeto
    fixtureDef.friction = 0.5; // Fricción
    fixtureDef.restitution = 0.2; // Rebote

    const body = world.CreateBody(bodyDef); // Crea el cuerpo en el mundo
    body.CreateFixture(fixtureDef); // Asocia el fixture al cuerpo
    return body; // Retorna el cuerpo creado
}

// Función para crear un círculo en el mundo físico
function createCircle(x, y, radius) {
    const bodyDef = new b2BodyDef(); // Definición del cuerpo
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(x, y); 

    const fixtureDef = new b2FixtureDef(); // Definición del fixture
    fixtureDef.shape = new b2CircleShape(radius); // Forma del fixture como círculo
    fixtureDef.density = 1.5; // Densidad del objeto
    fixtureDef.friction = 0.5; // Fricción
    fixtureDef.restitution = 0.4; // Rebote

    const body = world.CreateBody(bodyDef); // Crea el cuerpo en el mundo
    body.CreateFixture(fixtureDef); // Asocia el fixture al cuerpo
    return body;
}

// Función para manejo de entrada del mouse al presionar
function handleMouseDown(e) {
    if (currentGameState !== GameState.PLAYING || mouseJoint) return; // Verifica el estado del juego

    const point = getMouseCoords(e); // Obtiene las coordenadas del mouse
    const aabb = new Box2D.Collision.b2AABB(); // Crea un AABB para la consulta
    aabb.lowerBound.Set(point.x - 0.001, point.y - 0.001); // Establece el límite inferior
    aabb.upperBound.Set(point.x + 0.001, point.y + 0.001); // Establece el límite superior

    // Consulta para ver si hay un proyectil en el área del mouse
    world.QueryAABB(fixture => {
        const body = fixture.GetBody();
        const userData = body.GetUserData();
        if (userData && userData.type === 'projectile' && body.GetType() === b2Body.b2_dynamicBody) {
            if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), point)) {
                const md = new b2MouseJointDef(); // Definición de un joint de mouse
                md.bodyA = ground; // Cuerpo fijo (suelo)
                md.bodyB = body; // Cuerpo a mover (proyectil)
                md.target.Set(point.x, point.y); // Establece el objetivo
                md.maxForce = 300.0 * body.GetMass(); // Fuerza máxima
                mouseJoint = world.CreateJoint(md); // Crea el joint
                body.SetAwake(true); // Activa el cuerpo
                body.SetFixedRotation(true); // Fija la rotación
                isMouseDown = true; // Marca que el mouse está presionado
                return false; // Detiene la búsqueda
            }
        }
        return true;
    }, aabb);
}

// Función para Manejo de movimiento del mouse
function handleMouseMove(e) {
    if (!isMouseDown || !mouseJoint) return; // Verifica si el mouse está presionado y hay un joint

    const point = getMouseCoords(e); // Obtiene las coordenadas del mouse
    mouseJoint.SetTarget(new b2Vec2(point.x, point.y)); // Actualiza el objetivo del joint
}

// Función para Manejo de entrada del mouse al soltar
function handleMouseUp(e) {
    if (!isMouseDown || !mouseJoint) return; // Verifica si el mouse estaba presionado y hay un joint

    const projectileBody = mouseJoint.GetBodyB(); // Obtiene el cuerpo del proyectil
    world.DestroyJoint(mouseJoint); // Destruye el joint
    mouseJoint = null; // Limpia la referencia

    // Destruye el joint de la catapulta si existe
    if (slingJoint) {
        world.DestroyJoint(slingJoint);
        slingJoint = null;
    }

    // Aplica fuerza al proyectil si es un proyectil
    if (projectileBody.GetUserData()?.type === 'projectile') {
        const catapultPosition = catapult.GetPosition(); // Posición de la catapulta
        const projectilePosition = projectileBody.GetPosition(); // Posición del proyectil
        const forceMultiplier = 25; // Multiplicador de fuerza
        const dx = catapultPosition.x - projectilePosition.x; // Diferencia en X
        const dy = catapultPosition.y - projectilePosition.y; // Diferencia en Y

        const velX = dx * forceMultiplier / projectileBody.GetMass(); // Velocidad en X
        const velY = dy * forceMultiplier / projectileBody.GetMass(); // Velocidad en Y

        projectileBody.SetFixedRotation(false); // Permite rotación
        projectileBody.SetLinearVelocity(new b2Vec2(velX, velY)); // Establece la velocidad
        playSoundEffect('launch'); // Reproduce el sonido de lanzamiento
    }

    isMouseDown = false; // Marca que el mouse no está presionado
    setTimeout(() => {
        currentProjectileIndex++; // Avanza al siguiente proyectil
        if (currentProjectileIndex < projectiles.length) {
            createNextProjectile();
        } else {
            console.log("Sin proyectiles");
        }
    }, 800); // Espera antes de avanzar
}

// Función para obtener las coordenadas del mouse
function getMouseCoords(e) {
    const rect = canvas.getBoundingClientRect(); // Obtiene el rectángulo delimitador del canvas
    const x = (e.clientX - rect.left) / SCALE; // Calcula la posición en X
    const y = (e.clientY - rect.top) / SCALE; // Calcula la posición en Y
    return new b2Vec2(x, y); // Retorna las coordenadas
}

// Función para detección de colisiones
function setupContactListener() {
    const listener = new Box2D.Dynamics.b2ContactListener(); // Crea un listener de contactos
    listener.BeginContact = (contact) => {
        const fixtureA = contact.GetFixtureA(); // Obtiene el primer fixture
        const fixtureB = contact.GetFixtureB(); // Obtiene el segundo fixture
        const bodyA = fixtureA.GetBody(); // Obtiene el cuerpo del primer fixture
        const bodyB = fixtureB.GetBody(); // Obtiene el cuerpo del segundo fixture

        const userDataA = bodyA.GetUserData(); // Obtiene los datos del primer cuerpo
        const userDataB = bodyB.GetUserData(); // Obtiene los datos del segundo cuerpo

        // Verifica si hay contacto entre un proyectil y el objetivo
        if (userDataA && userDataB) {
            if ((userDataA.type === 'projectile' && userDataB.type === 'target') ||
                (userDataA.type === 'target' && userDataB.type === 'projectile')) {
                playSoundEffect('hit');
                levelComplete(); // Marca el nivel como completo
                const targetBody = userDataA.type === 'target' ? bodyA : bodyB; // Identifica el cuerpo objetivo
                if (targetBody) {
                    world.DestroyBody(targetBody); // Destruye el cuerpo objetivo
                }
            }
        }
    };
    world.SetContactListener(listener); // Establece el listener en el mundo
}
