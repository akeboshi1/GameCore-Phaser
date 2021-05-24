/// <reference types="phaser" />
import { BasePanel } from "../components/base.panel";
import { NinePatch } from "../components/nine.patch";
import { UiManager } from "../ui.manager";
export declare class BasicRankPanel extends BasePanel {
    protected mTitleLabel: Phaser.GameObjects.Text;
    protected mTexts: Phaser.GameObjects.Text[];
    protected mBackground: NinePatch;
    protected mChildContainer: Phaser.GameObjects.Container;
    constructor(uiManager: UiManager);
    addItem(items: any): void;
    tweenView(show: boolean): void;
    update(param: any): void;
    destroy(): void;
    protected preload(): void;
    protected init(): void;
    protected clearText(): void;
}
