import { BasePlaySceneGuide, UiManager } from "gamecoreRender";
export declare class FurnitureGuidePanel extends BasePlaySceneGuide {
    constructor(uiManager: UiManager);
    protected gameObjectDownHandler(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject): void;
}
