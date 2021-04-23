import { BasicScene } from "baseRender";
export declare class LoginAccountScene extends BasicScene {
    private mWorld;
    private bg;
    private mCallback;
    constructor();
    preload(): void;
    init(data: any): void;
    create(): void;
    getKey(): string;
    private checkSize;
    private createFont;
}
