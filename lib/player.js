const DIRECTIONS = {
  w: { x: 0, y: -2 },
  s: { x: 0, y: 2 },
  a: { x: -2, y: 0 },
  d: { x: 2, y: 0 }
};

const SPRITE = new Image();
SPRITE.src = "../assets/sprites_and_sounds/entities/creatures/player/sprites/idle/idle_0.png";

class Player {
  constructor(room, buttons) {
    this.room = room;
    this.position = { x: (room.width * 16) / 2, y: (room.height * 16) / 2};
    this.buttons = buttons;
    room.entities.push(this);
    this.sprite = SPRITE;
  }

  update() {
    this.move();
  }

  move() {
    let change = { x: 0, y: 0 };
    Object.keys(this.buttons).forEach(button => {
      if (this.buttons[button]) {
        const vector = DIRECTIONS[button];
        change.x += vector.x;
        change.y += vector.y;
      }
    });
    this.position.x = Math.floor(this.position.x + change.x);
    this.position.y = Math.floor(this.position.y + change.y);
    console.log(this.position);
  }
}

module.exports = Player;