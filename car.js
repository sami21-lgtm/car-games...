const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const menu = document.getElementById("menu");
const dlLink = document.getElementById("dl-link"); // Download link element

// Canvas dimensions
canvas.width = 400;
canvas.height = 600;

let score = 0;
let gameRunning = false;
let speed = 5; // Initial game speed
let player = { x: 175, y: 480, w: 50, h: 90 }; // Player car properties
let enemies = []; // Array for enemy cars
let coins = []; // Array for coins
let lineOffset = 0; // For animating road lines

function startGame() {
    menu.classList.add("hidden"); // Hide menu
    score = 0;
    speed = 5;
    enemies = [];
    coins = [];
    player.x = 175; // Reset player position
    scoreEl.innerText = score;
    gameRunning = true;
    update(); // Start game loop
}

// Player car movement (Touch/Click)
window.addEventListener("mousedown", movePlayer);
window.addEventListener("touchstart", (e) => {
    movePlayer(e.touches[0]);
});

function movePlayer(event) {
    if(!gameRunning) return;
    const clientX = event.clientX;
    if(clientX < window.innerWidth / 2) { // Move left
        if(player.x > 60) player.x -= 80;
    } else { // Move right
        if(player.x < 260) player.x += 80;
    }
}

// Function to draw the player's red car
function drawPlayerCar() {
    // Main Body (Red)
    ctx.fillStyle = "#ff4757";
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, 50, 90, 10);
    ctx.fill();
    // Windows (Dark Grey)
    ctx.fillStyle = "#333";
    ctx.fillRect(player.x + 10, player.y + 25, 30, 35);
    // Headlights (Yellow)
    ctx.fillStyle = "yellow";
    ctx.fillRect(player.x + 5, player.y + 5, 10, 5);
    ctx.fillRect(player.x + 35, player.y + 5, 10, 5);
    // White Stripes
    ctx.fillStyle = "white";
    ctx.fillRect(player.x + 22, player.y, 6, 90);
}

// Function to draw an enemy car (Blue)
function drawEnemyCar(x, y) {
    ctx.fillStyle = "#1e90ff"; // Blue color
    ctx.beginPath();
    ctx.roundRect(x, y, 50, 80, 8);
    ctx.fill();
    // Window for enemy car
    ctx.fillStyle = "#333";
    ctx.fillRect(x + 10, y + 15, 30, 25);
}

// Function to draw a coin
function drawCoin(x, y) {
    ctx.fillStyle = "gold";
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b8860b"; // Darker gold outline
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = "bold 10px Arial"; // "$ " text on coin
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", x, y);
}


