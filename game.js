let dino;
let cacti = [];
let ground;

let cactusImg, dinoImg, groundImg;
let gameStarted = false;
let score = 0;
let highScore = 0;
let elapsedTime = 0;
let difficultyLevel = 1;
let music;
let sound;
let soundInitialized = false;

// Define minDinoY before the Dino class
let minDinoY = 512;

function preload() {
  console.log("Preloading...");
  cactusImg = loadImage("img game/cactus.png");
  dinoImg = loadImage("img game/dino-stationary.png");
  groundImg = loadImage("img game/ground.png");

  music = loadSound('sound/Drake - Fair Trade (Audio) ft. Travis Scott-2.mp3', soundLoaded, soundError);
  sound = loadSound('sound/anita.mp3', soundLoaded, soundError);
}

function soundLoaded() {
  console.log("Sound file loaded successfully!");
}

function soundError(event) {
  console.error("Error loading sound file:", event);
}

function setup() {
  createCanvas(1850, 900);
  dino = new Dino();
  ground = new Ground();

  if (music) {
    music.setVolume(0.5);
  }
}

function keyPressed() {
  if (!gameStarted && (key === ' ' || keyCode === 32)) {
    restartGame();
  } else if (gameStarted && key === ' ') {
    dino.jump();
  }
}

function mousePressed() {
  if (!gameStarted) {
    restartGame();
  }
}

function restartGame() {
  score = 0;
  cacti = [];
  dino = new Dino();
  gameStarted = true;
  difficultyLevel = 1;
  elapsedTime = 0;

  if (!soundInitialized) {
    if (sound) {
      sound.setVolume(0.5);
      soundInitialized = true;
    }
  } else {
    sound.play();
  }
  if (music && !music.isPlaying()) {
    music.setVolume(0.5);
    music.loop();
  }

  loop();
}

function draw() {
  background(255);

  if (music && !music.isPlaying() && gameStarted) {
    music.setVolume(0.5);
    music.loop();
  }

  if (gameStarted) {
    elapsedTime += 1;
    ground.show();
    dino.show();
    if (frameCount % (60 - floor(elapsedTime / (150 * difficultyLevel))) === 0) {
      cacti.push(new Cactus());
    }
    for (let i = cacti.length - 1; i >= 0; i--) {
      cacti[i].show();
      cacti[i].update();

      if (cacti[i].hits(dino)) {
        console.log("Game over!");

        if (music && music.isPlaying()) {
          music.stop();
        }

        if (sound) {
          sound.setVolume(0.5);
          sound.play();
        }

        gameStarted = false;
      }
      if (cacti[i].offscreen()) {
        cacti.splice(i, 1);
        score += 5;
        highScore = max(highScore, score);
        difficultyLevel = max(difficultyLevel, 1 + floor(score / 50));
      }
    }

    fill(0);
    textSize(16);
    textAlign(RIGHT);
    text(`Score: ${score}`, 80, 20);
    text(`High Score: ${highScore}`, width - 30, 20);
  } else if (gameStarted === false && score > 0) {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2 - 40);
    text(`Score: ${score}`, width / 2, height / 2);
    text("Click to Restart", width / 2, height / 2 + 40);
  } else {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Press SPACE to start", width / 2, height / 2);
  }
}

class Dino {
  constructor() {
    this.x = 50;
    this.y = 300;
    this.velocityY = 0;
    this.gravity = 0.5;
    this.height = 50;
    this.width = 50;
    this.isJumping = false;
    this.currentFrame = 0;
    this.frames = [dinoImg, loadImage("img game/dino-run-0.png"), loadImage("img game/dino-run-1.png")];
  }

  show() {
    let animationSpeed = 0.2;
    if (this.isJumping) {
      image(dinoImg, this.x, this.y - this.height, this.width, this.height);
    } else {
      this.currentFrame = (this.currentFrame + animationSpeed) % this.frames.length;
      image(this.frames[Math.floor(this.currentFrame)], this.x, this.y - this.height, this.width, this.height);
    }

    this.y += this.velocityY;
    this.velocityY += this.gravity;

    if (this.y > minDinoY) {
      this.y = minDinoY;
      this.velocityY = 0;
    }
  }

  jump() {
    const threshold = 1;

    if (abs(this.y - minDinoY) < threshold) {
      this.velocityY = -10;
      this.isJumping = true;
    }
  }

}

class Cactus {
  constructor() {
    this.x = width;
    this.y = random(900 / 1.75, 900 / 1.80);
    this.width = 20;
    this.height = 50;
    this.velocityX = -5;
  }

  show() {
    image(cactusImg, this.x, this.y - this.height, this.width, this.height);
  }

  update() {
    this.x += this.velocityX;
  }

  offscreen() {
    return this.x < -this.width;
  }

  hits(dino) {
    const cactusX = this.x + this.width * 0.2;
    const cactusY = this.y - this.height * 0.7;
    const cactusWidth = this.width * 0.6;
    const cactusHeight = this.height * 0.6;

    const dinoX = dino.x + dino.width * 0.2;
    const dinoY = dino.y - dino.height * 0.5;
    const dinoWidth = dino.width * 0.6;
    const dinoHeight = dino.height * 0.5;

    return (
      dinoX + dinoWidth > cactusX &&
      dinoX < cactusX + cactusWidth &&
      dinoY + dinoHeight > cactusY &&
      dinoY < cactusY + cactusHeight
    );
  }
}

class Ground {
  constructor() {
    this.x1 = 0;
    this.x2 = width;
    this.y = windowHeight / 2;
    this.width = width;
    this.height = 30;
    this.velocityX = -5;
  }

  show() {
    image(groundImg, this.x1, this.y, this.width, this.height);
    image(groundImg, this.x2, this.y, this.width, this.height);

    this.x1 += this.velocityX;
    this.x2 += this.velocityX;

    if (this.x1 < -width) {
      this.x1 = width;
    }

    if (this.x2 < -width) {
      this.x2 = width;
    }
  }
}
