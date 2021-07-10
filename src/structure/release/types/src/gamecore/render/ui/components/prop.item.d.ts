import { BBCodeText } from "apowophaserui";
import { SoundButton } from "./soundButton";
import { Handler } from "structure";
import { DynamicImage } from "baseRender";
import { Render } from "../../render";
export declare class PropItem extends SoundButton {
    protected render: Render;
    itemData: any;
    protected dpr: number;
    protected key: string;
    protected itemIcon: DynamicImage;
    protected itemCount: BBCodeText;
    protected bg: Phaser.GameObjects.Image;
    protected send: Handler;
    protected bgframe: string;
    constructor(scene: Phaser.Scene, render: Render, key: string, bgframe: string, dpr: number, style?: any);
    setHandler(handler: Handler): void;
    setItemData(data: any): void;
    setTextPosition(x: number, y: number): void;
}
