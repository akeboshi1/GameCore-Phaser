export interface ILogicPoint {
    x: number;
    y: number;
}

export class LogicPoint implements ILogicPoint {
    public x: number;
    public y: number;
    constructor(x?: number, y?: number) {
        if (x === undefined) { x = 0; }
        if (y === undefined) { y = x; }
        this.x = x;
        this.y = y;
    }

    public setTo(x: number, y: number) {
        if (x === undefined) { x = 0; }
        if (y === undefined) { y = x; }
        this.x = x;
        this.y = y;
        return this;
    }
}
