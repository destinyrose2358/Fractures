const FLOOR = new Image();
FLOOR.src = "../assets/sprites_and_sounds/environment/floor_1.png";
const Door = require("./door.js");

class Room {
  constructor(width = 1, height = 1, doors = []) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = (width + 2) * 16;
    this.canvas.height = (height + 2) * 16;
    this.ctx = this.canvas.getContext('2d');
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

  enforceBoundaries() {
    this.entities.forEach(entity => {
      let inDoor = false;
      this.doors.forEach(door => {
        if (door.enforceBoundaries(entity)) {
          inDoor = true;
        }
      })
      if (!inDoor) {
        if (entity.position.x < 8) {
          entity.position.x = 8;
        }
        if (entity.position.x > (this.width * 16) - 8) {
          entity.position.x = this.width * 16 - 8;
        }
        if (entity.position.y < 8) {
          entity.position.y = 8;
        }
        if (entity.position.y > this.height * 16 - 8) {
          entity.position.y = this.height * 16 - 8;
        }
      }
    });
  }

  render() {
    this.ctx.clearRect(0, 0, (this.width + 2) * 16, (this.height + 2) * 16);
    const newFill = this.ctx.createPattern(FLOOR, "repeat");
    this.ctx.fillStyle = newFill;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(16, 16, this.width * 16, this.height * 16);
    this.ctx.translate(16, 16);
    this.ctx.fill();
    this.ctx.restore();
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#aa8d7a";
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(
      14,
      14,
      this.width * 16 + 4,
      this.height * 16 + 4
    );
    this.ctx.save();
    this.ctx.beginPath();
    this.doors.forEach(door => {
      let topLeft = {};
      let dimensions = {};
      switch (door.position.orientation) {
        case 0:
          topLeft.x = (door.position.tile + 1) * 16 + 1;
          topLeft.y = 8;
          dimensions.x = 14;
          dimensions.y = 8;
          break;
        case 1:
          topLeft.x = (this.width + 1) * 16;
          topLeft.y = (door.position.tile + 1) * 16 + 1;
          dimensions.x = 8;
          dimensions.y = 14;
          break;
        case 2:
          topLeft.x = (door.position.tile + 1) * 16 + 1;
          topLeft.y = (this.height + 1) * 16;
          dimensions.x = 14;
          dimensions.y = 8;
          break;
        case 3:
          topLeft.x = 8;
          topLeft.y = (door.position.tile + 1) * 16 + 1;
          dimensions.x = 8;
          dimensions.y = 14;
          break;
      }
      this.ctx.rect(topLeft.x, topLeft.y, dimensions.x, dimensions.y);
    });
    this.ctx.translate(16, 16);
      this.ctx.fill();
      this.ctx.restore();
    this.entities.forEach(entity => {
      this.ctx.drawImage(entity.sprite, entity.position.x + 8, entity.position.y + 8);
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