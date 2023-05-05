// Variable
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

//Size screen
const SCREEN_WIDTH = window.innerHeight;
const SCREEN_HEIGHT = window.innerHeight;
const CAMERA_NEEDS_POINTER_LOCK = false;

//fps
const TICK = 15;
//Size map cell and image
const CELL_SIZE = 64;

const PLAYER_SIZE = 10;
//Field of view
const FOV = toRadiant(60);

const COLORS = {
    ceiling: "#666666",
    rays: "#ffa600",
    floor: "#752300",
    wall: "#013aa6",
    wallDark: "#012975"
}

canvas.setAttribute("width", SCREEN_WIDTH);
canvas.setAttribute("height", SCREEN_HEIGHT);
//Adding a canvas to body
document.body.appendChild(canvas);
//anti-aliasing off
context.imageSmoothingEnabled = false

//Sprites references
const img = new Image();
img.src = 'src\\img\\wallTexture.png';
const imgWeapon = new Image();
imgWeapon.src = 'src\\img\\weapon.png';
const enemy_sprite = new Image();
enemy_sprite.src = 'src\\img\\enemy.png';

const imageData = context.getImageData(0, 0, 64, 64);
const pixels = imageData.data;

const map = [
    [1, 1, 3, 1, 3, 1, 3, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 5, 5, 5, 0, 0, 3],
    [1, 0, 0, 5, 5, 5, 0, 0, 2],
    [1, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 4, 1, 1, 1, 1],
]

function normalizeAngle(angle) {
    let res = angle;
    if (angle < -Math.PI) {
        res += 2.0 * Math.PI
    }

    if (angle > Math.PI) {
        res -= 2.0 * Math.PI
    }
    return res;
}
//Class for render enemys sprites
class Sprite {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.image = image;

        this.distance = 0;
        this.angle = 0;
        this.visible = false;
    }

    drawSpriteMiniMap(posX = 0, posY = 0, scale = 0.5) {
        context.fillRect(posX + this.x * scale - PLAYER_SIZE / 2, posY + this.y * scale - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)
    }

    drawSprite() {

        var dx = this.x - player.x;
        var dy = this.y - player.y;

        this.distance = distance(this.x, this.y, player.x, player.y)


        var anglePlayerToObject = Math.atan2(dy, dx);
        this.angle = anglePlayerToObject - player.angle

        //Normalize
        this.angle = normalizeAngle(this.angle);

        var scale = canvas.width / this.distance / 2

        var xSprite = canvas.width / 2 + this.angle * canvas.width / FOV - this.image.width * scale / 2
        var ySprite = canvas.height / 2 - (this.image.height) * scale / 2

        for (let i = 0; i <= this.image.width; i++) {

            var p = parseInt(xSprite + i * scale)


            if (this.distance < zBuffer[p]) {
                context.drawImage(
                    this.image,
                    i,
                    0,
                    1,
                    this.image.height,
                    xSprite + i * scale,
                    ySprite,
                    scale,
                    this.image.height * scale);
            }

        }
    }
}

//Player
const player = {
    x: CELL_SIZE * 1.3,
    y: CELL_SIZE * 1.6,
    angle: 0,
    speedX: 0,
    speedY: 0
}

const sprites = []
const zBuffer = []
sprites[0] = new Sprite(200, 100, enemy_sprite);
 sprites[1] = new Sprite(100, 200, enemy_sprite);
 sprites[2] = new Sprite(400, 400, enemy_sprite);

function clearScreen() {
    context.fillStyle = "red"
    context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
}

