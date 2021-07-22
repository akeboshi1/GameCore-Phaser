export interface IPos {
    x: number;
    y: number;
    z?: number;
    depth?: number;
}
export declare class LogicPos implements IPos {
    x: number;
    y: number;
    z?: number;
    depth?: number;
    constructor(x?: number, y?: number, z?: number, depth?: number);
    add(x: number, y: number, z?: number): this;
    equal(p: IPos): boolean;
    toString(): string;
    toPoint(): IPos;
}
