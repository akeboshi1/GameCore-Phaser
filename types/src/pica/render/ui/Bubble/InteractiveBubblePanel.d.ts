import { BasePanel, UiManager } from "gamecoreRender";
export declare class InteractiveBubblePanel extends BasePanel {
    private content;
    private map;
    private mBubble;
    constructor(uiManager: UiManager);
    resize(width: number, height: number): void;
    init(): void;
    destroy(): void;
    clearInteractionBubble(id: number): void;
    showInteractionBubble(content: any, ele: any): void;
    updateBubblePos(gameObject: any, scene: Phaser.Scene): void;
    update(): void;
    private onInteractiveBubbleHandler;
}
