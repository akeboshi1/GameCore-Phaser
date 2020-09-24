export interface IPosition45Obj {
    readonly cols: number;
    readonly rows: number;
    readonly tileWidth: number;
    readonly tileHeight: number;
    readonly sceneWidth?: number;
    readonly sceneHeight?: number;
    readonly offset?: LogicPoint;
}
class LogicPoint {
    public x: number;
    public y: number;
    constructor(x?: number, y?: number) {
        this.x = x || 0;
        this.y = y || 0;
    }
}
