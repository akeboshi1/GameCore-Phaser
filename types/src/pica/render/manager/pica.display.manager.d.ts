import { DisplayManager } from "gamecoreRender";
import { Render } from "../pica.render";
import { op_def } from "pixelpai_proto";
export declare class PicaDisplayManager extends DisplayManager {
    protected render: Render;
    constructor(render: Render);
    addFillEffect(x: number, y: number, status: op_def.PathReachableStatus): void;
}
