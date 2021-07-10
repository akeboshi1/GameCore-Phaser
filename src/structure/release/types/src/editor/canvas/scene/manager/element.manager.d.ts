import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { ISprite, IPos } from "structure";
import { SceneEditorCanvas } from "../scene.editor.canvas";
export declare class EditorElementManager extends PacketHandler {
    protected sceneEditor: SceneEditorCanvas;
    private taskQueue;
    private mMap;
    constructor(sceneEditor: SceneEditorCanvas);
    init(): void;
    update(): void;
    destroy(): void;
    addElements(sprites: ISprite[]): void;
    callEditorCreateElementData(sprites: ISprite[]): void;
    updateElements(sprites: op_client.ISprite[]): void;
    callEditorUpdateElementData(sprites: op_client.ISprite[]): void;
    deleteElements(ids: number[]): void;
    callEditorDeleteElementData(ids: number[]): void;
    addToMap(sprite: ISprite): boolean;
    removeFromMap(sprite: ISprite): boolean;
    checkCollision(pos: IPos, sprite: ISprite): boolean;
    protected handleCreateElements(packet: PBpacket): void;
    protected handleDeleteElements(packet: PBpacket): void;
    protected handleSyncElements(packet: PBpacket): void;
    protected setMap(sprite: ISprite, isAdd: boolean): boolean;
    private batchActionSprites;
}
