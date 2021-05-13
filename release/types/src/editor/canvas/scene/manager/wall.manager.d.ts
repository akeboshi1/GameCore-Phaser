import { PacketHandler } from "net-socket-packet";
import { IPos } from "structure";
import { SceneEditorCanvas } from "../scene.editor.canvas";
export declare class EditorWallManager extends PacketHandler {
    protected sceneEditor: SceneEditorCanvas;
    protected taskQueue: Map<string, any>;
    private walls;
    constructor(sceneEditor: SceneEditorCanvas);
    update(): void;
    addWalls(terrainCoorData: any): void;
    removeWalls(locations: IPos[]): void;
    private handleCreateWalls;
    private handleDeleteWalls;
    private batchActionSprites;
    private reqEditorAddTerrainsData;
    private reqEditorDeleteTerrainsData;
    private exist;
    private removeDuplicate;
    private genLocId;
}
