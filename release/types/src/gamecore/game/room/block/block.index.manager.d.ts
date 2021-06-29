import { IRectangle } from "structure";
import { IRoomService } from "../room";
export declare class BlockIndexManager {
    private room;
    private preBlockIndex;
    private zoom;
    constructor(room: IRoomService);
    checkBlockIndex(cameraView: IRectangle): Promise<void>;
    private syncBlockIndex;
}
