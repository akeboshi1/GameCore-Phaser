/// <reference types="tooqinggamephaser" />
import { BaseDragonbonesDisplay } from "baseRender";
export declare class DragonbonesEditorDisplay extends BaseDragonbonesDisplay {
    constructor(scene: Phaser.Scene);
    displayCreated(): void;
    setDraggable(val: boolean): void;
    stop(): void;
    private clearArmatureUnusedSlots;
}
