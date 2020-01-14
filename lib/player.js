const DIRECTIONS = {
  w: new Vector(0, -1.5),
  s: new Vector(0, 1.5),
  a: new Vector(-1.5, 0),
  d: new Vector(1.5, 0)
};

const Vector = require("./ray-casting/Vector");
const Edge = require("./ray-casting/Edge");
const EdgeSet = require("./ray-casting/EdgeSet");

const SPRITE = new Image();
SPRITE.src = "./assets/sprites_and_sounds/entities/creatures/player/sprites/idle/idle_0.png";

class Player {
  constructor(canvas, room, buttons) {
    this.ctx = canvas.getContext('2d');
    this.screenCenter = new Vector(canvas.width / 2, canvas.height / 2);
    this.room = room;
    this.position = new Vector(0, 0);
    this.buttons = buttons;
    room.entities.push(this);
    this.sprite = SPRITE;
    this.orientation = 0;
    this.generateBounds();
  }

  generateBounds() {
    let topLeft = this.position.plus(new Vector(-8, -8));
    let topRight = this.position.plus(new Vector(8, -8));
    let bottomLeft = this.position.plus(new Vector(-8, 8));
    let bottomRight = this.position.plus(new Vector(8, 8));
    let bounds = new EdgeSet([new Edge(topLeft, topRight), new Edge(topRight, bottomRight), new Edge(bottomRight, bottomLeft), new Edge(bottomLeft, topLeft)]);
    this.edges = bounds.rotate(this.position, this.orientation)
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

  updateOrientation(change) {
    this.edges.rotate(this.position, change);
    this.orientation = (this.orientation + change) % Math.PI;
  }

  move() {
    let change = new Vector(0, 0);
    ["a", "w", "s", "d"].forEach(button => {
      if (this.buttons[button]) {
        const vector = DIRECTIONS[this.orientation][button];
        change = change.plus(vector);
      }
    });
    this.position = this.position.plus(change);
    this.edges = this.edges.translate(change);
    if (this.buttons[" "]) {
      this.updateOrientation();
      this.buttons[" "] = false;
    }
  }

  unmove() {
    let change = { x: 0, y: 0 };
    ["a", "w", "s", "d"].forEach(button => {
      if (this.buttons[button]) {
        const vector = DIRECTIONS[this.orientation][button];
        change.x -= vector.x;
        change.y -= vector.y;
      }
    });
    this.position.x = this.position.x + change.x;
    this.position.y = this.position.y + change.y;
  }

  render(ctx) {

  }
}

module.exports = Player;