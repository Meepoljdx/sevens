# SEVENS: Legend of the Seven Stars

[English](./README_en.md) | [中文](./README.md)

A multiplayer online RPG with a Go WebSocket server and Canvas-rendered frontend.

## Quick Start

```bash
# Requires Go 1.21+
go build -o sevens .
./sevens
# Open http://localhost:8080 in your browser
```

## Controls

| Key | Action |
|------|------|
| Arrow keys | Move |
| Right mouse button | Click to move |
| Left mouse button / Q | Skyrend Slash (basic attack) |
| W | Shield Charge |
| E | War Cry (speed buff) |
| R | Seven-Star Judgment (ultimate skill) |
| F | Pick up equipment on the ground |
| B | Open/close inventory |
| I | Open/close attributes panel |
| ESC | Close panels |

In the inventory: left click to equip/unequip, right click to view attribute details.

## Project Structure

```
sevens/
├── main.go                 # Entry point: HTTP + WebSocket server
├── game/
│   ├── world.go            # Game world: main loop, collision, waves, broadcast
│   ├── player.go           # Player: attributes, movement, skills, equipment
│   ├── enemy.go            # Enemies: AI, kinds (Skeleton/Orc/Demon/Boss)
│   ├── equipment.go        # Equipment system: generation, rarity, drops
│   ├── skill.go            # Skill definitions and warrior skill set
│   ├── entity.go           # Base types: Vec2, ID generator
│   └── protocol.go         # Network protocol: client/server message structs
├── static/
│   ├── index.html          # UI: start screen, HUD, inventory, attributes panel
│   └── js/
│       ├── main.js         # Client main logic: input, interpolation, HUD
│       ├── renderer.js     # Canvas rendering: characters, enemies, drops
│       ├── effects.js      # Particle system and skill effects
│       ├── network.js      # WebSocket client
│       └── sound.js        # Web Audio API procedural sound effects
```

## Architecture

**Server-authoritative**: all game logic (movement, damage, drops) runs on the Go server; the client only handles rendering and input.

- Server ticks at 20Hz (50ms); the client renders with 60fps interpolation
- WebSocket JSON protocol; the PlayerConn write channel prevents concurrent writes
- Circle collision detection (players and enemies push each other)

## Game Systems

### Combat
- Each of the 4 skills has its own cooldown, MP cost, and cast time
- Damage = skill base + ATK/2 + random variance, multiplied by crit and damage bonus
- Lifesteal restores HP as a percentage of final damage

### Equipment (6 slots)
| Slot | Main Attributes |
|------|--------|
| Weapon | Attack, Crit Rate, Crit Damage, Attack Speed |
| Armor | Defense, HP, Armor, Damage Reduction |
| Helmet | Defense, HP, HP/MP Regen |
| Boots | Move Speed, Dodge |
| Ring | Attack, Crit, Damage Bonus, Cooldown Reduction |
| Amulet | MP, MP Regen, Cooldown Reduction |

5 rarities: Common (white) → Uncommon (green) → Rare (blue) → Epic (purple) → Legendary (orange)

### Attributes (14)
Attack, Defense, Attack Speed, Move Speed, Crit Rate, Crit Damage, HP Regen, MP Regen, Armor, Dodge, Lifesteal, Cooldown Reduction, Damage Bonus, Damage Reduction

### Waves
- Waves are spaced 12-25 seconds apart; enemy count and strength increase
- Every 5 waves is a Boss wave, and the Boss is guaranteed to drop blue-quality equipment
- The world resets after all players go offline

## Development

```bash
# Rebuild after changing Go code
go build -o sevens . && ./sevens

# After editing frontend files (static/), just refresh the browser; no server restart needed
```

### Adding a New Hero

1. `game/skill.go` — define the skill set (see `WarriorSkills()`)
2. `game/player.go` — add a constructor (see `NewWarrior()`)
3. `game/world.go` — create it by hero type in the join branch of `handleMessage`
4. `static/js/renderer.js` — add character rendering
5. `static/js/effects.js` — add skill effects
6. `static/index.html` — unlock the hero selection card

### Adding a New Enemy

1. `game/enemy.go` — add an entry to `EnemyKinds`
2. `game/world.go` — add spawn logic in `spawnWave()`
3. `static/js/renderer.js` — add rendering in `drawEnemies`

## License

MIT
