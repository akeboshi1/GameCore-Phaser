import { PacketHandler } from "net-socket-packet";
import { SceneEditorCanvas } from "../scene.editor.canvas";
import { IScenery } from "structure";
export declare class EditorSkyboxManager extends PacketHandler {
    private sceneEditor;
    private blocks;
    private mSelected;
    constructor(sceneEditor: SceneEditorCanvas);
    destroy(): void;
    add(scenery: IScenery): void;
    update(scenery: IScenery): void;
    remove(id: number): void;
    fetch(id: number): void;
    unselected(): void;
    move(pointer: Phaser.Input.Pointer): void;
    private onAddSceneryHandler;
    private onUpdateSceneryHandler;
    private onDeleteSceneryHandler;
    private onSyncSceneryOffset;
}