function outOfMapBounds(x, y) {
    return x < 0 || x >= map[0].length || y < 0 || y >= map.length
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function movePlayer() {

    let wall;
    var xChecker = player.x + Math.cos(player.angle) * player.speedX - Math.sin(player.angle) * player.speedY;
    var yChecker = player.y + Math.sin(player.angle) * player.speedX + Math.cos(player.angle) * player.speedY;

    const cellX = Math.floor(xChecker / CELL_SIZE)
    const cellY = Math.floor(yChecker / CELL_SIZE)

    wall = map[cellY][cellX]

    if (!wall) {
        player.x += Math.cos(player.angle) * player.speedX - Math.sin(player.angle) * player.speedY
        player.y += Math.sin(player.angle) * player.speedX + Math.cos(player.angle) * player.speedY

    }
}

function getVCollision(angle) {
    const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2)

    const firstX = right
        ? Math.floor(player.x / CELL_SIZE) * CELL_SIZE + CELL_SIZE
        : Math.floor(player.x / CELL_SIZE) * CELL_SIZE;

    const firstY = player.y + (firstX - player.x) * Math.tan(angle)

    const xA = right ? CELL_SIZE : -CELL_SIZE
    const yA = xA * Math.tan(angle)

    let idTexture = 0;
    let nextX = firstX;
    let nextY = firstY;

    while (!idTexture) {
        const cellX = right
            ? Math.floor(nextX / CELL_SIZE)
            : Math.floor(nextX / CELL_SIZE) - 1;
        const cellY = Math.floor(nextY / CELL_SIZE)

        if (outOfMapBounds(cellX, cellY)) {
            break
        }

        idTexture = map[cellY][cellX]

        if (!idTexture) {
            nextX += xA
            nextY += yA
        }
    }
    return { angle, distance: distance(player.x, player.y, nextX, nextY), idTexture, wallHit: nextY, vertical: true }
}

function getHCollision(angle) {
    const up = Math.abs(Math.floor(angle / Math.PI) % 2)

    const firstY = up
        ? Math.floor(player.y / CELL_SIZE) * CELL_SIZE
        : Math.floor(player.y / CELL_SIZE) * CELL_SIZE + CELL_SIZE;

    const firstX = player.x + (firstY - player.y) / Math.tan(angle)

    const yA = up ? -CELL_SIZE : CELL_SIZE
    const xA = yA / Math.tan(angle)

    let idTexture = 0;
    let nextX = firstX;
    let nextY = firstY;

    while (!idTexture) {
        const cellX = Math.floor(nextX / CELL_SIZE)
        const cellY = up
            ? Math.floor(nextY / CELL_SIZE) - 1
            : Math.floor(nextY / CELL_SIZE);

        if (outOfMapBounds(cellX, cellY)) {
            break
        }

        idTexture = map[cellY][cellX]

        if (!idTexture) {
            nextX += xA
            nextY += yA
        }
    }

    return { angle, distance: distance(player.x, player.y, nextX, nextY), idTexture, wallHit: nextX, vertical: false }
}

function castRay(angle) {
    const vCollision = getVCollision(angle)
    const hCollision = getHCollision(angle)

    return hCollision.distance > vCollision.distance ? vCollision : hCollision
}

function getRay() {
    const initialAngle = player.angle - FOV / 2;
    const numberOfRay = SCREEN_WIDTH;
    const angleStep = FOV / numberOfRay;

    return Array.from({ length: numberOfRay }, (_, i) => {
        const angle = initialAngle + i * angleStep;
        const ray = castRay(angle)
        return ray
    })
}

function fixFishEyes(distance, angle, playerAngle) {
    const diff = angle - playerAngle;
    return distance * Math.cos(diff);
}

function renderScene(rays) {

    context.fillStyle = COLORS.ceiling;
    context.fillRect(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT / 2
    )

    context.fillStyle = COLORS.floor;
    context.fillRect(
        0,
        SCREEN_HEIGHT / 2,
        SCREEN_WIDTH,
        SCREEN_HEIGHT / 2
    )

    rays.forEach((ray, i) => {

        const distance = fixFishEyes(ray.distance, ray.angle, player.angle);
        const spriteSize = 64;
        const wallHeight = (spriteSize * 2 / distance) * 277
        zBuffer[i] = distance

        var pos = parseInt(ray.wallHit / (spriteSize - 1))

        var pixelTexture = ray.wallHit - pos * (spriteSize - 1)

        context.drawImage(
            img,
            (1 - ray.vertical) * (spriteSize - 1) + pixelTexture,
            (ray.idTexture - 1) * (spriteSize),
            1,
            spriteSize,
            i,
            SCREEN_HEIGHT / 2 - wallHeight / 2,
            1,
            wallHeight
        );
    })
}

