import { Handler } from "utils";
import { Render } from "../../render";
import { BasePanel } from "./base.panel";
export declare class InputView extends BasePanel {
    private mTitleLabel;
    private closeBtn;
    private border;
    private content;
    private mInput;
    constructor(scene: Phaser.Scene, render: Render);
    show(param: IViewConfig): void;
    resize(w: number, h: number): void;
    protected preload(): void;
    protected init(): void;
    private createInput;
    private onClickHandler;
    private onCloseHandler;
    private onTextChangeHandler;
}
interface IViewConfig {
    placeholder?: string;
    title?: string;
    handler?: Handler;
    ox?: number;
    oy?: number;
    once?: boolean;
    length?: number;
}
export {};
