
class Door {
  constructor(room, position) {
    //positions {orientation: 0-4 0 top clockwise after, tile: 0 for farthest left or top}
    this.room = room;
    this.position = position;
    this.connectedDoor = null;
  }

  transfer(entity) {
    const entityIndex = this.room.entities.indexOf(entity);
    this.room.entities.splice(entityIndex, 1)
    console.log(this.room.entities);
    this.connectedDoor.receiveEntity(entity);
  }

  receiveEntity(entity) {
    entity.room = this.room;
    this.room.entities.push(entity);
    switch (this.position.orientation) {
      case 0:
        entity.position.x = this.position.tile * 16 + 8;
        entity.position.y = -7;
        break;
      case 1:
        entity.position.x = this.room.width * 16 + 7;
        entity.position.y = this.position.tile * 16 + 8;
        break
      case 2:
        entity.position.x = this.position.tile * 16 + 8;
        entity.position.y = this.room.height * 16 + 7;
        break;
      case 3:
        entity.position.x = -7;
        entity.position.y = this.position.tile * 16 + 8;
        break;
    }
  }

  enforceBoundaries(entity) {
    let bounds;
    switch (this.position.orientation) {
      case 0:
        bounds = {
          center: this.position.tile * 16 + 8,
          bottom: 8,
          top: -8
        };
        if (
          entity.position.y < bounds.bottom &&
          entity.position.x > bounds.center - 4 &&
          entity.position.x < bounds.center + 4
        ) {
          if (entity.position.y < bounds.top) {
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
          right: this.room.width * 16 + 8,
          center: this.position.tile * 16 + 8
        };
        if (
          entity.position.x > bounds.left &&
          entity.position.y > bounds.center - 4 &&
          entity.position.y < bounds.center + 4
        ) {
          if (entity.position.x > bounds.right) {
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
          bottom: this.room.height * 16 + 8,
          top: this.room.height * 16 - 8
        };
        if (
          entity.position.y > bounds.top &&
          entity.position.x > bounds.center - 4 &&
          entity.position.x < bounds.center + 4
        ) {
          if (entity.position.y > bounds.bottom) {
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
          left: -8,
          right: 8,
          center: this.position.tile * 16 + 8
        };
        if (
          entity.position.x < bounds.right &&
          entity.position.y > bounds.center - 4 &&
          entity.position.y < bounds.center + 4
        ) {
          if (entity.position.x < bounds.left) {
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