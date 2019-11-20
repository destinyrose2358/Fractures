
class Tile {
  constructor(canvas, position, tile) {
    this.canvas = canvas.getContext('2d');
    this.canvasCenter = { x: canvas.width / 2, y: canvas.height / 2};
    this.position = position;
    this.tile = new Image();
    this.tile.src = tile;
  }

  render() {
    this.canvas.drawImage(
      this.tile,
      Math.floor(this.canvasCenter.x - this.tile.width / 2) + (this.position.x * 16),
      Math.floor(this.canvasCenter.y - this.tile.height / 2) + (this.position.y * 16)
    );
  }

  changePosition(change) {
    this.position = {
      x: this.position.x + change.x,
      y: this.position.y + change.y
    };
  }
}

module.exports = Tile;