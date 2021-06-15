/// <reference types="tooqingphaser" />
import { BBCodeText } from "apowophaserui";
import { SoundButton } from "./soundButton";
import { Handler } from "structure";
import { DynamicImage } from "baseRender";
export declare class PropItem extends SoundButton {
    itemData: any;
    protected dpr: number;
    protected key: string;
    protected itemIcon: DynamicImage;
    protected itemCount: BBCodeText;
    protected bg: Phaser.GameObjects.Image;
    protected send: Handler;
    protected bgframe: string;
    constructor(scene: Phaser.Scene, key: string, bgframe: string, dpr: number, style?: any);
    setHandler(handler: Handler): void;
    setItemData(data: any): void;
    setTextPosition(x: number, y: number): void;
}
