import * as constants from "./constants.js";

const enemies = [];

function createEnemies(canvas) {
    const startX =
        (canvas.width -
            (constants.ENEMY_COLS *
                (constants.ENEMY_WIDTH + constants.ENEMY_PADDING) -
                constants.ENEMY_PADDING)) /
        2;
    enemies.length = 0; // Clear existing enemies
    for (let row = 0; row < constants.ENEMY_ROWS; row++) {
        for (let col = 0; col < constants.ENEMY_COLS; col++) {
            enemies.push({
                x:
                    startX +
                    col * (constants.ENEMY_WIDTH + constants.ENEMY_PADDING),
                y:
                    constants.ENEMY_START_Y +
                    row * (constants.ENEMY_HEIGHT + constants.ENEMY_PADDING),
                width: constants.ENEMY_WIDTH,
                height: constants.ENEMY_HEIGHT,
                color: "red",
                rotationOffset: Math.random() * 40 - 20, // Random offset between -20 and 20 degrees
            });
        }
    }
}

function updateEnemies(
    deltaTime,
    canvas,
    enemyDirection,
    setEnemyDirection,
    gameState,
    setGameState
) {
    let shouldChangeDirection = false;

    const totalEnemies = constants.ENEMY_ROWS * constants.ENEMY_COLS;
    const adjustedSpeed =
        enemies.length === 1
            ? Math.floor(
                  constants.ENEMY_SPEED +
                      5 * (totalEnemies - enemies.length) * 0.832
              )
            : Math.floor(
                  constants.ENEMY_SPEED + 1.25 * (totalEnemies - enemies.length)
              );

    enemies.forEach((enemy) => {
        enemy.x += enemyDirection * adjustedSpeed * (deltaTime / 1000);

        // Check if any enemy hits the wall
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            shouldChangeDirection = true;
        }

        if (enemy.x + enemy.width >= canvas.width) {
            enemy.x = canvas.width - enemy.width - 1;
        }

        if (enemy.x <= 0) {
            enemy.x = 1;
        }

        // Check if any enemy reaches the bottom row
        if (enemy.y + enemy.height >= canvas.height) {
            setGameState("gameOver"); // Trigger game over
        }
    });

    // Change direction if needed
    if (shouldChangeDirection) {
        setEnemyDirection(enemyDirection * -1);
        enemies.forEach((enemy) => {
            enemy.y += constants.ENEMY_MOVE_DOWN; // Move enemies down when changing direction
        });
    }

    // Reset all enemies when defeated
    if (enemies.length === 0) {
        setTimeout(() => {
            createEnemies(canvas); // Reset all enemies
            setEnemyDirection(1); // Reset enemy direction
        }, 1000); // Wait 1,000 milliseconds before resetting
    }
}

export { enemies, createEnemies, updateEnemies };
