import { InteractionBubbleCell } from "./InteractionBubbleCell";
import { BaseUI } from "apowophaserui";
import { Handler } from "utils";
export declare class InteractionBubbleContainer extends BaseUI {
    id: number;
    private mBubble;
    constructor(scene: Phaser.Scene, dpr: number);
    set show(value: boolean);
    get show(): boolean;
    hide(): void;
    setFollow(gameObject: any, fromScene: Phaser.Scene, posFunc?: Function): void;
    setBubble(content: any, handler: Handler): InteractionBubbleCell;
    destroy(): void;
}
