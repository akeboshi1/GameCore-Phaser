type Point45 = Phaser.Geom.Point;
type Point90 = Phaser.Geom.Point;
export default class Position45Utils {
    constructor(
        private tileWidth: number,
        private tileHeight: number,
        private offsetX: number,
        private offsetY: number
    ) {
    }

    setOffset(x: number, y: number) {
        this.offsetX = x;
        this.offsetY = y;
    }

    transformTo90(p: Point45): Point90 {
        const x = p.x;
        const y = p.y;
        return new Phaser.Geom.Point(
            ((x - y) / 2) * this.tileWidth + this.offsetX,
            ((x + y) / 2) * this.tileHeight + this.offsetY
        );
    }

    transformTo45(p: Point90): Point45 {
        const x = p.x;
        const y = p.y;
        return new Phaser.Geom.Point(
            Math.floor(y / this.tileHeight + (x - this.offsetX) / this.tileWidth),
            Math.floor(y / this.tileHeight - (x - this.offsetX) / this.tileWidth)
        );
    }
}
