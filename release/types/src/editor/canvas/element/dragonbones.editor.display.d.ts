/// <reference types="tooqinggamephaser" />
import { BaseDragonbonesDisplay } from "baseRender";
export declare class DragonbonesEditorDisplay extends BaseDragonbonesDisplay {
    private mWebHomePath;
    constructor(scene: Phaser.Scene, mWebHomePath: string);
    load(): Promise<any>;
    displayCreated(): void;
    setDraggable(val: boolean): void;
    stop(): void;
    protected partNameToLoadUrl(val: string): string;
    private clearArmatureUnusedSlots;
}
