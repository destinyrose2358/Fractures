const DIRECTIONS = {
  0: {
    w: { x: 0, y: -1.5 },
    s: { x: 0, y: 1.5 },
    a: { x: -1.5, y: 0 },
    d: { x: 1.5, y: 0 }
  },
  1: {
    a: { x: 0, y: -1.5 },
    d: { x: 0, y: 1.5 },
    s: { x: -1.5, y: 0 },
    w: { x: 1.5, y: 0 }
  },
  2: {
    s: { x: 0, y: -1.5 },
    w: { x: 0, y: 1.5 },
    d: { x: -1.5, y: 0 },
    a: { x: 1.5, y: 0 }
  },
  3: {
    d: { x: 0, y: -1.5 },
    a: { x: 0, y: 1.5 },
    w: { x: -1.5, y: 0 },
    s: { x: 1.5, y: 0 }
  }
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