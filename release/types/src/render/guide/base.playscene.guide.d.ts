/// <reference types="tooqinggamephaser" />
import { IPos } from "utils";
import { UiManager } from "../ui";
import { BaseGuide } from "./base.guide";
/**
 * 场景点击引导基类
 */
export declare class BasePlaySceneGuide extends BaseGuide {
    protected mElementID: number;
    protected mElement: any;
    protected mPlayScene: Phaser.Scene;
    protected mPointer: Phaser.Input.Pointer;
    constructor(id: number, uiManager: UiManager);
    get data(): number;
    show(param?: any): void;
    hide(): void;
    checkInteractive(data?: any): boolean;
    protected step1(pos: IPos): void;
    protected gameObjectUpHandler(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject): void;
    protected updateGuidePos(): void;
    protected getGuidePosition(): {
        x: any;
        y: any;
    };
}
