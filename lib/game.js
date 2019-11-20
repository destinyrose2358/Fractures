const Room = require("./room/room.js");
const Player = require("./player.js");

class Game {
  constructor(seed) {
    let canvas = document.getElementById("game-screen");
    this.screenCenter = { x: canvas.width / 2, y: canvas.height / 2 };
    this.canvasCtx = canvas.getContext('2d');
    this.seed = seed;
    this.buttons = { w: false, s: false, a: false, d: false };
    this.rooms = [
      new Room(10, 10, [
        { position: { orientation: 2, tile: 0 } },
        { position: { orientation: 2, tile: 1 } },
        { position: { orientation: 0, tile: 2 } },
        { position: { orientation: 3, tile: 9 } },
        { position: { orientation: 1, tile: 7 } }
      ]),
      new Room(12, 7, [
        { position: { orientation: 3, tile: 0 } },
        { position: { orientation: 2, tile: 1 } },
        { position: { orientation: 2, tile: 2 } },
        { position: { orientation: 1, tile: 5 } },
        { position: { orientation: 1, tile: 2 } }
      ])
    ];
    const door1 = this.rooms[0].doors[0];
    const door2 = this.rooms[1].doors[0];
    door1.connectedDoor = door2;
    door2.connectedDoor = door1;
    this.player = new Player(this.rooms[0], this.buttons);
    document.addEventListener("keydown", e => {
      if (Object.keys(this.buttons).includes(e.key)) {
        this.buttons[e.key] = true;
      }
      
    });
    document.addEventListener("keyup", e => {
      if (Object.keys(this.buttons).includes(e.key)) {
        this.buttons[e.key] = false;
      }
    });
    this.update = this.update.bind(this);
    this.update();
  }

  update() {
    this.player.update();
    this.rooms.forEach(room => room.update());
    this.render();
    requestAnimationFrame(this.update);
  }

  render() {
    this.canvasCtx.clearRect(0, 0, 600, 600);
    this.canvasCtx.fillStyle = this.canvasCtx.createPattern(this.player.room.canvas, "no-repeat");
    this.canvasCtx.save();
    this.canvasCtx.fillRect(0, 0, 500, 500);
    this.canvasCtx.restore();
  }
}

module.exports = Game;
