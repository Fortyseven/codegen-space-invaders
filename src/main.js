const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Keep canvas size at 320x240
canvas.width = 320;
canvas.height = 240;

// Move stars declaration to the top
const stars = [];

// Add projectiles array
const projectiles = [];

// Add enemies array
const enemies = [];

// Add alien projectiles array
const alienProjectiles = [];

// Add explosions array
const explosions = [];

// Define the player spaceship
const player = {
    x: canvas.width / 2,
    y: canvas.height - 20 - 10,
    width: Math.floor(20 * 0.85),
    height: Math.floor(20 * 0.85),
    color: "green",
};

// Position the player spaceship at the bottom center of the canvas
player.x = canvas.width / 2;
player.y = canvas.height - player.height - 10;

// Load spaceship image
const spaceshipImage = new Image();
spaceshipImage.src = "./assets/spaceship.png";

// Load enemy image
const enemyImage = new Image();
enemyImage.src = "./assets/enemy.png";

// Add variables for score and lives
let score = 0;
let lives = 3;

// Add rotation angle for enemies
let enemyRotationAngle = 0;
let rotationDirection = 1; // 1 for clockwise, -1 for counterclockwise

// Add game state
let gameState = "title"; // 'title', 'playing', 'gameOver'

// Add pause functionality
let isPaused = false;

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        isPaused = !isPaused;
        console.log(`Game ${isPaused ? "paused" : "resumed"}`);
    }
});

// Adjust scaling logic
function resizeCanvas() {
    const scale = Math.min(
        window.innerWidth / canvas.width,
        window.innerHeight / canvas.height
    );
    canvas.style.transform = `scale(${scale})`;
    canvas.style.transformOrigin = "top left";

    // Regenerate stars based on new canvas size
    stars.length = 0;
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            color:
                Math.random() < 0.8
                    ? "white"
                    : Math.random() < 0.5
                    ? "red"
                    : "blue",
        });
    }

    // Reposition the player at the bottom center
    player.x = canvas.width / 2;
    player.y = canvas.height - player.height - 10;

    drawStars();
}

// Add event listener for window resize
window.addEventListener("resize", resizeCanvas);

// Initial canvas size setup
resizeCanvas();

// Add event listeners for player movement
let keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Restrict the number of bullets on screen to 2
window.addEventListener("keydown", (e) => {
    if (e.key === " " && projectiles.length < 2 && gameState === "playing") {
        projectiles.push({
            x: player.x,
            y: player.y - player.height / 2,
            width: Math.floor(2 * 0.85),
            height: Math.floor(4 * 0.85),
            speed: 450, // Increased speed
        });
    }
});

// Initialize enemies
function createEnemies() {
    const rows = 5; // Changed to 5 rows
    const cols = 11; // Changed to 11 columns
    const enemyWidth = Math.floor(20 * 0.85); // Reduced size
    const enemyHeight = Math.floor(20 * 0.85); // Reduced size
    const padding = Math.floor(10 * 0.85 * 0.85); // Reduced spacing by 15%
    const startX =
        (canvas.width - (cols * (enemyWidth + padding) - padding)) / 2;
    const startY = Math.floor(30 * 0.85); // Adjusted starting Y position to be higher

    enemies.length = 0; // Clear existing enemies
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            enemies.push({
                x: startX + col * (enemyWidth + padding),
                y: startY + row * (enemyHeight + padding),
                width: enemyWidth,
                height: enemyHeight,
                color: "red",
                rotationOffset: Math.random() * 40 - 20, // Random offset between -20 and 20 degrees
            });
        }
    }
}

// Call createEnemies to initialize enemies
createEnemies();

// Add variables for enemy movement
let enemyDirection = 1; // 1 for right, -1 for left
const enemySpeed = 5.5; // Reduced speed by 50%

// Adjust enemy speed based on the number of remaining enemies
function updateEnemies(deltaTime) {
    let shouldChangeDirection = false;

    const totalEnemies = 55; // Update to reflect the new grid size
    const adjustedSpeed =
        enemies.length === 1
            ? Math.floor(
                  enemySpeed + 5 * (totalEnemies - enemies.length) * 0.832
              ) // Further reduced last alien speedup by another 20%
            : Math.floor(enemySpeed + 1.25 * (totalEnemies - enemies.length)); // Reduced speed increase by 75%

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
            gameState = "gameOver"; // Trigger game over
        }
    });

    // Change direction if needed
    if (shouldChangeDirection) {
        enemyDirection *= -1;
        enemies.forEach((enemy) => {
            enemy.y += 10; // Move enemies down when changing direction
        });
        console.log(`Direction changed. Enemies moved down.`);
    }
}

// Update rotation angle to 20 degrees
function updateEnemyRotation(deltaTime) {
    const rotationSpeed = 20; // Degrees per second
    enemyRotationAngle +=
        rotationDirection * rotationSpeed * (deltaTime / 1000);

    // Reverse direction when reaching 20 degrees
    if (enemyRotationAngle >= 20) {
        enemyRotationAngle = 20; // Clamp to 20 degrees
        rotationDirection = -1; // Reverse direction
    } else if (enemyRotationAngle <= -20) {
        enemyRotationAngle = -20; // Clamp to -20 degrees
        rotationDirection = 1; // Reverse direction
    }
}

