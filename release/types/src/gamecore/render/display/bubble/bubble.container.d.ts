import { Url } from "utils";
import { IDisplayObject } from "../display.object";
export declare class BubbleContainer extends Phaser.GameObjects.Container {
    private url;
    private mBubbles;
    private mArrow;
    private mScale;
    constructor(scene: Phaser.Scene, scale: number, url: Url);
    addBubble(text: string, bubbleSetting: any): void;
    follow(target: IDisplayObject): void;
    updatePos(x: number, y: number): void;
    destroy(fromScene?: boolean): void;
    removeFormParent(): void;
    private createBubble;
    private onRemoveBubble;
}
