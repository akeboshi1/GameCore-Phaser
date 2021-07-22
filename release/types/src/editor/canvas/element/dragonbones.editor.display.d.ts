/// <reference types="tooqingphaser" />
import { BaseDragonbonesDisplay } from "baseRender";
export declare class DragonbonesEditorDisplay extends BaseDragonbonesDisplay {
    constructor(scene: Phaser.Scene, mWebHomePath: string);
    load(): Promise<any>;
    displayCreated(): void;
    setDraggable(val: boolean): void;
    stop(): void;
    private clearArmatureUnusedSlots;
}
