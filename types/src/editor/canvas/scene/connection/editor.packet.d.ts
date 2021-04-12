import { PacketHandler } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import { ISprite } from "structure";
import { IPos } from "utils";
import { SceneEditorCanvas } from "../scene.editor.canvas";
export declare class EditorPacket extends PacketHandler {
    private sceneEditor;
    private connection;
    constructor(sceneEditor: SceneEditorCanvas, connection: any);
    destroy(): void;
    sceneCreate(): void;
    reqEditorSyncPaletteOrMoss(key: number, nodeType: op_def.NodeType): void;
    callEditorCreateElementData(sprites: ISprite[]): void;
    reqEditorAddTerrainsData(locs: op_def.IPBPoint3f[], key: any): void;
    reqEditorDeleteTerrainsData(loc: IPos[]): void;
    reqEditorCreateMossData(locs: op_def.IMossMetaData[]): void;
    reqEditorDeleteMossData(locs: op_def.IMossMetaData[]): void;
    reqEditorUpdateMossData(locs: op_def.IMossMetaData[]): void;
    /**
     * 同步Sprite
     */
    callEditorUpdateElementData(sprites: op_client.ISprite[]): void;
    /**
     * 删除物件
     */
    deleteSprite(ids: number[]): void;
    /**
     * 选择物件通知editor
     */
    sendFetch(ids: number[], nodetype: op_def.NodeType, isMoss?: boolean): void;
    /**
     * @deprecated
     */
    resetCameras(x: number, y: number, width: number, height: number): void;
    private onEnterEditor;
    private onMouseFollowHandler;
    private onSetEditorModeHandler;
    private onAlignGridHandler;
    private onVisibleGridHandler;
    private handleAddTerrains;
    private handleAddMosses;
    private handleDeleteMosses;
    private handleUpdateMosses;
    private handleCreateElements;
    private handleDeleteElements;
    private handleSyncElements;
    private onFetchSpriteHandler;
    private onAddSceneryHandler;
    private onUpdateSceneryHandler;
    private onDeleteSceneryHandler;
    private onFetchSceneryHandler;
}
