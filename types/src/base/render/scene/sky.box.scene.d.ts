import { BasicScene } from "./basic.scene";
export declare class SkyBoxScene extends BasicScene {
    private skyBoxManager;
    constructor();
    init(data: any): void;
    preload(): void;
    create(): void;
    update(time: number, delta: number): void;
}
