const Edge = require("../ray-casting/Edge");
const EdgeSet = require("../ray-casting/EdgeSet");
const Vector = require("../ray-casting/Vector");

class Door {
  constructor(room, edge, orientation) {
    
    let frontBound;
    
    let testPoint = new Edge(edge.start, new Vector(0, 0)).project(0.001);
    let leftEdge = edge.rotate(edge.start, 1.5708);
    let rightEdge = edge.rotate(edge.end, -1.5708);
    let frontEdge = rightEdge.rotate(rightEdge.end, -1.5708);
    let newBound = new EdgeSet([edge, leftEdge, rightEdge, frontEdge]);
    if (newBound.inBounds(testPoint)) {
      frontBound = newBound;
    }
    let otherLeftEdge = edge.rotate(edge.start, -1.5708);
    let otherRightEdge = edge.rotate(edge.end, 1.5708);
    let otherFrontEdge = rightEdge.rotate(rightEdge.end, 1.5708);
    if (!frontBound) {
      frontBound = new EdgeSet([edge, otherLeftEdge, otherRightEdge, otherFrontEdge]);;
    }
    let fullBound = new EdgeSet([leftEdge, otherLeftEdge, rightEdge, otherRightEdge, frontEdge, otherFrontEdge]);
    
    this.room = room;
    this.frontBound = frontBound;
    this.fullBound = fullBound;
    this.center = edge.project(0.5);
    this.orientation = orientation;
    this.connectedDoor = null;
  }

  Random(room1, room2) {
    let edge1 = room1.edges.randomEdge(23);
    while (room1.doors.some(door => door.edge.intersection(edge1))) {
      edge1 = room1.edges.randomEdge(23);
    }
    let edge2 = room2.edges.randomEdge(23);
    while (room2.doors.some(door => door.edge.intersection(edge2))) {
      edge2 = room2.edges.randomEdge(23);
    }
    let randomLength = Math.floor(Math.random() * (Math.min(edge1.length, edge2.length) - 23)) + 23;
    let door1Edge = edge1.RandomSubSegment(randomLength);
    let door2Edge = edge2.RandomSubSegment(randomLength);
    let door1 = new Door(room1, door1Edge);
    let door2 = new Door(room2, door2Edge);
    room1.doors.push(door1);
    room2.doors.push(door2);
    door1.connectedDoor = doors.room2;
    door2.connectedDoor = doors.room1;
    return doors;
  }

  enforceBoundaries(entity) {
    //if entity collides with the doors edges then unmove the entity and return true;
    //check if entity is positioned outside of front
    if (this.fullBound.isColliding(entity.edges) {
      entity.unmove();
      return true;
    } else if (this.fullBound.inBounds(entity.edges) && !this.frontBound.inBounds(entity.edges)) {
      //if entity is in bounds of the door but not the front bound then begin the transfer to the other room
      if (this.fullBound.inBoundsVector(entity.position) && !this.frontBound.inBoundsVector(entity.position)) 
    }
    return false;  
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
    entity.updateOrientation(0);
    this.connectedDoor.receiveEntity(entity);
  }

  receiveEntity(entity) {
    entity.room = this.room;
    this.room.entities.push(entity);
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

  
}

module.exports = Door;