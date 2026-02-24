// description: This example demonstrates how to use a Container to group and manipulate multiple sprites
import { Application, Assets, Container, Sprite, AnimatedSprite, Graphics, Rectangle, Text } from 'pixi.js';
import { sound } from '@pixi/sound';

(async () => {
  // Create a new application
  const app = new Application();
  await app.init({
    background: '#3C3C3C',
    resizeTo: document.getElementById('pixi-container')! // Resize to fit this div
  });
  document.getElementById('pixi-container')!.appendChild(app.canvas);

  const gameContainer = new Container();
  app.stage.addChild(gameContainer);

  // Game constants - Display
  const GAME_WIDTH = 320;   // Reference width
  const GAME_HEIGHT = 180;  // Reference height (16:9 aspect ratio)
  // Game constants - Speed & Difficulty
  const INITIAL_GAME_SPEED = 5;
  const SPEED_INCREASE_INTERVAL = 25; // Increase speed every this many points
  const SPEED_INCREASE_AMOUNT = 0.5; // How much the game speed increases every [INTERVAL] points
  const MAX_GAME_SPEED = 16; // game speed will not exceed this value
  // Game constants - Physics
  const JUMP_STRENGTH = -8;
  const GRAVITY = 0.5;
  // Game constants - Obstacles
  const OBSTACLE_MIN_DISTANCE = 200;
  const OBSTACLE_MAX_DISTANCE = 600;

  // Music playlist
  const MUSIC_PLAYLIST = [
    '/assets/sound/FruitJumpStreetSong.mp3',
    '/assets/sound/AmoebaLevel.mp3',
    '/assets/sound/BugLevel.mp3',
    '/assets/sound/FruitLevel.mp3',
    '/assets/sound/ApplianceLevel.mp3',
    '/assets/sound/FurnitureLevel.mp3',
    '/assets/sound/CarLevel.mp3',
  ];
  // Sound effect locations
  const JUMP_SOUND_PATH = '/assets/sound/jump_digital.wav';
  sound.add('jump', JUMP_SOUND_PATH);
  const SCORE_SOUND_PATH = '/assets/sound/score_digital_D.wav';
  sound.add('score', SCORE_SOUND_PATH);
  const SCORE_SPEED_INCREASE_SOUND_PATH = '/assets/sound/score_digital_F.wav';
  sound.add('score_speed_increase', SCORE_SPEED_INCREASE_SOUND_PATH);

  let gameSpeed = INITIAL_GAME_SPEED;
  let score = 0;
  let isGameOver = false;
  let nextSpeedIncreaseScore = SPEED_INCREASE_INTERVAL;

  /*
  Create background texture layers:
  */
  // Load the textures - Streets level
  // const bgTexture = await Assets.load('/assets/images/levels/street/street_background.png');
  // const cloudsTexture = await Assets.load('/assets/images/levels/street/street_clouds.png');
  // const plantsTexture = await Assets.load('/assets/images/levels/street/street_plants.png');
  // Load the textures - Amoeba level
  const bgTexture = await Assets.load('/assets/images/levels/amoeba/amoeba_background.png');
  const cloudsTexture = await Assets.load('/assets/images/levels/amoeba/amoeba_streaks.png');
  const plantsTexture = await Assets.load('/assets/images/levels/amoeba/amoeba_accents.png');

  // Load all 5 player frames
  const playerWalkFrames = await Assets.load([
    '/assets/images/player/blue_man_walk_0.png',
    '/assets/images/player/blue_man_walk_1.png',
    '/assets/images/player/blue_man_walk_2.png',
    '/assets/images/player/blue_man_walk_3.png',
    '/assets/images/player/blue_man_walk_4.png'
  ]);
  // Load all obstacle textures (fruits etc.)
  const obstacleTextures = await Assets.load([
    '/assets/images/fruits/avocado_toast.png',
    '/assets/images/fruits/banana.png',
    '/assets/images/fruits/cat_food.png',
    '/assets/images/fruits/energy_drink_sf.png',
    '/assets/images/fruits/energy_drink.png',
    '/assets/images/fruits/granny_smith.png',
    '/assets/images/fruits/red_delicious.png',
    '/assets/images/fruits/watermelon.png',
  ]);
  // Function to get random obstacle texture
  function getRandomObstacleTexture() {
    const textures = Object.values(obstacleTextures);
    return textures[Math.floor(Math.random() * textures.length)];
  }

  /*
  Setup music player:
  */
  // Load all music files
  await Promise.all(
    MUSIC_PLAYLIST.map((path, index) =>
      sound.add(`track${index}`, path)
    )
  );
let currentTrackIndex = 0;
let musicStarted = false;
function playNextTrack() {
    const trackName = `track${currentTrackIndex}`;
    sound.play(trackName, {
      volume: 0.5,
      complete: () => {
        currentTrackIndex = (currentTrackIndex + 1) % MUSIC_PLAYLIST.length;
        playNextTrack();
      }
    });
  }
  // Start music on first user interaction
  function startMusic() {
    if (!musicStarted) {
      musicStarted = true;
      playNextTrack();
    }
  }

  // Function to check if two sprites are colliding using their hitAreas
  function checkCollision(sprite1: Sprite | AnimatedSprite, sprite2: Sprite) {
    const pos1 = sprite1.getGlobalPosition();
    const pos2 = sprite2.getGlobalPosition();

    // Get the container scale
    const containerScale = gameContainer.scale.x;

    // Player hitbox: -10, -25, 20, 25 (scaled by container and sprite scale)
    const player = {
      x: pos1.x + (-10 * Math.abs(sprite1.scale.x) * containerScale),
      y: pos1.y + (-25 * Math.abs(sprite1.scale.y) * containerScale),
      width: 20 * Math.abs(sprite1.scale.x) * containerScale,
      height: 25 * Math.abs(sprite1.scale.y) * containerScale
    };

    // Obstacle hitbox: -12, -20, 24, 20 (scaled by container and sprite scale)
    const obstacle = {
      x: pos2.x + (-12 * Math.abs(sprite2.scale.x) * containerScale),
      y: pos2.y + (-20 * Math.abs(sprite2.scale.y) * containerScale),
      width: 24 * Math.abs(sprite2.scale.x) * containerScale,
      height: 20 * Math.abs(sprite2.scale.y) * containerScale
    };

    return player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacle.height &&
      player.y + player.height > obstacle.y;
  }

  /*
  Create background sprites and add to container:
  */
  // Background (bottom layer)
  const bgSprite1 = new Sprite(bgTexture);
  bgSprite1.anchor.set(0.5);
  bgSprite1.position.set(0, 0);
  gameContainer.addChild(bgSprite1);

  const bgSprite2 = new Sprite(bgTexture);
  bgSprite2.anchor.set(0.5);
  bgSprite2.position.set(bgTexture.width, 0);
  gameContainer.addChild(bgSprite2);

  // Clouds (middle layer - add BEFORE plants)
  const cloudsSprite1 = new Sprite(cloudsTexture);
  cloudsSprite1.anchor.set(0.5);
  cloudsSprite1.position.set(0, 0);
  gameContainer.addChild(cloudsSprite1);

  const cloudsSprite2 = new Sprite(cloudsTexture);
  cloudsSprite2.anchor.set(0.5);
  cloudsSprite2.position.set(cloudsTexture.width, 0);
  gameContainer.addChild(cloudsSprite2);

  // Plants/trees (top layer - add AFTER clouds)
  const plantsSprite1 = new Sprite(plantsTexture);
  plantsSprite1.anchor.set(0.5);
  plantsSprite1.position.set(0, 0);
  gameContainer.addChild(plantsSprite1);

  const plantsSprite2 = new Sprite(plantsTexture);
  plantsSprite2.anchor.set(0.5);
  plantsSprite2.position.set(plantsTexture.width, 0);
  gameContainer.addChild(plantsSprite2);

  // ground y position
  const GROUND_Y = GAME_HEIGHT / 2 - 40;

  /*
  Create player sprite:
  */
  const playerSprite = new AnimatedSprite(Object.values(playerWalkFrames));
  playerSprite.animationSpeed = 10 / 60;
  playerSprite.play();
  playerSprite.anchor.set(0.5, 1);
  playerSprite.scale.x = -1;
  playerSprite.scale.y = 1;
  playerSprite.position.set(
    -GAME_WIDTH / 2 + 60,
    GROUND_Y
  );
  // Add hitbox for player (smaller than visual sprite)
  playerSprite.hitArea = new Rectangle(-10, -25, 20, 25); // Adjust these values
  gameContainer.addChild(playerSprite);
  // DEBUG: show player hitbox in red
  // const playerHitboxGraphic = new Graphics();
  // playerHitboxGraphic.rect(-10, -25, 20, 25);
  // playerHitboxGraphic.stroke({ width: 2, color: 0xff0000 });
  // playerSprite.addChild(playerHitboxGraphic);

  /* 
  Create obstacle sprite with random texture:
  */
  const obstacleSprite = new Sprite(getRandomObstacleTexture());
  obstacleSprite.anchor.set(0.5, 1);
  obstacleSprite.scale.set(1);
  obstacleSprite.position.set(
    GAME_WIDTH / 2 + 100,
    GROUND_Y
  );
  // Add hitbox for obstacle (smaller than visual sprite)
  obstacleSprite.hitArea = new Rectangle(-12, -20, 24, 20); // Adjust these values
  gameContainer.addChild(obstacleSprite);
  // DEBUG: show obstacle hitbox in red
  // const obstacleHitboxGraphic = new Graphics();
  // obstacleHitboxGraphic.rect(-12, -20, 24, 20);
  // obstacleHitboxGraphic.stroke({ width: 2, color: 0xff0000 });
  // obstacleSprite.addChild(obstacleHitboxGraphic);

  /*
  Create the mask to limit visible area:
  */
  // Create a mask rectangle
  const mask = new Graphics();
  mask.rect(
    -GAME_WIDTH / 2,
    -GAME_HEIGHT / 2,
    GAME_WIDTH,
    GAME_HEIGHT
  );
  mask.fill(0xffffff);
  gameContainer.addChild(mask);
  gameContainer.mask = mask;

  /*
  Create score text:
  */
  // Wait for font to load (add this before creating scoreText)
  await document.fonts.load('20px cnc_red_alert');
  await document.fonts.load('12px "Sixtyfour Convergence"');
  const scoreText = new Text({
    text: 'Score: 0',
    style: {
      fontFamily: 'cnc_red_alert',  // Use the name from @font-face
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: 'normal',
      stroke: { color: 0x000000, width: 4 },
      letterSpacing: 0,
    },
    resolution: 3
  });
  scoreText.anchor.set(1, 0);
  scoreText.position.set(
    GAME_WIDTH / 2 - 40,
    -GAME_HEIGHT / 2 + 10
  );
  gameContainer.addChild(scoreText);

  /*
  Create red overlay for game over effect:
  */
  const gameOverOverlay = new Graphics();
  gameOverOverlay.rect(-gameContainer.width / 2, -gameContainer.height / 2, gameContainer.width, gameContainer.height); // Set width/height to cover container
  gameOverOverlay.fill({ color: 0x221111, alpha: 0.9 });
  gameOverOverlay.visible = false; // Hidden at start
  gameContainer.addChild(gameOverOverlay);

  /*
  Create game over text:
  */
  const gameOverText = new Text({
    text: 'Game Over!\nClick to play again',
    style: {
      fontFamily: 'Sixtyfour Convergence',
      fontSize: 12,
      fill: 0xffffff,
      // fontWeight: 'bold',
      // stroke: { color: 0x000000, width: 5 },
      align: 'center'
    },
    resolution: 3
  });
  gameOverText.anchor.set(0.5); // Center it
  gameOverText.position.set(0, 0); // Center of game
  gameOverText.visible = false; // Hidden at start
  gameContainer.addChild(gameOverText);

  /*
  Player jump code:
  */
  // Player physics
  let playerVelocityY = 0;
  let isJumping = false;
  // Jump function
  function playerJump() {
    if (!isJumping) {
      isJumping = true;
      playerVelocityY = JUMP_STRENGTH;
      sound.play('jump', { volume: 0.3 }); // Play jump sound
    }
  }

  // Reset game function
  function resetGame() {
    isGameOver = false;
    gameSpeed = INITIAL_GAME_SPEED;
    score = 0;
    nextSpeedIncreaseScore = SPEED_INCREASE_INTERVAL;
    scoreText.text = 'Score: 0';
    gameOverOverlay.visible = false;
    gameOverText.visible = false;
    playerSprite.play();
    playerSprite.position.set(-GAME_WIDTH / 2 + 60, GROUND_Y);
    playerVelocityY = 0;
    isJumping = false;
    obstacleSprite.x = GAME_WIDTH / 2 + 100;
    obstacleSprite.texture = getRandomObstacleTexture();

    // Restart music from the beginning
    sound.stopAll();
    currentTrackIndex = 0;
    playNextTrack();
  }

  /*
User input handling:
*/
  // Keyboard input
  window.addEventListener('keydown', (e) => {
    startMusic(); // Start music on first interaction
    // if space is pressed, make the player jump
    if (e.code === 'Space') {
      if (isGameOver) {
        resetGame();
      } else {
        playerJump();
      }
    }
  });

  // If user clicks/taps the canvas, make the player jump or restart
  app.canvas.addEventListener('pointerdown', () => {
    startMusic(); // Start music on first interaction
    if (isGameOver) {
      resetGame();
    } else {
      playerJump();
    }
  });

  /*
  Resizing game window handling:
  */
  // Function to resize and position the background
  function resizeGame() {
    const scaleX = app.screen.width / GAME_WIDTH;
    const scaleY = app.screen.height / GAME_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    gameContainer.scale.set(scale);
    gameContainer.position.set(app.screen.width / 2, app.screen.height / 2);
  }
  resizeGame();

  // Watch for container size changes
  const resizeObserver = new ResizeObserver(() => {
    resizeGame();
  });
  resizeObserver.observe(document.getElementById('pixi-container')!);

  /*
  Game loop:
  */
  app.ticker.add((time) => {
    // Skip game loop if game is over
    if (isGameOver) return;

    /*
    Player jump physics and handling:
    */
    // Jump physics
    if (isJumping) {
      playerVelocityY += GRAVITY * time.deltaTime;
      playerSprite.y += playerVelocityY * time.deltaTime;

      // Check if landed back on ground
      if (playerSprite.y >= GROUND_Y) {
        playerSprite.y = GROUND_Y;
        playerVelocityY = 0;
        isJumping = false;
      }
    }

    /*
    Obstacle movement and recycling:
    */
    // Move obstacle (same speed as background)
    obstacleSprite.x -= gameSpeed * time.deltaTime;

    // Check for collision between player and obstacle
    if (!isGameOver && checkCollision(playerSprite, obstacleSprite)) {
      isGameOver = true;
      playerSprite.stop();
      gameOverOverlay.visible = true; // Show red overlay
      gameOverText.visible = true; // Show game over text
      sound.stopAll(); // Pause music
    }

    // When obstacle goes off-screen:
    if (obstacleSprite.x < -GAME_WIDTH / 2 - 100) {
      score++;
      scoreText.text = `Score: ${score}`; // Update text
      if (score < nextSpeedIncreaseScore) {
        sound.play('score', { volume: 0.4 }); // Play score sound
      }
      else {
        sound.play('score_speed_increase', { volume: 0.4 }); // Play score + speed increase sound
      }

      // Check if we should increase speed
      if (score >= nextSpeedIncreaseScore && gameSpeed < MAX_GAME_SPEED) {
        gameSpeed = Math.min(gameSpeed + SPEED_INCREASE_AMOUNT, MAX_GAME_SPEED);
        nextSpeedIncreaseScore += SPEED_INCREASE_INTERVAL;
      }

      obstacleSprite.texture = getRandomObstacleTexture();
      const randomDistance = Math.random() * (OBSTACLE_MAX_DISTANCE - OBSTACLE_MIN_DISTANCE) + OBSTACLE_MIN_DISTANCE;
      obstacleSprite.x = GAME_WIDTH / 2 + randomDistance;
    }

    /*
    Background layers movement:
    */
    // Move background
    bgSprite1.x -= gameSpeed * time.deltaTime;
    bgSprite2.x -= gameSpeed * time.deltaTime;
    // Wrap background when it goes off screen
    if (bgSprite1.x < -bgTexture.width) {
      bgSprite1.x = bgSprite2.x + bgTexture.width;
    }
    if (bgSprite2.x < -bgTexture.width) {
      bgSprite2.x = bgSprite1.x + bgTexture.width;
    }

    // Move clouds
    cloudsSprite1.x -= gameSpeed / 5 * time.deltaTime;
    cloudsSprite2.x -= gameSpeed / 5 * time.deltaTime;
    // Wrap clouds when they go off screen
    if (cloudsSprite1.x < -cloudsTexture.width) {
      cloudsSprite1.x = cloudsSprite2.x + cloudsTexture.width;
    }
    if (cloudsSprite2.x < -cloudsTexture.width) {
      cloudsSprite2.x = cloudsSprite1.x + cloudsTexture.width;
    }

    // Move plants
    plantsSprite1.x -= gameSpeed * time.deltaTime;
    plantsSprite2.x -= gameSpeed * time.deltaTime;
    // Wrap plants when they go off screen
    if (plantsSprite1.x < -plantsTexture.width) {
      plantsSprite1.x = plantsSprite2.x + plantsTexture.width;
    }
    if (plantsSprite2.x < -plantsTexture.width) {
      plantsSprite2.x = plantsSprite1.x + plantsTexture.width;
    }
  });
})();
