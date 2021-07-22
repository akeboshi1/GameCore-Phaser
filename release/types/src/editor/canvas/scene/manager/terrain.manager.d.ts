import { SceneEditorCanvas } from "../scene.editor.canvas";
import { IPos } from "structure";
export declare class EditorTerrainManager {
    protected sceneEditor: SceneEditorCanvas;
    private mGround;
    constructor(sceneEditor: SceneEditorCanvas);
    destroy(): void;
    create(): Promise<void>;
    existTerrain(x: number, y: number): boolean;
    addTerrains(terrainCoorData: any): void;
    removeTerrains(locations: IPos[]): void;
    protected changeGroundBySN(pos45: IPos, sn: string): void;
    protected changeGroundByTilesetIndex(pos45: IPos, key: number): void;
}
