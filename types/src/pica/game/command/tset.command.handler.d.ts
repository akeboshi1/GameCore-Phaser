import { MessageHandler } from "gamecore";
export declare class TestCommandHandler extends MessageHandler {
    onAddListener(): void;
    onRemoveListener(): void;
    destroy(): void;
    protected onTestHandler(tag: string): void;
    protected testFinishGuide(): void;
}