function updateAlienProjectiles(deltaTime) {
    // Move alien projectiles downward
    alienProjectiles.forEach((projectile, index) => {
        projectile.y += Math.floor(projectile.speed * 0.5 * (deltaTime / 1000)); // Reduced alien projectile speed

        // Remove projectiles that go off-screen
        if (projectile.y > canvas.height) {
            alienProjectiles.splice(index, 1);
        }
    });
}

function drawAlienProjectiles() {
    ctx.fillStyle = "red";
    alienProjectiles.forEach((projectile) => {
        ctx.fillRect(
            projectile.x - projectile.width / 2,
            projectile.y,
            projectile.width,
            projectile.height
        );
    });
}

function alienShoot() {
    if (alienProjectiles.length >= 3) return; // Limit to 3 shots on-screen

    // Find the bottom-most enemy in random columns
    const bottomEnemies = {};
    enemies.forEach((enemy) => {
        if (!bottomEnemies[enemy.x] || enemy.y > bottomEnemies[enemy.x].y) {
            bottomEnemies[enemy.x] = enemy;
        }
    });

    const columns = Object.values(bottomEnemies);
    if (columns.length > 0) {
        const shooter = columns[Math.floor(Math.random() * columns.length)];
        alienProjectiles.push({
            x: shooter.x + shooter.width / 2,
            y: shooter.y + shooter.height,
            width: Math.floor(2 * 0.85),
            height: Math.floor(4 * 0.85),
            speed: 300,
        });
    }
}

// Update explosions
function updateExplosions(deltaTime) {
    explosions.forEach((explosion, index) => {
        explosion.scale += 0.65625 * (deltaTime / 1000); // Scale up 50% faster
        explosion.opacity -= 1.3125 * (deltaTime / 1000); // Fade out 50% faster

        if (explosion.opacity <= 0) {
            explosions.splice(index, 1); // Remove explosion when fully faded
        }
    });
}

// Initialize WebGL context
const glCanvas = document.createElement("canvas");
const gl = glCanvas.getContext("webgl");
if (!gl) {
    console.error("WebGL not supported");
}

glCanvas.width = canvas.width;
glCanvas.height = canvas.height;

// Vertex shader source
const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
    }
`;

// Fragment shader source for white explosion effect
const fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_image;
    uniform float u_opacity;

    void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        if (color.a > 0.0) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, color.a * u_opacity);
        } else {
            discard;
        }
    }
`;

// Compile shader
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

// Link program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
}

gl.useProgram(program);

// Set up attributes and uniforms
const positionLocation = gl.getAttribLocation(program, "a_position");
const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
const opacityLocation = gl.getUniformLocation(program, "u_opacity");

// Create buffer for positions
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Create buffer for texture coordinates
const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
const texCoords = [
    0, 0,
    1, 0,
    0, 1,
    1, 1,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

gl.enableVertexAttribArray(texCoordLocation);
gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

// Create texture
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

function drawExplosionWithShader(explosion, image) {
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
    );

    gl.uniform1f(opacityLocation, explosion.opacity); // Ensure opacity is passed to the shader

    // Set up position and scale for the explosion
    const x = (explosion.x / canvas.width) * 2 - 1;
    const y = 1 - (explosion.y / canvas.height) * 2;
    const scaleX = (explosion.width * explosion.scale) / canvas.width;
    const scaleY = (explosion.height * explosion.scale) / canvas.height;

    const positions = [
        x - scaleX, y - scaleY,
        x + scaleX, y - scaleY,
        x - scaleX, y + scaleY,
        x + scaleX, y + scaleY,
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Copy WebGL canvas to 2D canvas
    ctx.globalAlpha = explosion.opacity; // Apply fading effect
    ctx.drawImage(glCanvas, 0, 0);
    ctx.globalAlpha = 1.0; // Reset alpha to default
}

function drawExplosions() {
    explosions.forEach((explosion) => {
        drawExplosionWithShader(explosion, enemyImage);
    });
}

// Game state
let lastTime = 0;

function drawTitleScreen() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SPACE INVADERS", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "20px Arial";
    ctx.fillText(
        "Press SPACE to Start",
        canvas.width / 2,
        canvas.height / 2 + 10
    );
}

function drawGameOverScreen() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "20px Arial";
    ctx.fillText(
        "Press SPACE to Restart",
        canvas.width / 2,
        canvas.height / 2 + 10
    );
}

window.addEventListener("keydown", (e) => {
    if (e.key === " " && gameState === "title") {
        gameState = "playing";
        score = 0;
        lives = 3;
        enemies.length = 0;
        alienProjectiles.length = 0;
        createEnemies();
    } else if (e.key === " " && gameState === "gameOver") {
        gameState = "title";
    }
});

