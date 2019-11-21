const FLOOR = new Image();
FLOOR.src = "../assets/sprites_and_sounds/environment/floor_1.png";
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
        canvas.width = (width + 2) * 16;
        canvas.height = (height + 2) * 16;
      } else {
        canvas.width = (height + 2) * 16;
        canvas.height = (width + 2) * 16;
      }
      canvas.imageSmoothingEnabled = false;
      ctxList.push(canvas.getContext('2d'));
    })
    this.ctxList = ctxList;
    this.width = width;
    this.height = height;
    this.doors = doors.map(door => {
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

  translateDoorFrom(center, dimensions, orientation) {
    let newPosition;
    switch (orientation) {
      case 0:
        newPosition = center;
        break;
      case 3:
        newPosition = { x: this.height * 16 - center.y, y: center.x };
        break;
      case 2:
        newPosition = {
          x: this.width * 16 - center.x,
          y: this.height * 16 - center.y
        };
        break;
      case 1:
        newPosition = { x: center.y, y: this.width * 16 - center.x };
        break;
    }
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
    ctx.clearRect(0, 0, (width + 2) * 16, (height + 2) * 16);
    const newFill = ctx.createPattern(FLOOR, "repeat");
    ctx.fillStyle = newFill;
    ctx.save();
    ctx.beginPath();
    ctx.rect(16, 16, width * 16, height * 16);
    ctx.translate(16, 16);
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.strokeStyle = "#aa8d7a";
    ctx.lineWidth = 4;
    ctx.strokeRect(
      14,
      14,
      width * 16 + 4,
      height * 16 + 4
    );
    ctx.save();
    ctx.beginPath();
    this.doors.forEach(door => {
      let center = {};
      let dimensions = {};
      switch (door.position.orientation) {
        case 0:
          center.x = (door.position.tile) * 16 + 8;
          center.y = -4;
          dimensions.x = 14;
          dimensions.y = 8;
          break;
        case 1:
          center.x = (this.width) * 16 + 4;
          center.y = (door.position.tile) * 16 + 8;
          dimensions.x = 8;
          dimensions.y = 14;
          break;
        case 2:
          center.x = (door.position.tile) * 16 + 8;
          center.y = (this.height) * 16 + 4;
          dimensions.x = 14;
          dimensions.y = 8;
          break;
        case 3:
          center.x = -4;
          center.y = (door.position.tile) * 16 + 8;
          dimensions.x = 8;
          dimensions.y = 14;
          break;
      }
      let translatedDoor = this.translateDoorFrom(center, dimensions, orientation);
      center = translatedDoor.center;
      dimensions = translatedDoor.dimensions;
      ctx.rect(
        center.x - dimensions.x / 2 + 16,
        center.y - dimensions.y / 2 + 16,
        dimensions.x,
        dimensions.y
      );
    });
    ctx.translate(16, 16);
    ctx.fill();
    ctx.restore();
    this.entities.forEach(entity => {
      let entityPosition = this.translateFrom(orientation, entity);
      ctx.drawImage(entity.sprite, entityPosition.x + 8, entityPosition.y + 8);
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