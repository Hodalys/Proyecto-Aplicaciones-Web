/**
 * BOX2DINIT.JS
 * Inicializa Box2D y sus referencias
 */

/**
 * Inicializa Box2D cuando esté disponible
 * @returns {boolean} true si Box2D se inicializó correctamente, false en caso contrario
 */
function initBox2D() {
    if (typeof Box2D === 'undefined') {
        console.error('Box2D no está disponible');
        return false;
    }
    
    try {
        // Obtener referencias de Box2D
        const dynamics = Box2D.Dynamics;
        const common = Box2D.Common;
        const collision = Box2D.Collision;
        const shapes = collision.Shapes;
        const math = common.Math;
        const joints = dynamics.Joints;
        
        b2World = dynamics.b2World;
        b2Vec2 = math.b2Vec2;
        b2BodyDef = dynamics.b2BodyDef;
        b2Body = dynamics.b2Body;
        b2FixtureDef = dynamics.b2FixtureDef;
        b2PolygonShape = shapes.b2PolygonShape;
        b2CircleShape = shapes.b2CircleShape;
        b2MouseJointDef = joints.b2MouseJointDef;
        b2DistanceJointDef = joints.b2DistanceJointDef;
        
        if (dynamics.b2DebugDraw) {
            b2DebugDraw = dynamics.b2DebugDraw;
        }
        
        GRAVITY = new b2Vec2(0, 10);
        console.log('Box2D inicializado correctamente');
        return true;
    } catch (e) {
        console.error('Error al inicializar Box2D:', e);
        return false;
    }
}
