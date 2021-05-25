/// <reference types="tooqingphaser" />
import { IRender } from "../render";
export declare class BaseSceneManager {
    protected render: IRender;
    protected sceneClass: any;
    protected mMainScene: Phaser.Scene;
    constructor(render: IRender);
    getSceneClass(name: string): any;
    launchScene(startScene: Phaser.Scene, LaunchName: string, sceneName: string, data?: any): void;
    setMainScene(scene: Phaser.Scene): void;
    getMainScene(): Phaser.Scene;
    protected initScene(): void;
}
