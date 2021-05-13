import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_def } from "pixelpai_proto";
import { SceneEditorCanvas } from "../scene.editor.canvas";
export declare class EditorMossManager extends PacketHandler {
    protected sceneEditor: SceneEditorCanvas;
    private taskQueue;
    private editorMosses;
    constructor(sceneEditor: SceneEditorCanvas);
    update(): void;
    destroy(): void;
    addMosses(coorData: any): void;
    reqEditorCreateMossData(locs: op_def.IMossMetaData[]): void;
    updateMosses(elements: any): void;
    reqEditorUpdateMossData(locs: op_def.IMossMetaData[]): void;
    deleteMosses(ids: number[]): void;
    reqEditorDeleteMossData(locs: op_def.IMossMetaData[]): void;
    addToMap(): void;
    removeFromMap(): void;
    protected handleAddMosses(packet: PBpacket): void;
    protected handleDeleteMosses(packet: PBpacket): void;
    protected handleUpdateMosses(packet: PBpacket): void;
    private batchActionSprites;
}
