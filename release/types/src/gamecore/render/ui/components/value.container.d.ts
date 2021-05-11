/// <reference types="tooqinggamephaser" />
import { Button } from "apowophaserui";
import { Handler } from "structure";
export declare class ValueContainer extends Phaser.GameObjects.Container {
    protected mText: Phaser.GameObjects.Text;
    protected mAddBtn: Button;
    protected mLeft: Phaser.GameObjects.Image;
    protected sendHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, leftIcon: string, dpr?: number);
    setText(val: string): void;
    setHandler(send: Handler): void;
    protected init(key: string, leftIcon: string, dpr: number): void;
    private onAddHandler;
}
