import { Render } from "gamecoreRender";
export declare class ServerPosition {
    private mGridhics;
    private dpr;
    constructor(render: Render);
    draw(x: number, y: number): void;
    destroy(): void;
}