function renderMinimap(posX = 0, posY = 0, scale = 1, rays) {
    const cellSize = scale * CELL_SIZE;
    context.fillStyle = "black"
    context.fillRect(posX, posY, map[0].length * cellSize, map.length * cellSize)
    map.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                context.fillStyle = "grey"
                context.fillRect(posX + x * cellSize, posY + y * cellSize, cellSize, cellSize)
            }
        })
    })

    context.strokeStyle = COLORS.rays;
    rays.forEach(ray => {
        context.beginPath()
        context.moveTo(player.x * scale + posX, player.y * scale + posY)
        context.lineTo(
            (player.x + Math.cos(ray.angle) * ray.distance) * scale,
            (player.y + Math.sin(ray.angle) * ray.distance) * scale,
        )
        context.closePath()
        context.stroke()
    })

    context.fillStyle = "red"
    for (let i = 0; i < sprites.length; i++) {
        sprites[i].drawSpriteMiniMap(posX, posY, scale)

    }

    context.fillStyle = "blue"
    context.fillRect(posX + player.x * scale - PLAYER_SIZE / 2, posY + player.y * scale - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)

    const rayLength = PLAYER_SIZE * 2;
    context.strokeStyle = "blue"
    context.beginPath()
    context.moveTo(player.x * scale + posX, player.y * scale + posY)
    context.lineTo(
        (player.x + Math.cos(player.angle) * rayLength) * scale,
        (player.y + Math.sin(player.angle) * rayLength) * scale,
    )
    context.closePath()
    context.stroke()
}

function gameLoop() {
    clearScreen()
    movePlayer()
    const rays = getRay()
    renderScene(rays)

    renderSprites()
    renderMinimap(0, 0, 0.20, rays)
    drawPlayer()
}

function drawPlayer() {
    context.drawImage(imgWeapon, SCREEN_WIDTH / 2 - imgWeapon.width / 2, SCREEN_HEIGHT - imgWeapon.height)
}

function renderSprites() {
    sprites.sort(function (spr1, spr2) {
        return spr2.distance - spr1.distance;
    });

    for (let i = 0; i < sprites.length; i++) {
        sprites[i].drawSprite()

    }
}

function toRadiant(deg) {
    return (deg * Math.PI) / 180
}

setInterval(gameLoop, TICK);

//Input events
let pointerLocked = false;
// Request pointer lock when the canvas is clicked
canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', (e) => {
    if (e.target.pointerLockElement !== canvas){
        pointerLocked = false;
    } else {
        pointerLocked = true;
    }
});

function addCapped(a, b, min, max) {
    let result = a + b;
    result = Math.max(result, min);
    result = Math.min(result, max);
    return result;
}

document.addEventListener("keydown", (e) => {
    let dSpeedX = 0;
    let dSpeedY = 0;
    if (e.key == 'w' || e.key == 'W') {
        dSpeedX = 2;
    }

    if (e.key == 's' || e.key == 'S') {
        dSpeedX = -2;
    }

    if (e.key == 'a' || e.key == 'A') {
        dSpeedY = -2;
    }

    if (e.key == 'd' || e.key == 'D') {
        dSpeedY = 2;
    }
    player.speedX = addCapped(dSpeedX,player.speedX,-2,2);
    player.speedY = addCapped(dSpeedY,player.speedY,-2,2);
})

document.addEventListener("keyup", (e) => {
    let dSpeedX = 0;
    let dSpeedY = 0;
    if (e.key == 'w' || e.key == 'W') {
        dSpeedX = -2;
    }

    if (e.key == 's' || e.key == 'S') {
        dSpeedX = 2;
    }

    if (e.key == 'a' || e.key == 'A') {
        dSpeedY = 2;
    }

    if (e.key == 'd' || e.key == 'D') {
        dSpeedY = -2;
    }
    player.speedX = addCapped(dSpeedX,player.speedX,-2,2);
    player.speedY = addCapped(dSpeedY,player.speedY,-2,2);
})


document.addEventListener("mousemove", function (e) {
    if (!pointerLocked && CAMERA_NEEDS_POINTER_LOCK) return;
    var x = e.clientX;
    var y = e.clientY;

    var w = document.width
    var h = document.height
});


canvas.addEventListener("mousemove", (e) => {
    if (pointerLocked || !CAMERA_NEEDS_POINTER_LOCK)
        player.angle = normalizeAngle(player.angle + toRadiant(e.movementX));
})