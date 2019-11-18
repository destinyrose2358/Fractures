# Fractures

## Background
Dungeon Crawlers have been a staple of games for a long time, from table top implementations to more modern varients, such as the Elder Scrolls franchise. They are well known for their intricate and sometimes convoluted structures, and Fractures is no exception.

With its use of non-euclidian geometry, Fractures fits more nightmarishly twisting rooms than normally possible, and, with a top down point of view, is able to give an especially clausterphobic experience.

## Functionality & MVP
With Fractures, players will be allowed to:
- [ ] Start, pause, save, and restart the game
- [ ] Click on the screen to navigate to new position, or interact with the environment with camera centered on the player
- [ ] Manage their inventory
- [ ] Navigate in a non-euclidian dungeon, with raycasting vision
- [ ] Fight enemy npcs.

## Architecture and Technologies
this project will use the following technologies:
* `Javascript` for game logic
* `Browserify` to bundle js files

As well as the entry file, the following scripts will be involved:

`room.js`: this script handles the logic for creating the terrain, and managing the entities in a room.

`entity.js`: this script handles basic logic about entities, including positions, sprite, and stats

`room-network.js`: this script handles the logic for room connections, allowing the ray casting logic to find neighboring rooms for rendering.

`rendering.js`: this script manages raycasting logic and using `room-network.js` recursively renders rooms.

## Implementation Timeline

**Day 1:** Setup node modules, including setting up browserify/watchify and get sprite animations working, along with terrain tiles.

**Day 2:** Begin work on `room.js` implementing tile generation and then placement on a canvas. Begin work on `entities.js' to manage entities, and subclasses for player, npcs, and items.

**Day 3:** Get camera centered on player, and get controls working. then begin work on ray casting to occlude areas out of line of site. make `room-network.js` to manage room connections.

**Day 4:** Add enemy npc ai, loot tables, projectiles, and general tweeks.

## Bonus Features

Fractures can do with more changes in the future, including:
- [ ] Add more advanced npc logic, and interations
- [ ] Add more advanced dungeon generation
- [ ] Add sounds