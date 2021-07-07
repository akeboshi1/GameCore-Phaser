import { IPosition45Obj, IPos } from "structure";
export declare class ReferenceArea extends Phaser.GameObjects.Graphics {
    private mSize;
    private mOrigin;
    constructor(scene: Phaser.Scene);
    draw(area: number[][], origin: IPos, tileWidth: number, tileHeight: number): void;
    setPosition(x?: number, y?: number, z?: number, w?: number): this;
    get size(): IPosition45Obj;
}
