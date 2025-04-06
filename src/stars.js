// Initialize stars array
const stars = [];

// Initialize stars with random positions and properties
function initializeStars(canvas, STAR_COUNT) {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            color: getRandomColor(), // Assign random colors to stars
            speed: Math.random() * 2.3 + 3,
        });
    }
}

function getRandomColor() {
    const colors = ["white", "yellow", "blue", "red", "green"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Draw stars on the canvas
function drawStars(ctx, canvas, deltaTime) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isNaN(deltaTime) || deltaTime === undefined) {
        console.error("Invalid deltaTime detected: ", deltaTime);
        return;
    }

    stars.forEach((star) => {
        star.y += star.speed * (deltaTime / 150); // Move stars at their individual speeds

        // Loop stars back to the top when they go off-screen
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = star.color;
        ctx.fillRect(star.x, star.y, 1, 1); // STAR_SIZE is 1
    });
}

export { initializeStars, drawStars };
