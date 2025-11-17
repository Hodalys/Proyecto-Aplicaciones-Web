/**
 * INPUT.JS
 * Gestiona la entrada del usuario (mouse y touch)
 */

/**
 * Maneja el evento de presionar el mouse
 * @param {Event} e - Evento del mouse
 */
function handleMouseDown(e) {
    if (currentGameState !== GameState.PLAYING || mouseJoint) return;

    const point = getMouseCoords(e);
    const aabb = new Box2D.Collision.b2AABB();
    aabb.lowerBound.Set(point.x - 0.001, point.y - 0.001);
    aabb.upperBound.Set(point.x + 0.001, point.y + 0.001);

    world.QueryAABB(fixture => {
        const body = fixture.GetBody();
        const userData = body.GetUserData();
        if (userData && userData.type === 'projectile' && body.GetType() === b2Body.b2_dynamicBody) {
            if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), point)) {
                const md = new b2MouseJointDef();
                md.bodyA = ground;
                md.bodyB = body;
                md.target.Set(point.x, point.y);
                md.maxForce = 300.0 * body.GetMass();
                mouseJoint = world.CreateJoint(md);
                body.SetAwake(true);
                body.SetFixedRotation(true);
                isMouseDown = true;
                return false;
            }
        }
        return true;
    }, aabb);
}

/**
 * Maneja el evento de mover el mouse
 * @param {Event} e - Evento del mouse
 */
function handleMouseMove(e) {
    if (!isMouseDown || !mouseJoint) return;
    const point = getMouseCoords(e);
    mouseJoint.SetTarget(new b2Vec2(point.x, point.y));
}

/**
 * Maneja el evento de soltar el mouse
 * @param {Event} e - Evento del mouse
 */
function handleMouseUp(e) {
    if (!isMouseDown || !mouseJoint) return;

    const projectileBody = mouseJoint.GetBodyB();
    world.DestroyJoint(mouseJoint);
    mouseJoint = null;

    if (slingJoint) {
        world.DestroyJoint(slingJoint);
        slingJoint = null;
    }
    
    if (projectileBody.GetUserData()?.type === 'projectile') {
        const catapultPosition = catapult.GetPosition();
        const projectilePosition = projectileBody.GetPosition();
        const forceMultiplier = 25;
        const dx = catapultPosition.x - projectilePosition.x;
        const dy = catapultPosition.y - projectilePosition.y;

        const velX = dx * forceMultiplier / projectileBody.GetMass();
        const velY = dy * forceMultiplier / projectileBody.GetMass();

        projectileBody.SetFixedRotation(false);
        projectileBody.SetLinearVelocity(new b2Vec2(velX, velY));
    }
    
    isMouseDown = false;
    setTimeout(() => {
        currentProjectileIndex++;
        if (currentProjectileIndex < projectiles.length) {
            createNextProjectile();
        } else {
            console.log("Sin proyectiles");
        }
    }, 800);
}

/**
 * Agrega los event listeners para entrada del usuario
 */
function addEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleMouseDown(e.touches[0]); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleMouseMove(e.touches[0]); });
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); handleMouseUp(e.changedTouches[0]); });
}
