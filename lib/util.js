module.exports = {
  convertCoordToPolar: (coordinate, offset) => {
    let r = Math.sqrt((coordinate.x + offset.x) ** 2 + (coordinate.y + offset.y) ** 2);
    let theta = Math.atan2((coordinate.y + offset.y), (coordinate.x + offset.x));
    return { r, theta };
  },
  drawCone: (ctx, angle1, angle2, screenCenter, radius) => {
    //assuming the coordinates are clockwise
    ctx.fillStyle = "#000"
    ctx.beginPath();
    ctx.arc(screenCenter.x, screenCenter.y, radius, angle2, angle1);
    ctx.lineTo(screenCenter.x, screenCenter.y);
    ctx.closePath();
    ctx.fill();
  }
};