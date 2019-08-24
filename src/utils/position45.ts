export class Position45 {
  static readonly titleWidth = 60;
  static readonly titleHeight = 30;

  static transformTo90(x: number, y: number) {
    return new Phaser.Geom.Point(
      ((x - y) / 2) * Position45.titleWidth,
      ((x + y) / 2) * Position45.titleHeight
    );
  }

  static transformTo45(x: number, y: number) {
    return new Phaser.Geom.Point(
      Math.floor(y / Position45.titleHeight + (x) / Position45.titleWidth),
      Math.floor(y / Position45.titleHeight - (x) / Position45.titleWidth)
    );
  }
}