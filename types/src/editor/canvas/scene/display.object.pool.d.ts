import { Sprite } from "baseModel";
import { ISprite } from "structure";
import { SceneEditorCanvas } from "./scene.editor.canvas";
export declare class DisplayObjectPool {
    private sceneEditor;
    private terrains;
    private mosses;
    private elements;
    private walls;
    private caches;
    private readonly POOLOBJECTCONFIG;
    constructor(sceneEditor: SceneEditorCanvas);
    getPool(poolName: string): any;
    push(poolName: string, id: string, sprite: Sprite): void;
    remove(poolName: string, id: string): void;
    update(poolName: string, id: string, newSprite: ISprite): void;
    addCache(id: number): void;
    get(id: string): any;
    destroy(): void;
    private tryDeleteMountSprites;
}
