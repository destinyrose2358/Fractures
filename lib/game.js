const Room = require("./room/room.js");
const Player = require("./player.js");
const Util = require("./util");

const filledCanvas = document.createElement("canvas");
filledCanvas.width = 600;
filledCanvas.height = 600;
const filledCanvasctx = filledCanvas.getContext("2d");
filledCanvasctx.fillStyle = "#000000";
filledCanvasctx.fillRect(0, 0, filledCanvas.width, filledCanvas.height);

class Game {
  constructor(seed) {
    let canvas = document.getElementById("game-screen");
    let dpi = window.devicePixelRatio;
    this.canvasCtx = canvas.getContext('2d');
    let styledWidth = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
    let styledHeight = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    canvas.setAttribute("width", styledWidth * dpi);
    canvas.setAttribute("height", styledHeight * dpi);
    this.screenCenter = { x: canvas.width / 2, y: canvas.height / 2 };
    this.seed = seed;
    this.buttons = { w: false, s: false, a: false, d: false, " ": false };
    this.rooms = [
      new Room([], [
        { position: { orientation: 0, tile: 0 } },
        { position: { orientation: 3, tile: 0 } },
        { position: { orientation: 3, tile: 1 } },
        { position: { orientation: 3, tile: 3 } },
        { position: { orientation: 1, tile: 5 } }
      ]),
      new Room([], [
        { position: { orientation: 3, tile: 3 } },
        { position: { orientation: 1, tile: 3 } },
        { position: { orientation: 0, tile: 3 }}
      ]),
      new Room([], [
        { position: { orientation: 1, tile: 6 } },
        { position: { orientation: 2, tile: 11 }}
      ])
    ];
    const door1 = this.rooms[0].doors[0];
    const door2 = this.rooms[0].doors[1];
    const door3 = this.rooms[0].doors[2];
    const door4 = this.rooms[0].doors[3];
    const door5 = this.rooms[1].doors[0];
    const door6 = this.rooms[1].doors[1];
    const door7 = this.rooms[1].doors[2];
    const door8 = this.rooms[2].doors[0];
    const door9 = this.rooms[0].doors[4];
    const door10 = this.rooms[2].doors[1];
    door3.connectedDoor = door5;
    door5.connectedDoor = door3;
    door4.connectedDoor = door6;
    door6.connectedDoor = door4;
    door1.connectedDoor = door2;
    door2.connectedDoor = door1;
    door7.connectedDoor = door8;
    door8.connectedDoor = door7;
    door9.connectedDoor = door10;
    door10.connectedDoor = door9;
    this.player = new Player(canvas, this.rooms[0], this.buttons);
    document.addEventListener("keydown", e => {
      if (Object.keys(this.buttons).includes(e.key)) {
        this.buttons[e.key] = true;
      }
    });
    document.addEventListener("keyup", e => {
      if (Object.keys(this.buttons).includes(e.key)) {
        this.buttons[e.key] = false;
      }
    });
    this.update = this.update.bind(this);
    this.update();
  }

  update() {
    this.player.update();
    this.rooms.forEach(room => room.update());
    this.render();
    requestAnimationFrame(this.update);
  }

  renderRoom(ctx, room, orientation, offset) {
    ctx.fillStyle = ctx.createPattern(
      room.canvasList[orientation],
      "no-repeat"
    );
    ctx.save();
    const playerPosition = this.player.room.translateFrom(
      this.player.orientation,
      this.player
    );
    ctx.translate(
      Math.floor(this.screenCenter.x - playerPosition.x + offset.x),
      Math.floor(this.screenCenter.y - playerPosition.y + offset.y)
    );
    ctx.fillRect(0, 0, 500, 500);
    ctx.restore();
  }

  drawShadow(points, offset) {
    this.canvasCtx.fillStyle = "#000000";
    this.canvasCtx.save();
    const playerPosition = this.player.room.translateFrom(
      this.player.orientation,
      this.player
    );
    this.canvasCtx.translate(
      Math.floor(this.screenCenter.x - playerPosition.x - 8 + offset.x),
      Math.floor(this.screenCenter.y - playerPosition.y - 8 + offset.y)
    );
    this.canvasCtx.beginPath();
    this.canvasCtx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(point => {
      this.canvasCtx.lineTo(point.x, point.y);
    });
    this.canvasCtx.fill();
    this.canvasCtx.closePath();
    this.canvasCtx.restore();
  } 

