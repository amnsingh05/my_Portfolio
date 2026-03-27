# Snake (Classic)

Small vanilla JavaScript Snake game with:

- Grid movement
- Food spawning
- Snake growth
- Score tracking
- Game-over detection
- Restart and pause
- Speed levels (Easy / Medium / Hard)

## Run

From the repo root:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Controls

- Arrow keys or `W/A/S/D` to move
- `Space` to pause/resume
- `R` to restart
- Speed dropdown to switch between Easy, Medium, and Hard
- On-screen buttons for touch/click input

## Manual verification checklist

- Movement: snake moves one cell per tick and turns correctly.
- Opposite direction guard: immediate 180-degree turn is ignored.
- Food and growth: eating food increases length and score by 1.
- Boundaries: hitting outer wall ends the game.
- Self-collision: running into snake body ends the game.
- Pause/restart: pause freezes movement; restart resets score and position.
- Speed levels: changing Easy/Medium/Hard updates snake tick speed immediately.
