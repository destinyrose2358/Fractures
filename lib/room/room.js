const FLOOR = new Image();
FLOOR.src = "./assets/sprites_and_sounds/environment/floor_1.png";
const Door = require("./door.js");
const Vector = require("../ray-casting/Vector");
const Edge = require("../ray-casting/Edge");
const EdgeSet = require("../ray-casting/EdgeSet");

class Room {
  constructor(walls) {
    this.walls = walls; //EdgeSet
    this.doors = [];
    this.entities = [];
    this.update = this.update.bind(this);
  }

  //need to insure each new Door doesnt overlap with the old ones
  randomDoorTo(room) {
    //new door for this
    Door.Random(this, room);
  }

  GenerateRandom() {
    //generate an assortment of points and then order them in radial order from their center and create an edge set
    let vertices = [];
    for (let i = 3; i < Math.floor(Math.random() * 18); i ++) {
      vertices.push(Vector.Random());
    }
    let center = Vector.midPoint(vertices);
    vertices = vertices.sort((a, b) => {
      return Math.sign(a.minus(center).theta - b.minus(center).theta);
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

  enforceBoundaries() {
    this.entities.forEach(entity => {
      let inDoor = false;
      if (!this.edges.inBounds(entity.edges)) {
        this.doors.forEach(door => {
          if (door.enforceBoundaries(entity)) {
            inDoor = true;
          }
        })
        if (!inDoor) entity.unmove();
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