  depthFirstFindRooms(currentRoom, orientation, offset = { x: 0, y: 0 }, step = 0, blacklistedDoor = null, prevRoomMask = filledCanvas) {
    if (step < 3) {
      //create mask for this room to store its total visible pixels
      let maskedRoom = document.createElement("canvas");
      maskedRoom.width = this.screenCenter.x * 2;
      maskedRoom.height = this.screenCenter.y * 2;
      let maskedRoomCtx = maskedRoom.getContext('2d');

      //once you have gone through each door use the previous rooms mask to filter current room before drawing it to final canvas
      maskedRoomCtx.fillStyle = maskedRoomCtx.createPattern(prevRoomMask, "no-repeat");
      maskedRoomCtx.fillRect(0, 0, maskedRoom.width, maskedRoom.height);
      maskedRoomCtx.globalCompositeOperation = "source-in";
      this.renderRoom(maskedRoomCtx, currentRoom, orientation, offset);

      this.canvasCtx.fillStyle = this.canvasCtx.createPattern(maskedRoom, "no-repeat");
      this.canvasCtx.fillRect(0, 0, this.screenCenter.x * 2, this.screenCenter.y * 2);

      currentRoom.doors.forEach(door => {
        //recursively go through each door
        //generating a mask from the light cone to that door
        //then anding it to prevRoomMask
        //once you have gone through each door and created the light cones for each one
        //add them together then render the overlap of the room and this merged mask
        //when you go through each door you want to pass the current doorway light cone
        //alongside all the orientation and offset changes
        //if step goes above a certain threshold then do none of these steps
        //good luck tomorrow idiot

        //prevent backtracking to previous door
        if (door !== blacklistedDoor) {
          //create temporary canvas for current doors light cone
          let doorwayLightConeMask = document.createElement("canvas");
          doorwayLightConeMask.width = this.screenCenter.x * 2;
          doorwayLightConeMask.height = this.screenCenter.y * 2;
          let doorwayLightConeCtx = doorwayLightConeMask.getContext("2d");

          //make sure door gives its coordinates in a rotational pattern
          let doorPoints = door.getCoordinates(orientation);

          //find position of room player is in on screen
          const playerPosition = this.player.room.translateFrom(
            this.player.orientation,
            this.player
          );
            
          let centerRoomOffset = { x: Math.floor(this.screenCenter.x - playerPosition.x), y: Math.floor(this.screenCenter.y - playerPosition.y) };

          let doorOffset = { x: centerRoomOffset.x + offset.x - this.screenCenter.x, y: centerRoomOffset.y + offset.y - this.screenCenter.y };

          let doorAngles = doorPoints.map(point => {
            return Util.convertCoordToPolar(point, doorOffset).theta;
          });

          //create triangle to edge of screen
          Util.drawCone(doorwayLightConeCtx, doorAngles[0], doorAngles[1], this.screenCenter, 800, step);

          //source in the previous rooms light cone
          doorwayLightConeCtx.fillStyle = doorwayLightConeCtx.createPattern(prevRoomMask, "no-repeat");
          doorwayLightConeCtx.globalCompositeOperation = "destination-in";
          doorwayLightConeCtx.fillRect(0, 0, doorwayLightConeMask.width, doorwayLightConeMask.height);
          doorwayLightConeCtx.globalCompositeOperation = "source-over";

          //recursive call passing in doorwayLightConeMask
          // and the new orientation, offset, and blacklisted door of the next room
          //dont forget  to increase the step and pass that along as well
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

          this.depthFirstFindRooms(nextRoom, nextRoomOrientation, nextRoomOffset, step + 1, door.connectedDoor, doorwayLightConeMask);
        }
      });
    }
  }

  findRooms() {
    let rooms = [];
    let currentRoom = this.player.room;

    // this.renderRoom(currentRoom, this.player.orientation, { x: 0, y: 0 });
    //   let { shadows } = currentRoom.doors[0].lookThroughAt(this.player.position, this.player.orientation);
    //   shadows.forEach((shadow, idx) => {
    //     console.log(idx, shadow);
    //     this.drawShadow(shadow, {x: 0, y: 0});
    //   });
    

    rooms.push({room: currentRoom, orientation: this.player.orientation, offset: { x: 0, y: 0 }});
    let layer = [{room: currentRoom, orientation: this.player.orientation, offset: { x: 0, y: 0 }}];
    let nextLayer = [];
    for (let step = 0; step < 1 && layer.length > 0; step++) {
      layer.forEach(room => {
        //render the current room
        // this.renderRoom(room.room, room.orientation, room.offset);
        room.room.doors.forEach(door => {
          //look through each door and render shadows
          // let { shadows } = door.lookThroughAt(this.player.position, room.orientation);
          // shadows.forEach(shadow => {
          //   console.log(shadow);
          //   this.drawShadow(shadow, room.offset);
          // });
          //find new rooms orientation and other factors
          const newRoomOrientation = (room.orientation + this.player.findNewOrientation(door.position.orientation, door.connectedDoor.position.orientation)) % 4;
          let newRoom = door.connectedDoor.room;
          let newRoomOffset;
          let newRoomDimensions = newRoom.getDimensions(newRoomOrientation);
          let oldRoomDimensions = room.room.getDimensions(room.orientation);
          let newX = 0;
          let newY = 0;
          const translatedDoor = door.translatePosition(room.orientation);
          const translatedThroughDoor = door.connectedDoor.translatePosition(newRoomOrientation);
          switch (translatedDoor.orientation) {
            case 0:
              newX = (translatedDoor.tile - translatedThroughDoor.tile) * 16;
              newY = - (newRoomDimensions.height) * 16;
              break;
            case 1:
              newX = (oldRoomDimensions.width) * 16;
              newY = (translatedDoor.tile - translatedThroughDoor.tile) * 16;
              break;
            case 2:
              newX = (translatedDoor.tile - translatedThroughDoor.tile) * 16;
              newY = (oldRoomDimensions.height) * 16;
              break;
            case 3:
              newX = - (newRoomDimensions.width) * 16;
              newY = (translatedDoor.tile - translatedThroughDoor.tile) * 16;
              break;
          }
          newRoomOffset = { x: room.offset.x + newX, y: room.offset.y + newY};
          let newRoomObject = { room: newRoom, orientation: newRoomOrientation, offset: newRoomOffset};
          if (!rooms.some(room => (
            newRoomObject.room === room.room &&
            newRoomObject.orientation === room.orientation &&
            newRoomObject.offset.x === room.offset.x &&
            newRoomObject.offset.y === room.offset.y
          ))) {
            rooms.push(newRoomObject);
            nextLayer.push(newRoomObject);
          }
        })
      });
      layer = nextLayer;
      nextLayer = [];
    }
    return rooms;
  }

  render() {
    this.canvasCtx.clearRect(0, 0, 600, 600);
    this.depthFirstFindRooms(this.player.room, this.player.orientation);
  }
}

module.exports = Game;
