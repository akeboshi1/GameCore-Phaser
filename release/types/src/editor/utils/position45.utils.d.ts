/// <reference types="tooqingphaser" />
declare type Point45 = Phaser.Geom.Point;
declare type Point90 = Phaser.Geom.Point;
export default class Position45Utils {
    private tileWidth;
    private tileHeight;
    private offsetX;
    private offsetY;
    constructor(tileWidth: number, tileHeight: number, offsetX: number, offsetY: number);
    setOffset(x: number, y: number): void;
    transformTo90(p: Point45): Point90;
    transformTo45(p: Point90): Point45;
}
export {};
