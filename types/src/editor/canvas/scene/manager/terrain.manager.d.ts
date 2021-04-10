import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_def } from "pixelpai_proto";
import { IPos } from "utils";
import { SceneEditorCanvas } from "../scene.editor.canvas";
export declare class EditorTerrainManager extends PacketHandler {
    protected sceneEditor: SceneEditorCanvas;
    protected taskQueue: Map<string, any>;
    private mEditorTerrains;
    constructor(sceneEditor: SceneEditorCanvas);
    destroy(): void;
    addTerrains(terrainCoorData: any): void;
    reqEditorAddTerrainsData(locs: op_def.IPBPoint3f[], key: any): void;
    removeTerrains(locations: IPos[]): void;
    reqEditorDeleteTerrainsData(loc: IPos[]): void;
    update(): void;
    addToMap(): void;
    removeFromMap(): void;
    existTerrain(x: number, y: number): boolean;
    protected handleAddTerrains(packet: PBpacket): void;
    protected handleDeleteTerrains(packet: PBpacket): void;
    private exist;
    private batchActionSprites;
    private genLocId;
}
