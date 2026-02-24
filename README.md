# FruitJump

![FruitJump Screenshot](screenshots/fruitjump-ss1.png)

A fast-paced endless runner game built with PixiJS and TypeScript. Jump over obstacles, rack up points, and see how far you can go as the game progressively gets faster!

Try it out on [GitHub Pages!](https://greghcarr.github.io/fruitjump-pixijs/)

## Overview

FruitJump is an endless runner where you control a character running through a scrolling environment. Time your jumps carefully to avoid obstacles — hit one and it's game over! The longer you survive, the faster the game becomes, testing your reflexes and timing.

The project was built as an exploration of game development concepts using PixiJS as the rendering engine and the PixiJS Sound library for audio.

### Features

- **Parallax scrolling** — multi-layered background scrolls at different speeds, creating depth
- **Animated character** — smooth sprite-based running animation with physics-based jumping
- **Progressive difficulty** — game speed gradually increases as you score more points, capping at a maximum speed
- **Random obstacles** — obstacles appear at varying distances with randomized sprites to keep gameplay unpredictable
- **Music progression** — a sequential music playlist plays through multiple tracks — survive longer to hear more songs
- **Sound effects** — audio feedback for jumping, scoring, and speed increases
- **Responsive scaling** — the game scales and centers itself to fit any screen size while maintaining a 16:9 aspect ratio

## Installation & Setup

You will need [Node.js](https://nodejs.org/) installed.

1. Clone the repository:
```bash
   git clone https://github.com/greghcarr/fruitjump-pixijs.git
   cd fruitjump-pixijs
```

2. Install dependencies:
```bash
   npm install
```

3. Start the development server:
```bash
   npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or whichever port Vite assigns).

Press **Space** or **click/tap** to jump. When you hit an obstacle, press **Space** or **click/tap** again to restart.

Art and Music by Sarah Clements

Programming and Sound Effects by Greg Carr