// Game loop
function gameLoop(timestamp) {
    if (isPaused) {
        lastTime = timestamp; // Reset lastTime to prevent deltaTime accumulation
        requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "title") {
        drawStars();
        drawTitleScreen();
    } else if (gameState === "playing") {
        drawStars();
        updatePlayer(deltaTime);
        updateProjectiles(deltaTime);
        updateEnemies(deltaTime); // Update enemies movement
        updateAlienProjectiles(deltaTime); // Update alien projectiles
        updateEnemyRotation(deltaTime); // Update enemy rotation
        updateExplosions(deltaTime); // Update explosions
        checkCollisions(); // Check for collisions
        drawPlayer();
        drawProjectiles();
        drawEnemies();
        drawAlienProjectiles(); // Draw alien projectiles
        drawExplosions(); // Draw explosions
        drawUI(); // Draw UI layer

        // Randomly trigger alien shooting
        if (Math.random() < 0.01) {
            alienShoot();
        }

        if (lives <= 0) {
            gameState = "gameOver";
        }
    } else if (gameState === "gameOver") {
        drawStars();
        drawGameOverScreen();
    }

    requestAnimationFrame(gameLoop);
}

// Ensure the background is always black
function drawStars() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach((star) => {
        ctx.fillStyle = star.color;
        ctx.fillRect(star.x, star.y, 2, 2);
    });
}

// Draw the player spaceship
function drawPlayer() {
    ctx.drawImage(
        spaceshipImage,
        player.x - player.width / 2,
        player.y - player.height / 2,
        player.width,
        player.height
    );
}

function updatePlayer(deltaTime) {
    const speed = 100; // Reduced player speed

    if (keys["ArrowLeft"] && player.x - player.width / 2 > 0) {
        player.x -= Math.floor(speed * (deltaTime / 1000));
    }
    if (keys["ArrowRight"] && player.x + player.width / 2 < canvas.width) {
        player.x += Math.floor(speed * (deltaTime / 1000));
    }
}

function updateProjectiles(deltaTime) {
    // Move projectiles upward
    projectiles.forEach((projectile, index) => {
        projectile.y -= Math.floor(projectile.speed * 0.5 * (deltaTime / 1000)); // Reduced projectile speed

        // Update projectile dimensions
        projectile.width = Math.floor(2 * 0.85);
        projectile.height = Math.floor(4 * 0.85);

        // Remove projectiles that go off-screen
        if (projectile.y + projectile.height < 0) {
            projectiles.splice(index, 1);
        }
    });
}

function drawProjectiles() {
    ctx.fillStyle = "white";
    projectiles.forEach((projectile) => {
        ctx.fillRect(
            projectile.x - projectile.width / 2,
            projectile.y,
            projectile.width,
            projectile.height
        );
    });
}

function drawEnemies() {
    enemies.forEach((enemy) => {
        ctx.save();
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        ctx.rotate(
            ((enemyRotationAngle + enemy.rotationOffset) * Math.PI) / 180
        );
        ctx.drawImage(
            enemyImage,
            -enemy.width / 2,
            -enemy.height / 2,
            enemy.width,
            enemy.height
        );
        ctx.restore();
    });
}

function checkCollisions() {
    projectiles.forEach((projectile, pIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                projectile.x < enemy.x + enemy.width &&
                projectile.x + projectile.width > enemy.x &&
                projectile.y < enemy.y + enemy.height &&
                projectile.y + projectile.height > enemy.y
            ) {
                // Add explosion effect
                explosions.push({
                    x: enemy.x,
                    y: enemy.y,
                    width: enemy.width,
                    height: enemy.height,
                    scale: 1,
                    opacity: 1,
                });

                // Remove the enemy and the projectile
                enemies.splice(eIndex, 1);
                projectiles.splice(pIndex, 1);

                // Increase score by 5 points
                score += 5;
            }
        });
    });

    alienProjectiles.forEach((projectile, pIndex) => {
        // Update alien projectile dimensions
        projectile.width = Math.floor(2 * 0.85);
        projectile.height = Math.floor(4 * 0.85);

        if (
            projectile.x > player.x - player.width / 2 &&
            projectile.x < player.x + player.width / 2 &&
            projectile.y > player.y - player.height / 2 &&
            projectile.y < player.y + player.height / 2
        ) {
            // Remove the alien projectile
            alienProjectiles.splice(pIndex, 1);

            // Decrease lives
            lives -= 1;
        }
    });

    // Check if any enemy touches the player
    enemies.forEach((enemy) => {
        if (
            enemy.x < player.x + player.width / 2 &&
            enemy.x + enemy.width > player.x - player.width / 2 &&
            enemy.y < player.y + player.height / 2 &&
            enemy.y + enemy.height > player.y - player.height / 2
        ) {
            gameState = "gameOver"; // Trigger game over
        }
    });
}

function drawUI() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";

    // Draw score in the top left corner
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 10, 15);

    // Draw lives in the top right corner
    ctx.textAlign = "right";
    ctx.fillText(`Lives: ${lives}`, canvas.width - 10, 15);
}

// Start the game loop
requestAnimationFrame(gameLoop);
