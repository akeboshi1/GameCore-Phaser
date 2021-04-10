import { Render } from "gamecoreRender";
export declare class MatterBodies {
    private render;
    private mGraphics;
    constructor(render: Render);
    update(): void;
    renderWireframes(bodies: any): void;
    destroy(): void;
}
