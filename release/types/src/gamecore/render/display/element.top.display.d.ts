import { ElementStateType, StateConfig } from "structure";
import { TopDisplay } from "baseRender";
import { Render } from "../render";
/**
 * 人物头顶显示对象
 */
export declare class ElementTopDisplay extends TopDisplay {
    private render;
    private mBubble;
    private isDispose;
    private uiScale;
    constructor(scene: Phaser.Scene, owner: any, render: Render);
    showNickname(name: string): void;
    hideNickname(): void;
    showBubble(text: string, setting: any): void;
    clearBubble(): void;
    loadState(state: ElementStateType): void;
    showUIState(state: StateConfig): void;
    updateOffset(): void;
    getYOffset(): Phaser.Geom.Point;
    addDisplay(): void;
    removeDisplay(): void;
    hasTopPoint(): boolean;
    hasNickName(): boolean;
    destroy(): void;
    update(): void;
    protected addToSceneUI(obj: any): void;
    private loadAtals;
    private showStateHandler;
}
