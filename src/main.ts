// description: This example demonstrates how to use a Container to group and manipulate multiple sprites
import { Application, Assets, Container, Sprite, Graphics } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();
  await app.init({ background: '#3C3C3C', resizeTo: window });
  document.getElementById('pixi-container')!.appendChild(app.canvas);

  const gameContainer = new Container();
  app.stage.addChild(gameContainer);

  let gameSpeed = 1.0;

  // Load the textures
  const bgTexture = await Assets.load('/assets/images/levels/street/street_background.png');
  const cloudsTexture = await Assets.load('/assets/images/levels/street/street_clouds.png');
  const plantsTexture = await Assets.load('/assets/images/levels/street/street_plants.png');

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

  // Function to resize and position the background
  function resizeGame() {
    // Add margin (e.g., 20 pixels on each side)
    const margin = 40;
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

  // Parallax scrolling with wrapping
  app.ticker.add((time) => {
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
