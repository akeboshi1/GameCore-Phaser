export interface ILogicPoint {
    x: number;
    y: number;
}
export declare class LogicPoint implements ILogicPoint {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    setTo(x: number, y: number): this;
}