// Main game loop
function update() {
    if(!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Road Background (Dark Grey)
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grass (Green) on sides
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(0, 0, 40, canvas.height);
    ctx.fillRect(canvas.width - 40, 0, 40, canvas.height);
    
    // Draw Animated Road Lines (White Dashed)
    lineOffset += speed;
    if(lineOffset > 40) lineOffset = 0;
    ctx.strokeStyle = "white";
    ctx.setLineDash([20, 20]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, -40 + lineOffset);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    drawPlayerCar(); // Draw player's red car

    // Handle Enemy Cars
    if(Math.random() < 0.02) { // Spawn new enemy cars randomly
        const lanes = [60, 140, 220, 300]; // Possible lane positions
        enemies.push({ x: lanes[Math.floor(Math.random() * lanes.length)], y: -100 });
    }
    enemies.forEach((e, i) => {
        e.y += speed;
        drawEnemyCar(e.x, e.y); // Draw enemy car
        
        // Collision Detection with player car
        if(player.x < e.x + 50 && player.x + 50 > e.x && player.y < e.y + 80 && player.y + 90 > e.y) {
            gameOver(); // Call game over on collision
        }
        // Remove enemy if off-screen
        if(e.y > canvas.height) enemies.splice(i, 1);
    });

    // Handle Coins
    if(Math.random() < 0.015) { // Spawn new coins randomly
        coins.push({ x: 60 + Math.random() * 280, y: -50 });
    }
    coins.forEach((c, i) => {
        c.y += speed;
        drawCoin(c.x, c.y); // Draw coin
        
        // Coin Collection detection
        const dist = Math.hypot(player.x + 25 - c.x, player.y + 45 - c.y);
        if(dist < 35) { // If player car is close to coin
            coins.splice(i, 1);
            score += 10;
            scoreEl.innerText = score;
            speed += 0.1; // Increase speed slightly with score
        }
        // Remove coin if off-screen
        if(c.y > canvas.height) coins.splice(i, 1);
    });

    requestAnimationFrame(update); // Continue game loop
}

function gameOver() {
    gameRunning = false;
    menu.classList.remove("hidden"); // Show menu again
    menu.innerHTML = `
        <h1 class="game-title" style="color:#ff4757">BOOM! CRASHED</h1>
        <p class="game-subtitle">You collected ${score} coins!</p>
        <button class="btn btn-start" onclick="startGame()">TRY AGAIN 🏎️</button>
        <a class="btn btn-download" href="#" download="SuperRedRacer.html" id="restart-dl-link">DOWNLOAD GAME ⬇️</a>
    `;
    // Re-prepare download link for the game over screen
    const restartDlLink = document.getElementById("restart-dl-link");
    if (restartDlLink) {
        prepareDownload(restartDlLink);
    }
}

// Function to prepare the download link
function prepareDownload(linkElement = dlLink) {
    const fullHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Red Racer - Kids Edition</title>
    <style>${document.querySelector('style').innerHTML}</style>
</head>
<body>
    <div id="game-container">
        <div id="ui">Coins: <span id="score">0</span></div>
        <div id="menu" class="overlay-screen">
            <h1 class="game-title">RED RACER</h1>
            <p class="game-subtitle">Collect Coins & Avoid Cars!</p>
            <button class="btn btn-start" onclick="startGame()">START GAME 🏎️</button>
            <a class="btn btn-download" href="#" download="SuperRedRacer.html" id="dl-button">DOWNLOAD GAME ⬇️</a>
        </div>
        <canvas id="gameCanvas"></canvas>
    </div>
    <script>
        // --- Start of Game Script ---
        ${document.getElementById('script.js') ? document.getElementById('script.js').innerHTML : `
        // Fallback for script if not loaded correctly in previous step
        // All JavaScript game logic here (same as original script.js content)
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        const scoreEl = document.getElementById("score");
        const menu = document.getElementById("menu");
        const dlLink = document.getElementById("dl-link"); 

        canvas.width = 400;
        canvas.height = 600;

        let score = 0;
        let gameRunning = false;
        let speed = 5; 
        let player = { x: 175, y: 480, w: 50, h: 90 }; 
        let enemies = []; 
        let coins = []; 
        let lineOffset = 0; 

        function startGame() {
            menu.classList.add("hidden"); 
            score = 0;
            speed = 5;
            enemies = [];
            coins = [];
            player.x = 175; 
            scoreEl.innerText = score;
            gameRunning = true;
            update(); 
        }

        window.addEventListener("mousedown", movePlayer);
        window.addEventListener("touchstart", (e) => {
            movePlayer(e.touches[0]);
        });

        function movePlayer(event) {
            if(!gameRunning) return;
            const clientX = event.clientX;
            if(clientX < window.innerWidth / 2) { 
                if(player.x > 60) player.x -= 80;
            } else { 
                if(player.x < 260) player.x += 80;
            }
        }

        function drawPlayerCar() {
            ctx.fillStyle = "#ff4757";
            ctx.beginPath();
            ctx.roundRect(player.x, player.y, 50, 90, 10);
            ctx.fill();
            ctx.fillStyle = "#333";
            ctx.fillRect(player.x + 10, player.y + 25, 30, 35);
            ctx.fillStyle = "yellow";
            ctx.fillRect(player.x + 5, player.y + 5, 10, 5);
            ctx.fillRect(player.x + 35, player.y + 5, 10, 5);
            ctx.fillStyle = "white";
            ctx.fillRect(player.x + 22, player.y, 6, 90);
        }

        function drawEnemyCar(x, y) {
            ctx.fillStyle = "#1e90ff"; 
            ctx.beginPath();
            ctx.roundRect(x, y, 50, 80, 8);
            ctx.fill();
            ctx.fillStyle = "#333";
            ctx.fillRect(x + 10, y + 15, 30, 25);
        }

        function drawCoin(x, y) {
            ctx.fillStyle = "gold";
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#b8860b"; 
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = "bold 10px Arial"; 
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("$", x, y);
        }

        function update() {
            if(!gameRunning) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#333";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#2ecc71";
            ctx.fillRect(0, 0, 40, canvas.height);
            ctx.fillRect(canvas.width - 40, 0, 40, canvas.height);
            
            lineOffset += speed;
            if(lineOffset > 40) lineOffset = 0;
            ctx.strokeStyle = "white";
            ctx.setLineDash([20, 20]);
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, -40 + lineOffset);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();

            drawPlayerCar(); 

            if(Math.random() < 0.02) { 
                const lanes = [60, 140, 220, 300]; 
                enemies.push({ x: lanes[Math.floor(Math.random() * lanes.length)], y: -100 });
            }
            enemies.forEach((e, i) => {
                e.y += speed;
                drawEnemyCar(e.x, e.y); 
                
                if(player.x < e.x + 50 && player.x + 50 > e.x && player.y < e.y + 80 && player.y + 90 > e.y) {
                    gameOver(); 
                }
                if(e.y > canvas.height) enemies.splice(i, 1);
            });

            if(Math.random() < 0.015) { 
                coins.push({ x: 60 + Math.random() * 280, y: -50 });
            }
            coins.forEach((c, i) => {
                c.y += speed;
                drawCoin(c.x, c.y); 
                
                const dist = Math.hypot(player.x + 25 - c.x, player.y + 45 - c.y);
                if(dist < 35) { 
                    coins.splice(i, 1);
                    score += 10;
                    scoreEl.innerText = score;
                    speed += 0.1;
                }
                if(c.y > canvas.height) coins.splice(i, 1);
            });

            requestAnimationFrame(update);
        }

        function gameOver() {
            gameRunning = false;
            menu.classList.remove("hidden"); 
            menu.innerHTML = \`
                <h1 class="game-title" style="color:#ff4757">BOOM! CRASHED</h1>
                <p class="game-subtitle">You collected \${score} coins!</p>
                <button class="btn btn-start" onclick="startGame()">TRY AGAIN 🏎️</button>
                <a class="btn btn-download" href="#" download="SuperRedRacer.html" id="restart-dl-link">DOWNLOAD GAME ⬇️</a>
            \`;
            const restartDlLink = document.getElementById("restart-dl-link");
            if (restartDlLink) {
                prepareDownload(restartDlLink);
            }
        }
        `}
        // --- End of Game Script ---
    <\/script>
</body>
</html>`;

    const blob = new Blob([fullHtmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    linkElement.href = url;
}

// Prepare download link when the page first loads
window.onload = function() {
    prepareDownload(dlLink);
    // Ensure the download link in game over screen also works
    document.body.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'restart-dl-link') {
            prepareDownload(event.target);
        }
    });
};

// Also prepare on initial load for direct access
if (dlLink) {
    dlLink.addEventListener('click', (e) => {
        // Prevent default behavior to allow prepareDownload to set the href correctly
        if (!dlLink.href.startsWith("blob:")) {
            e.preventDefault();
            prepareDownload(dlLink);
            // After setting href, simulate click again
            setTimeout(() => e.target.click(), 100);
        }
    });
}
