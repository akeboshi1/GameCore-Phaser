import { ClickEvent, ISoundGroup } from "apowophaserui";
import { ButtonEventDispatcher } from "./button.event.dispatch";
export declare class BackgroundScaleButton extends ButtonEventDispatcher {
    protected soundGroup: any;
    protected mDownTime: number;
    protected mBackground: Phaser.GameObjects.Image;
    protected mKey: string;
    protected mFrame: string;
    protected mDownFrame: string;
    protected mText: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, downFrame: string, text?: string, dpr?: number, scale?: number, tweenBoo?: boolean, music?: ISoundGroup);
    get background(): Phaser.GameObjects.Image;
    get text(): Phaser.GameObjects.Text;
    setEnable(value: any, tint?: boolean): void;
    set tweenEnable(value: any);
    mute(boo: boolean): void;
    changeNormal(): void;
    changeDown(): void;
    setFrame(frame: string): void;
    setText(val: string): void;
    setTextStyle(style: object): void;
    setFontStyle(val: string): void;
    setTextOffset(x: number, y: number): void;
    setTextColor(color: string): void;
    setFrameNormal(normal: string, down?: string): this;
    protected createBackground(): void;
    protected setBgFrame(frame: string): void;
    protected EventStateChange(state: ClickEvent): void;
}
