/**
 * PHYSICS.JS
 * Gestiona la creación de objetos físicos en Box2D
 */

/**
 * Crea una caja rectangular en el mundo físico
 * @param {number} x - Posición X del centro
 * @param {number} y - Posición Y del centro
 * @param {number} width - Ancho de la caja
 * @param {number} height - Alto de la caja
 * @param {string} type - Tipo de cuerpo ('static' o 'dynamic')
 * @returns {Object} El cuerpo creado
 */
function createBox(x, y, width, height, type) {
    const bodyDef = new b2BodyDef();
    bodyDef.type = type === 'dynamic' ? b2Body.b2_dynamicBody : b2Body.b2_staticBody;
    bodyDef.position.Set(x, y);

    const fixtureDef = new b2FixtureDef();
    fixtureDef.shape = new b2PolygonShape();
    fixtureDef.shape.SetAsBox(width / 2, height / 2);
    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.2;

    const body = world.CreateBody(bodyDef);
    body.CreateFixture(fixtureDef);
    return body;
}

/**
 * Crea un círculo en el mundo físico
 * @param {number} x - Posición X del centro
 * @param {number} y - Posición Y del centro
 * @param {number} radius - Radio del círculo
 * @returns {Object} El cuerpo creado
 */
function createCircle(x, y, radius) {
    const bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(x, y);

    const fixtureDef = new b2FixtureDef();
    fixtureDef.shape = new b2CircleShape(radius);
    fixtureDef.density = 1.5;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.4;

    const body = world.CreateBody(bodyDef);
    body.CreateFixture(fixtureDef);
    return body;
}

/**
 * Convierte coordenadas del mouse a coordenadas del mundo físico
 * @param {Event} e - Evento del mouse
 * @returns {Object} Coordenadas en el mundo físico
 */
function getMouseCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / SCALE;
    const y = (e.clientY - rect.top) / SCALE;
    return new b2Vec2(x, y);
}
