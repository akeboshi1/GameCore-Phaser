import { Render } from "../../render";
import { ChatCommandInterface, IPosition45Obj } from "structure";
export declare class GridsDebugger implements ChatCommandInterface {
    private render;
    isDebug: boolean;
    private mGraphic;
    private mRoomSize;
    constructor(render: Render);
    destroy(): void;
    setData(posObj: IPosition45Obj): void;
    show(): void;
    hide(): void;
    q(): void;
    v(): void;
    private drawLine;
}
