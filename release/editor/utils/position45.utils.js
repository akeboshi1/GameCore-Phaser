export default class Position45Utils {
  constructor(tileWidth, tileHeight, offsetX, offsetY) {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }
  setOffset(x, y) {
    this.offsetX = x;
    this.offsetY = y;
  }
  transformTo90(p) {
    const x = p.x;
    const y = p.y;
    return new Phaser.Geom.Point((x - y) / 2 * this.tileWidth + this.offsetX, (x + y) / 2 * this.tileHeight + this.offsetY);
  }
  transformTo45(p) {
    const x = p.x;
    const y = p.y;
    return new Phaser.Geom.Point(Math.floor(y / this.tileHeight + (x - this.offsetX) / this.tileWidth), Math.floor(y / this.tileHeight - (x - this.offsetX) / this.tileWidth));
  }
}
