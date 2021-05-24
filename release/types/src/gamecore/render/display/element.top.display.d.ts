import { BubbleContainer } from "./bubble/bubble.container";
import { ElementStateType, StateConfig } from "structure";
import { TopDisplay } from "display";
/**
 * 人物头顶显示对象
 */
export declare class ElementTopDisplay extends TopDisplay {
    protected scene: Phaser.Scene;
    protected mBubble: BubbleContainer;
    protected isDispose: boolean;
    constructor(scene: Phaser.Scene, owner: any, dpr: number);
    showNickname(name: string): void;
    hideNickname(): void;
    showBubble(text: string, setting: any): void;
    clearBubble(): void;
    loadState(state: ElementStateType): void;
    showUIState(state: StateConfig): void;
    updateOffset(): void;
    getYOffset(): any;
    addDisplay(): void;
    removeDisplay(): void;
    hasTopPoint(): boolean;
    hasNickName(): boolean;
    destroy(): void;
    update(): void;
    protected addToSceneUI(obj: any): void;
    protected loadAtals(pngurl: string, jsonurl: string, context: any, callback: any): Promise<void>;
    private showStateHandler;
}
