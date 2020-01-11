
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