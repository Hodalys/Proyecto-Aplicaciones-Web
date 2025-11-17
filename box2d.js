function initBox2D() {
    // Verifica si Box2D está disponible
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

        // Asignación de las clases y funciones de Box2D a variables locales
        b2World = dynamics.b2World;
        b2Vec2 = math.b2Vec2;
        b2BodyDef = dynamics.b2BodyDef;
        b2Body = dynamics.b2Body;
        b2FixtureDef = dynamics.b2FixtureDef;
        b2PolygonShape = shapes.b2PolygonShape;
        b2CircleShape = shapes.b2CircleShape;
        b2MouseJointDef = joints.b2MouseJointDef;
        b2DistanceJointDef = joints.b2DistanceJointDef;
        // Inicializa el depurador de Box2D si está disponible
        if (dynamics.b2DebugDraw) {
            b2DebugDraw = dynamics.b2DebugDraw;
        }
        // Establece la gravedad en el mundo físico
        GRAVITY = new b2Vec2(0, 10);
        console.log('Box2D inicializado correctamente');
        return true;
    } catch (e) {
        console.error('Error al inicializar Box2D:', e);
        return false;
    }
}
