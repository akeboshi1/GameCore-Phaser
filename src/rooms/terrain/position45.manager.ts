export class Position45Manager {
  private mRows: number;
  private mCols: number;
  private mTileWidth: number;
  private mTileHeight: number;
  private mOffsetX: number;
  private mOffsetY: number;
  constructor() { }

  settings(rows: number, cols: number, tileWidth: number, tileHeight: number) {
    this.mRows = rows;
    this.mCols = cols;
    this.mTileWidth = tileWidth;
    this.mTileHeight = tileHeight;

    this.mOffsetX = this.mRows * this.mTileWidth >> 1;
    this.mOffsetY = 0;
  }

  transformTo90(x: number, y: number, z?: number) {
    if (z === undefined) { z = 0; }
    return new Phaser.Geom.Point(
      ((x - y) / 2) * this.mTileWidth + this.mOffsetX,
      ((x + y) / 2) * this.mTileHeight + this.mOffsetY
    );
  }

  transformTo45(x: number, y: number, z?: number) {
    if (z === undefined) { z = 0; }
    return new Phaser.Geom.Point(
      Math.floor(y / this.mTileHeight + (x - this.mOffsetX) / this.mTileWidth),
      Math.floor(y / this.mTileHeight - (x - this.mOffsetX) / this.mTileWidth)
    );
  }
}
