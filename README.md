# Fractures

## Background
Dungeon Crawlers have been a staple of games for a long time, from table top implementations to more modern varients, such as the Elder Scrolls franchise. They are well known for their intricate and sometimes convoluted structures, and Fractures is no exception.

With its use of non-euclidian geometry, Fractures fits more nightmarishly twisting rooms than normally possible, and, with a top down point of view, is able to give an especially clausterphobic experience.

## Functionality & MVP
With Fractures, players will be allowed to:
- [ ] Start, pause, save, and restart the game
- [x] Press keys to navigate to a new position, or interact with the environment with camera centered on the player
- [ ] Manage their inventory
- [x] Navigate in a non-euclidian dungeon, with raycasting vision
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
* currently this logic is handled in the `game.js` file with use of the room and door classes.
```javascript
depthFirstFindRooms(currentRoom, orientation, offset = { x: 0, y: 0 }, step = 0, blacklistedDoor = null, prevRoomMask = filledCanvas) {
  //first we check to see how deep into the search we are, and stop at a certain depth, in this case 3
  if (step < 3) {
  
    //then we create a mask for the current room, and use that mask with the given offset and orientation to render
    // the current room
    let maskedRoom = document.createElement("canvas");
    maskedRoom.width = this.screenCenter.x * 2;
    maskedRoom.height = this.screenCenter.y * 2;
    
    maskedRoomCtx.fillStyle = maskedRoomCtx.createPattern(prevRoomMask, "no-repeat");
    maskedRoomCtx.fillRect(0, 0, maskedRoom.width, maskedRoom.height);
    maskedRoomCtx.globalCompositeOperation = "source-in";
    this.renderRoom(maskedRoomCtx, currentRoom, orientation, offset);

    this.canvasCtx.fillStyle = this.canvasCtx.createPattern(maskedRoom, "no-repeat");
    this.canvasCtx.fillRect(0, 0, this.screenCenter.x * 2, this.screenCenter.y * 2);

    //we then go through each door of the room and calculate the light cone from the player to the door,
    //and by anding this light cone with the previous rooms mask we get a mask for the neightboring room
    currentRoom.doors.forEach(door => {
      if (door !== blacklistedDoor) {
        let doorwayLightConeMask = document.createElement("canvas");
        doorwayLightConeMask.width = this.screenCenter.x * 2;
        doorwayLightConeMask.height = this.screenCenter.y * 2;
        let doorwayLightConeCtx = doorwayLightConeMask.getContext("2d");
        
        let doorPoints = door.getCoordinates(orientation);

        const playerPosition = this.player.room.translateFrom(
          this.player.orientation,
          this.player
        );
            
        let centerRoomOffset = { x: Math.floor(this.screenCenter.x - playerPosition.x), y: Math.floor(this.screenCenter.y - playerPosition.y) };

        let doorOffset = { x: centerRoomOffset.x + offset.x - this.screenCenter.x, y: centerRoomOffset.y + offset.y - this.screenCenter.y };

        let doorAngles = doorPoints.map(point => {
          return Util.convertCoordToPolar(point, doorOffset).theta;
        });

        Util.drawCone(doorwayLightConeCtx, doorAngles[0], doorAngles[1], this.screenCenter, 800, step);

        doorwayLightConeCtx.fillStyle = doorwayLightConeCtx.createPattern(prevRoomMask, "no-repeat");
        doorwayLightConeCtx.globalCompositeOperation = "destination-in";
        doorwayLightConeCtx.fillRect(0, 0, doorwayLightConeMask.width, doorwayLightConeMask.height);
        doorwayLightConeCtx.globalCompositeOperation = "source-over";
        
        const nextRoom = door.connectedDoor.room;
        const nextRoomOrientation = (orientation + this.player.findNewOrientation(door.position.orientation, door.connectedDoor.position.orientation)) % 4;

        let nextRoomOffset;
        let nextRoomDimensions = nextRoom.getDimensions(nextRoomOrientation);
        let currentRoomDimensions = currentRoom.getDimensions(orientation);
        let newX = 0;
        let newY = 0;
        const translatedDoor = door.translatePosition(orientation);
        const translatedThroughDoor = door.connectedDoor.translatePosition(nextRoomOrientation);
        switch (translatedDoor.orientation) {
          case 0:
            newX = (translatedDoor.tile - translatedThroughDoor.tile) * 16;
            newY = - (nextRoomDimensions.height) * 16;
            break;
          case 1:
            newX = (currentRoomDimensions.width) * 16;
            newY = (translatedDoor.tile - translatedThroughDoor.tile) * 16;
            break;
          case 2:
            newX = (translatedDoor.tile - translatedThroughDoor.tile) * 16;
            newY = (currentRoomDimensions.height) * 16;
            break;
          case 3:
            newX = - (nextRoomDimensions.width) * 16;
            newY = (translatedDoor.tile - translatedThroughDoor.tile) * 16;
            break;
        }
        nextRoomOffset = { x: offset.x + newX, y: offset.y + newY };

        //then after calculating the offset and orientation of the neighboring room, we call the function again
        this.depthFirstFindRooms(nextRoom, nextRoomOrientation, nextRoomOffset, step + 1, door.connectedDoor, doorwayLightConeMask);
      }
    });
  }
}
```

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
