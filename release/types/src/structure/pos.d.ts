import { IPos } from "./logic.pos";
export declare class Pos implements IPos {
    x: number;
    y: number;
    z?: number;
    depth?: number;
    constructor();
    constructor(x: number, y: number, z?: number, depth?: number);
    add(x: number, y: number, z?: number): Pos;
    equal(p: Pos): boolean;
    toString(): string;
    toPoint(): IPos;
}
