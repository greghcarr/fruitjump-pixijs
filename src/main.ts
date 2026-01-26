// description: This example demonstrates how to use a Container to group and manipulate multiple sprites
import { Application, Assets, Container, Sprite, AnimatedSprite, Graphics } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();
  await app.init({ background: '#3C3C3C', resizeTo: window });
  document.getElementById('pixi-container')!.appendChild(app.canvas);

  const gameContainer = new Container();
  app.stage.addChild(gameContainer);

  let gameSpeed = 4.0;

  /*
  Create background texture layers:
  */
  // Load the textures
  const bgTexture = await Assets.load('/assets/images/levels/street/street_background.png');
  const cloudsTexture = await Assets.load('/assets/images/levels/street/street_clouds.png');
  const plantsTexture = await Assets.load('/assets/images/levels/street/street_plants.png');
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
  ]);
  // Function to get random obstacle texture
  function getRandomObstacleTexture() {
    const textures = Object.values(obstacleTextures);
    return textures[Math.floor(Math.random() * textures.length)];
  }


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

  const JUMP_STRENGTH = -8;
  const GROUND_Y = bgTexture.height / 2 - 40; // The y position where player stands

  /*
Create player sprite:
*/
  const playerSprite = new AnimatedSprite(Object.values(playerWalkFrames));
  playerSprite.animationSpeed = (10 / 60) * (gameSpeed / 4);
  playerSprite.play();
  playerSprite.anchor.set(0.5, 1); // 0.5 = center horizontally, 1 = bottom
  playerSprite.scale.x = -1;
  playerSprite.scale.y = 1;
  playerSprite.position.set(
    -bgTexture.width / 2 + 60,
    GROUND_Y
  );
  gameContainer.addChild(playerSprite);

  // Create obstacle with random texture
  const obstacleSprite = new Sprite(getRandomObstacleTexture());
  obstacleSprite.anchor.set(0.5, 1); // 0.5 = center horizontally, 1 = bottom
  obstacleSprite.scale.set(1);
  obstacleSprite.position.set(
    bgTexture.width / 2 + 100,
    GROUND_Y
  );
  gameContainer.addChild(obstacleSprite);

  /*
  Create the mask to limit visible area:
  */
  // Create a mask rectangle
  const mask = new Graphics();
  mask.rect(
    -bgTexture.width / 2,
    -bgTexture.height / 2,
    bgTexture.width,
    bgTexture.height
  );
  mask.fill(0xffffff); // Color doesn't matter for masks
  gameContainer.addChild(mask);
  gameContainer.mask = mask; // Apply mask to container

  /*
  Player jump code:
  */
  // Player physics
  let playerVelocityY = 0;
  let isJumping = false;
  const GRAVITY = 0.5;
  // Jump function
  function playerJump() {
    if (!isJumping) {
      isJumping = true;
      playerVelocityY = JUMP_STRENGTH;
    }
  }

  /*
  User input handling:
  */
  // Keyboard input
  window.addEventListener('keydown', (e) => {
    // if space is pressed, make the player jump
    if (e.code === 'Space') {
      playerJump()
    }
  });
  // If user clicks/taps the canvas, make the player jump
  app.canvas.addEventListener('pointerdown', playerJump);

  /*
  Resizing game window handling:
  */
  // Function to resize and position the background
  function resizeGame() {
    // Add margin (e.g., 20 pixels on each side)
    const margin = 20;
    const availableWidth = app.screen.width - (margin * 2);
    const availableHeight = app.screen.height - (margin * 2);

    // Calculate scale for both dimensions
    const scaleX = availableWidth / bgTexture.width;
    const scaleY = availableHeight / bgTexture.height;

    // Use the SMALLER scale to ensure entire image fits
    const scale = Math.min(scaleX, scaleY);
    gameContainer.scale.set(scale);

    // Center on screen
    gameContainer.position.set(app.screen.width / 2, app.screen.height / 2);
  }
  resizeGame();
  window.addEventListener('resize', resizeGame);

  // Game loop
  app.ticker.add((time) => {
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
    // In the game loop, when obstacle goes off-screen:
    if (obstacleSprite.x < -bgTexture.width / 2 - 100) {
      obstacleSprite.texture = getRandomObstacleTexture(); // New random texture!
      obstacleSprite.x = bgTexture.width / 2 + 100;
    }

    /*
    Background layers movement:
    */
    // Move background
    bgSprite1.x -= gameSpeed * time.deltaTime;
    bgSprite2.x -= gameSpeed * time.deltaTime;

    // Wrap background
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

    // Wrap plants
    if (plantsSprite1.x < -plantsTexture.width) {
      plantsSprite1.x = plantsSprite2.x + plantsTexture.width;
    }
    if (plantsSprite2.x < -plantsTexture.width) {
      plantsSprite2.x = plantsSprite1.x + plantsTexture.width;
    }
  });
})();
