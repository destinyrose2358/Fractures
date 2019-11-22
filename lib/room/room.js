const FLOOR = new Image();
FLOOR.src = "assets/sprites_and_sounds/environment/floor_1.png";
const Door = require("./door.js");

class Room {
  constructor(width = 1, height = 1, doors = []) {
    this.canvasList = [
      document.createElement('canvas'),
      document.createElement('canvas'),
      document.createElement('canvas'),
      document.createElement('canvas')
    ];

    let ctxList = [];
    this.canvasList.forEach((canvas, idx) => {
      if (idx % 2 === 0) {
        canvas.width = (width) * 16;
        canvas.height = (height) * 16;
      } else {
        canvas.width = (height) * 16;
        canvas.height = (width) * 16;
      }
      canvas.imageSmoothingEnabled = false;
      ctxList.push(canvas.getContext('2d'));
    })
    this.ctxList = ctxList;
    this.width = width;
    this.height = height;
    this.doors = doors.sort((a,b) => Math.sign(a.position.tile - b.position.tile)).map(door => {
      return new Door(this, door.position);
    });
    this.entities = [];
    this.update = this.update.bind(this);
  }

  update() {
    this.enforceBoundaries();
    this.render();
  }

  getDimensions(orientation) {
    if (orientation % 2 === 0) {
      return { width: this.width, height: this.height };
    } else {
      return { width: this.height, height: this.width};
    }
  }

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

  translateFrom(orientation, entity) {
    let position = entity.getPosition();
    let newPosition;
    switch (orientation) {
      case 0:
        newPosition = position;
        break;
      case 3:
        newPosition = { x: this.height * 16 - position.y, y: position.x };
        break;
      case 2:
        newPosition = { x: this.width * 16 - position.x, y: this.height * 16 - position.y };
        break;
      case 1:
        newPosition = { x: position.y, y: this.width * 16 - position.x };
        break;
    }
    return newPosition;
  }

  translatePosition(position, orientation) {
    let newPosition;
    switch (orientation) {
      case 0:
        newPosition = position;
        break;
      case 3:
        newPosition = { x: this.height * 16 - position.y, y: position.x };
        break;
      case 2:
        newPosition = {
          x: this.width * 16 - position.x,
          y: this.height * 16 - position.y
        };
        break;
      case 1:
        newPosition = { x: position.y, y: this.width * 16 - position.x };
        break;
    }
    return newPosition;
  }

  translateDoorFrom(center, dimensions, orientation) {
    let newPosition = this.translatePosition(center, orientation);
    let newDimensions;
    if (orientation % 2 === 0) {
      newDimensions = dimensions;
    } else {
      newDimensions = { x: dimensions.y, y: dimensions.x };
    }
    return { center: newPosition, dimensions: newDimensions};
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