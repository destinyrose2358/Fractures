(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./player.js":3,"./room/room.js":8,"./util":9}],2:[function(require,module,exports){
const Game = require("./game.js");

document.addEventListener("DOMContentLoaded", () => {
  let game = new Game();
});


},{"./game.js":1}],3:[function(require,module,exports){
const DIRECTIONS = {
  w: { x: 0, y: -1.5 },
  s: { x: 0, y: 1.5 },
  a: { x: -1.5, y: 0 },
  d: { x: 1.5, y: 0 }
};

const SPRITE = new Image();
SPRITE.src = "./assets/sprites_and_sounds/entities/creatures/player/sprites/idle/idle_0.png";

class Player {
  constructor(canvas, room, buttons) {
    this.ctx = canvas.getContext('2d');
    this.screenCenter = { x: canvas.width / 2, y: canvas.height / 2 };
    this.room = room;
    this.position = { x: (room.width * 16) / 2, y: (room.height * 16) / 2};
    this.buttons = buttons;
    room.entities.push(this);
    this.sprite = SPRITE;
    this.orientation = 0;
  }

  update() {
    this.move();
  }

  getPosition() {
    return { x: Math.floor(this.position.x), y: Math.floor(this.position.y)}
  }

  findNewOrientation(fromDoorOrientation, toDoorOrientation) {
    let increase;
    switch (fromDoorOrientation - toDoorOrientation) {
      case 0:
        increase = 2;
        break;
      case -1:
        increase = 3;
        break;
      case -2:
        increase = 0;
        break;
      case -3:
        increase = 1;
        break;
      case 1:
        increase = 1;
        break;
      case 2:
        increase = 0;
        break;
      case 3:
        increase = 3;
        break;
    }
    return increase;
  }

  updateOrientation(fromDoorOrientation = 0, toDoorOrientation = 1) {
    let increase = this.findNewOrientation(fromDoorOrientation, toDoorOrientation);
    this.orientation = (this.orientation + increase) % 4;
  }

  move() {
    let change = { x: 0, y: 0 };
    ["a", "w", "s", "d"].forEach(button => {
      if (this.buttons[button]) {
        const vector = DIRECTIONS[this.orientation][button];
        change.x += vector.x;
        change.y += vector.y;
      }
    });
    this.position.x = this.position.x + change.x;
    this.position.y = this.position.y + change.y;
    if (this.buttons[" "]) {
      this.updateOrientation();
      this.buttons[" "] = false;
    }
  }

  render(ctx) {

  }
}

module.exports = Player;
},{}],4:[function(require,module,exports){
const Vector = require("./Vector");

class Edge {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.length = start.distance(end);
    }

    intersection(edge) {
        let a = this.start;
        let b = this.end;
        let c = edge.start;
        let d = edge.end;
        let cDiffA = c.minus(a);
        let r = b.minus(a);
        let s = d.minus(c);
        let rCrossS = r.crossProduct(s);
        let t = cDiffA.crossProduct(s) / rCrossS;
        let u = cDiffA.crossProduct(r) / rCrossS;
        if (t <= 1 && t >= 0 && u <= 1 && u >= 0) return { point: a.plus(r.scale(t)), t};
    }

    rotate(rotationPoint, theta) {
        return new Edge(this.start.rotate(rotationPoint, theta), this.end.rotate(rotationPoint, theta));
    }

    project(t = 0) {
        return this.start.plus(this.end.minus(this.start).scale(t));
    }

    RandomSubSegment(length = this.length) {
        let randomT = Math.random() * (length / this.length);
        return new Edge(this.project(randomT), this.project(1 - randomT));
    }
    
}

module.exports = Edge;
},{"./Vector":6}],5:[function(require,module,exports){
class EdgeSet {
    constructor(edges) {
        this.edges = edges;
    }

    broadCollisionTest(edgeSet) {
        //use axis aligned bounding box test
        return !(((this.bounds().left > edgeSet.bounds().right) || (edgeSet.bounds().left > this.bounds().right)) || ((this.bounds().top > edgeSet.bounds().bottom) || (edgeSet.bounds().top > this.bounds().bottom)))
    };

    merge(edgeSet) {
        return new EdgeSet(this.edges.concat(edgeSet.edges));
    }

    randomEdge() {
        return this.edges[Math.floor(Math.random() * this.edges.length)];
    }
    
    bounds() {
        if (!this.bound) {
            let edgesLeftBound = Infinity;
            let edgesRightBound = -Infinity;
            let edgesTopBound = Infinity;
            let edgesBottomBound = -Infinity;
        
            this.edges.forEach(edge => {
                if (edge.start.x < edgesLeftBound) edgesLeftBound = edge.start.x;
                if (edge.start.x > edgesRightBound) edgesRightBound = edge.start.x;
                if (edge.end.x < edgesLeftBound) edgesLeftBound = edge.end.x;
                if (edge.end.x > edgesRightBound) edgesRightBound = edge.end.x;
                if (edge.start.y < edgesTopBound) edgesTopBound = edge.start.y;
                if (edge.start.y > edgesBottomBound) edgesBottomBound = edge.start.y;
                if (edge.end.y < edgesTopBound) edgesTopBound = edge.end.y;
                if (edge.end.y > edgesBottomBound) edgesBottomBound = edge.end.y;
            });
        
            this.bound =  { left: edgesLeftBound, right: edgesRightBound, top: edgesTopBound, bottom: edgesBottomBound };
        }
        return this.bound;
    };
    
    isColliding(edgeSet) {
        for (let i = 0; i < this.edges.length; i++) {
            for (let j = 0; j < edgeSet.edges.length; j++) {
                if (!!this.edges[i].intersection(edgeSet.edges[j])) return true;
            }
        }
        return false;
    }
}

module.exports = EdgeSet;
},{}],6:[function(require,module,exports){
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.theta = Math.atan2(y, x);
    }

    plus(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    minus(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    scale(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    crossProduct(vector) {
        return this.x * vector.y - vector.x * this.y;
    };

    distance(vector) {
        return Math.sqrt((this.x - vector.x) ** 2 + (this.y - vector.y) ** 2);
    }

    rotate(rotationPoint = new Vector(0,0), theta) {
        return new Vector(Math.cos(theta) * (this.x - rotationPoint.x) 
            - Math.sin(theta) * (this.y-rotationPoint.y) + rotationPoint.x,
            Math.sin(theta) * (this.x - rotationPoint.x)
            + Math.cos(theta) * (this.y - rotationPoint.y) + rotationPoint.y)
    }

    Random() {
        return new Vector(Math.floor(Math.random() * 30) * 16, Math.floor(Math.random() * 30) * 16)
    }
}

module.exports = Vector;
},{}],7:[function(require,module,exports){

class Door {
  constructor(room, edge) {
    //positions {orientation: 0-3 0 top clockwise after, tile: 0 for farthest left or top}
    this.room = room;
    this.edge = edge
    this.connectedDoor = null;
  }

  Random(room, edge) {
    let doorEdge = edge.RandomSubSegment();
    return new Door(room, doorEdge);
  }

  //old code, needs refactored

  getCoordinates(orientation) {
    const newPosition = this.translatePosition(orientation);
    const roomDimensions = this.room.getDimensions(orientation);

    switch (newPosition.orientation) {
      case 0:
        return [
          { x: newPosition.tile * 16 + 14, y: 0 },
          { x: newPosition.tile * 16 + 1, y: 0 }
        ];
      case 1:
        return [
          { x: roomDimensions.width * 16, y: newPosition.tile * 16 + 14 },
          { x: roomDimensions.width * 16, y: newPosition.tile * 16 + 1 }
        ];
      case 2:
        return [
          { x: newPosition.tile * 16 + 1, y: roomDimensions.height * 16 },
          { x: newPosition.tile * 16 + 14, y: roomDimensions.height * 16 }
        ];
      case 3:
        return [
          { x: 0, y: newPosition.tile * 16 + 1 },
          { x: 0, y: newPosition.tile * 16 + 14 }
        ];
    }
  }

  lookThroughAt(position, orientation) {
    //assumes viewer is "inside" room
    //finds points of view for neighboring room

    //get door center and dimensions

    let { center, dimensions } = this.getCenterDimensions();

    //get door side walls and door way
    let interiorWall;
    let doorway;
    switch (this.position.orientation) {
      case 0:
        doorway = {
          pos1: {
            x: center.x - (dimensions.x / 2),
            y: center.y - (dimensions.y / 2)
          },
          pos2: {
            x: center.x + (dimensions.x / 2),
            y: center.y - (dimensions.y / 2)
          }
        };
        interiorWall = {
          pos1: {
            x: center.x - (dimensions.x / 2),
            y: center.y + (dimensions.y / 2)
          },
          pos2: {
            x: center.x + (dimensions.x / 2),
            y: center.y + (dimensions.y / 2)
          }
        };
      case 1:
        doorway = {
          pos1: {
            x: center.x + (dimensions.x / 2),
            y: center.y - (dimensions.y / 2),
          },
          pos2: {
            x: center.x + (dimensions.x / 2),
            y: center.y + (dimensions.y / 2)
          }
        };
        interiorWall = {
          pos1: {
            x: center.x - (dimensions.x / 2),
            y: center.y - (dimensions.y / 2),
          },
          pos2: {
            x: center.x - (dimensions.x / 2),
            y: center.y + (dimensions.y / 2)
          }
        };
      case 2:
        doorway = {
          pos1: {
            x: center.x - (dimensions.x / 2),
            y: center.y + (dimensions.y / 2)
          },
          pos2: {
            x: center.x + (dimensions.x / 2),
            y: center.y + (dimensions.y / 2)
          }
        };
        interiorWall = {
          pos1: {
            x: center.x - (dimensions.x / 2),
            y: center.y - (dimensions.y / 2)
          },
          pos2: {
            x: center.x + (dimensions.x / 2),
            y: center.y - (dimensions.y / 2)
          }
        };
      case 3:
        doorway = {
          pos1: {
            x: center.x - (dimensions.x / 2),
            y: center.y - (dimensions.y / 2),
          },
          pos2: {
            x: center.x - (dimensions.x / 2),
            y: center.y + (dimensions.y / 2)
          }
        };
        interiorWall = {
          pos1: {
            x: center.x + (dimensions.x / 2),
            y: center.y - (dimensions.y / 2),
          },
          pos2: {
            x: center.x + (dimensions.x / 2),
            y: center.y + (dimensions.y / 2)
          }

        };
    }

    //see if doorway is visible to viewer
      //test each side walls intersection with the doorway

    let bound1 = this.findVectorIntersectionScalar(position, interiorWall.pos1, doorway.pos1, doorway.pos2);
    let bound2 = this.findVectorIntersectionScalar(position, interiorWall.pos2, doorway.pos1, doorway.pos2);
    
    // if the 2 ranges overlap then the doorway isnt visible
    let doorwayVisible;

    let smallBound;
    let largeBound;
    
    if (bound1 < 0 || bound2 < 0) {
      smallBound = 0;
    } else {
      smallBound = Math.min(bound1, bound2);
    }

    if (bound1 > 1 || bound2 > 1) {
      largeBound = 1;
    } else {
      largeBound = Math.max(bound1, bound2);
    }

    //check if bounds are in bounds
    
    //need the points of the shadow for the render step

    let sidewall1Point;
    let sidewall2Point;

    if ((sidewall1bound1 >= 0) && (sidewall1bound1 <= 1)) {
      sidewall1Point = sidewall1bound1
    } else {
      sidewall1Point = sidewall1bound2;
    }

    const sideWall1Points = [
      this.room.translatePosition(this.scalarToPoint(doorway.pos1, doorway.pos2, sidewall1Point), orientation),
      this.room.translatePosition(sideWall1.pos1, orientation),
      this.room.translatePosition(sideWall1.pos2, orientation)
    ];
    const sideWall2Points = [
      this.room.translatePosition(this.scalarToPoint(doorway.pos1, doorway.pos2, sidewall2Point), orientation),
      this.room.translatePosition(sideWall2.pos1, orientation),
      this.room.translatePosition(sideWall2.pos2, orientation)
    ];

    return { shadows: [sideWall1Points, sideWall2Points], doorwayVisible};
  }

  scalarToPoint(vector1, vector2, scalar) {
    let s = this.sumVectors(vector1, this.multiplyVector(vector2, -1));
    return this.sumVectors(vector2, this.multiplyVector(s, scalar));
  }

  crossProduct(vector1, vector2) {
    return vector1.x * vector2.y - vector1.y * vector2.x;
  }

  findVectorIntersectionScalar(a, b, c, d) {
    const r = (this.sumVectors(b, this.multiplyVector(a, -1)));
    const s = (this.sumVectors(d, this.multiplyVector(c, -1)));
    return this.crossProduct(this.sumVectors(a, this.multiplyVector(c, -1)), r) / this.crossProduct(s, r);
  }

  sumVectors(vector1, vector2) {
    return { x: vector1.x + vector2.x, y: vector1.y + vector2.y }
  }

  multiplyVector(vector, scalar) {
    return { x: vector.x * scalar, y: vector.y * scalar };
  }

  lookInAt(position, viewPoints) {
    //assumes viewer is outside of room
    //finds doors that are in view

  }

  getCenterDimensions() {
    let center = {};
    let dimensions = {};
    switch (this.position.orientation) {
      case 0:
        center.x = (this.position.tile) * 16 + 8;
        center.y = 0;
        dimensions.x = 14;
        dimensions.y = 8;
        break;
      case 1:
        center.x = (this.room.width) * 16;
        center.y = (this.position.tile) * 16 + 8;
        dimensions.x = 8;
        dimensions.y = 14;
        break;
      case 2:
        center.x = (this.position.tile) * 16 + 8;
        center.y = (this.room.height) * 16;
        dimensions.x = 14;
        dimensions.y = 8;
        break;
      case 3:
        center.x = 0;
        center.y = (this.position.tile) * 16 + 8;
        dimensions.x = 8;
        dimensions.y = 14;
        break;
    }
    return { center, dimensions };
  }

  transfer(entity) {
    const entityIndex = this.room.entities.indexOf(entity);
    this.room.entities.splice(entityIndex, 1);
    entity.updateOrientation(this.position.orientation, this.connectedDoor.position.orientation);
    this.connectedDoor.receiveEntity(entity);
  }

  receiveEntity(entity) {
    entity.room = this.room;
    this.room.entities.push(entity);
    switch (this.position.orientation) {
      case 0:
        entity.position.x = this.position.tile * 16 + 8;
        entity.position.y = 0;
        break;
      case 1:
        entity.position.x = this.room.width * 16;
        entity.position.y = this.position.tile * 16 + 8;
        break
      case 2:
        entity.position.x = this.position.tile * 16 + 8;
        entity.position.y = this.room.height * 16;
        break;
      case 3:
        entity.position.x = 0;
        entity.position.y = this.position.tile * 16 + 8;
        break;
    }
  }

  translatePosition(orientation) {
    //door orientation: room orientation * 3 + door orientation
    let newDoorOrientation = (orientation * 3 + this.position.orientation) % 4;
    let newTile = this.position.tile;
    if (
      (this.position.orientation < 2 && newDoorOrientation > 1)
      || (this.position.orientation > 1 && newDoorOrientation < 2)) {
      let dimensions = this.room.getDimensions(orientation);
      if (newDoorOrientation % 2 === 0) {
        newTile = dimensions.width - newTile - 1;
      } else {
        newTile = dimensions.height - newTile - 1;
      }
    }
    return { orientation: newDoorOrientation, tile: newTile };
  }

  enforceBoundaries(entity) {
    let bounds;
    const position = entity.getPosition();
    switch (this.position.orientation) {
      case 0:
        bounds = {
          center: this.position.tile * 16 + 8,
          bottom: 8,
          top: 0
        };
        if (
          position.y < bounds.bottom &&
          position.x > bounds.center - 4 &&
          position.x < bounds.center + 4
        ) {
          if (position.y < bounds.top) {
            this.transfer(entity);
            return true;
          }
          entity.position.x = bounds.center;
          return true;
        } else {
          return false;
        }
      case 1:
        bounds = {
          left: this.room.width * 16 - 8,
          right: this.room.width * 16,
          center: this.position.tile * 16 + 8
        };
        if (
          position.x > bounds.left &&
          position.y > bounds.center - 4 &&
          position.y < bounds.center + 4
        ) {
          if (position.x > bounds.right) {
            this.transfer(entity);
            return true;
          }
          entity.position.y = bounds.center;
          return true;
        } else {
          return false;
        }
      case 2:
        bounds = {
          center: this.position.tile * 16 + 8,
          bottom: this.room.height * 16,
          top: this.room.height * 16 - 8
        };
        if (
          position.y > bounds.top &&
          position.x > bounds.center - 4 &&
          position.x < bounds.center + 4
        ) {
          if (position.y > bounds.bottom) {
            this.transfer(entity);
            return true;
          }
          entity.position.x = bounds.center;
          return true;
        } else {
          return false;
        }
      case 3:
        bounds = {
          left: 0,
          right: 8,
          center: this.position.tile * 16 + 8
        };
        if (
          position.x < bounds.right &&
          position.y > bounds.center - 4 &&
          position.y < bounds.center + 4
        ) {
          if (position.x < bounds.left) {
            this.transfer(entity);
            return true;
          }
          entity.position.y = bounds.center;
          return true;
        } else {
          return false;
        }
    }
  }
}

module.exports = Door;
},{}],8:[function(require,module,exports){
const FLOOR = new Image();
FLOOR.src = "./assets/sprites_and_sounds/environment/floor_1.png";
const Door = require("./door.js");
const Vector = require("../ray-casting/Vector");
const Edge = require("../ray-casting/Edge");
const EdgeSet = require("../ray-casting/EdgeSet");

class Room {
  constructor(walls = [], doors = []) {
    this.walls = walls; //EdgeSet
    this.doors = doors;
    this.entities = [];
    this.update = this.update.bind(this);
  }

  //need to insure each new Door doesnt overlap with the old ones
  randomDoorTo(room) {
    //new door for this
    let newDoor = Door.Random(this, this.walls.randomEdge());
    this.doors.push(newDoor);

    //new door for other
    let otherDoor = Door.Random(this, this.walls.randomEdge());
    this.doors.push(newDoor)
  }

  GenerateRandom() {
    //generate an assortment of points and then order them in radial order and create an edge set
    let vertices = [];
    for (let i = 3; i < Math.floor(Math.random() * 18); i ++) {
      vertices.push(Vector.Random());
    }
    vertices = vertices.sort((a, b) => {
      return Math.sign(a.theta - b.theta);
    });
    let edges = [];
    for (let j = 0; j < vertices.length - 1; j++) {
      edges.push(new Edge(vertices[j], vertices[j + 1]))
    }
    let walls = new EdgeSet(edges);
    return new Room(walls);
  }

  update() {
    this.enforceBoundaries();
    this.render();
  }

  //needs refactored to use line intersection for collision detection
  enforceBoundaries() {
    this.entities.forEach(entity => {
      let inDoor = false;
      this.doors.forEach(door => {
        if (door.enforceBoundaries(entity)) {
          inDoor = true;
        }
      })
      const position = entity.getPosition();
      if (!inDoor) {
        if (position.x < 8) {
          entity.position.x = 8;
        }
        if (position.x > (this.width * 16) - 8) {
          entity.position.x = this.width * 16 - 8;
        }
        if (position.y < 8) {
          entity.position.y = 8;
        }
        if (position.y > this.height * 16 - 8) {
          entity.position.y = this.height * 16 - 8;
        }
      }
    });
  }

  render() {
    this.ctxList.forEach((ctx, idx) => this.renderOrientation(ctx, idx));
  }

  renderOrientation(ctx, orientation) {
    let width;
    let height;
    if (orientation % 2 === 0) {
      width = this.width;
      height = this.height;
    } else {
      width = this.height;
      height = this.width;
    }
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, (width) * 16, (height) * 16);
    ctx.fill();
    const newFill = ctx.createPattern(FLOOR, "repeat");
    ctx.fillStyle = newFill;
    ctx.beginPath();
    ctx.rect(0, 0, (width) * 16, (height) * 16);
    ctx.fill();
    this.entities.forEach(entity => {
      let entityPosition = this.translateFrom(orientation, entity);
      ctx.drawImage(entity.sprite, entityPosition.x - 8, entityPosition.y - 8);
    });
  }

  //needs moving to the entities
  changePosition() {
    let change = { x: 0, y: 0 };
    Object.keys(this.buttons).forEach(button => {
      if (this.buttons[button]) {
        const vector = DIRECTIONS[button];
        change.x += vector.x;
        change.y += vector.y;
      }
    });
    this.position = {
      x: Math.floor(this.position.x + change.x),
      y: Math.floor(this.position.y + change.y)
    };
  }
}

module.exports = Room;
},{"../ray-casting/Edge":4,"../ray-casting/EdgeSet":5,"../ray-casting/Vector":6,"./door.js":7}],9:[function(require,module,exports){
module.exports = {
  convertCoordToPolar: (coordinate, offset) => {
    let r = Math.sqrt((coordinate.x + offset.x) ** 2 + (coordinate.y + offset.y) ** 2);
    let theta = Math.atan2((coordinate.y + offset.y), (coordinate.x + offset.x));
    return { r, theta };
  },
  drawCone: (ctx, angle1, angle2, screenCenter, radius) => {
    //assuming the coordinates are clockwise
    ctx.fillStyle = "#000"
    ctx.beginPath();
    ctx.arc(screenCenter.x, screenCenter.y, radius, angle2, angle1);
    ctx.lineTo(screenCenter.x, screenCenter.y);
    ctx.closePath();
    ctx.fill();
  }
};
},{}]},{},[2]);
