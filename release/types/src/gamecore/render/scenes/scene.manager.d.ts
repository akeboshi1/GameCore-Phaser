/// <reference types="tooqingphaser" />
import { Render } from "../render";
import { BasicScene, BaseSceneManager } from "baseRender";
import { SceneInputEnum } from "baseRender";
export declare class SceneManager extends BaseSceneManager {
    protected sceneManagerName: string;
    protected mCurSceneName: string;
    constructor(render: Render);
    get currentScene(): BasicScene;
    resize(width: any, height: any): any;
    getSceneByName(sceneName: string): Phaser.Scene;
    showProgress(progress: number): void;
    bringToTop(sceneName: string): void;
    startScene(name: string, data?: any): void;
    launchScene(startScene: BasicScene, LaunchName: string, sceneName: string, data?: any): void;
    stopScene(name: string): Promise<never>;
    wakeScene(name: string, data?: any): Promise<never>;
    sleepScene(name: string): void;
    pauseScene(name: string): void;
    resumeScene(name: string): void;
    remove(key: string): void;
    isActive(name: string): boolean;
    destroy(): void;
    updateInput(val: SceneInputEnum): void;
    protected initScene(): void;
}
