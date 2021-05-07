/// <reference types="tooqinggamephaser" />
import { Render } from "../render";
import { UiManager } from "../ui";
import { GuideEffect } from "./guide.effect";
import { IGuide } from "./guide.manager";
export declare class BaseGuide implements IGuide {
    protected render: Render;
    id: number;
    guideID: number;
    guideEffect: GuideEffect;
    protected scene: Phaser.Scene;
    protected uiManager: UiManager;
    protected mData: any;
    private mIsShow;
    constructor(render: Render);
    get data(): any;
    show(data?: any): void;
    end(): void;
    hide(): void;
    /**
     * 检查是否阻挡交互
     */
    checkInteractive(data?: any): boolean;
    destroy(): void;
    resize(): void;
    isShow(): boolean;
    addExportListener(f: Function): void;
}
