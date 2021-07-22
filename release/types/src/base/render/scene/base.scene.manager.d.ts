/// <reference types="tooqingphaser" />
import { BasicScene } from "./basic.scene";
import { IRender } from "../render";
export declare class BaseSceneManager {
    protected sceneClass: any;
    protected mMainScene: Phaser.Scene;
    protected render: IRender;
    constructor(render: IRender);
    getSceneClass(name: string): any;
    launchScene(startScene: Phaser.Scene, LaunchName: string, sceneName: string, data?: any): void;
    setMainScene(scene: Phaser.Scene): void;
    getMainScene(): Phaser.Scene;
    get currentScene(): BasicScene;
    resize(width: any, height: any): void;
    getSceneByName(sceneName: string): Phaser.Scene;
    showProgress(progress: number): void;
    bringToTop(sceneName: string): void;
    startScene(name: string, data?: any): Promise<void>;
    stopScene(name: string): void;
    wakeScene(name: string, data?: any): void;
    sleepScene(name: string): void;
    pauseScene(name: string): void;
    resumeScene(name: string): void;
    remove(key: string): void;
    isActive(name: string): boolean;
    destroy(): void;
    updateInput(val: SceneInputEnum): void;
    protected initScene(): void;
}
export declare enum SceneInputEnum {
    Disable = 0,
    Mouse = 1,
    Keyboard = 2,
    All = 3
}
