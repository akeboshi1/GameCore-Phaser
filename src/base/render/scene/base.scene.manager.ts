import { BasicScene } from "./basic.scene";
import { IRender } from "../render";

export class BaseSceneManager {
    protected sceneClass: any = {};
    protected mMainScene: Phaser.Scene;
    protected render: IRender;
    constructor(render: IRender) {
        this.render = render;
        this.initScene();
    }

    public getSceneClass(name: string): any {
        return this.sceneClass[name];
    }

    public launchScene(startScene: Phaser.Scene, LaunchName: string, sceneName: string, data?: any) {
        const sceneManager = this.render.game.scene;
        if (!data) data = { render: this.render };
        if (!sceneManager) {
            return; // Promise.reject("start faild. SceneManager does not exist");
        }
        // if (!this.sceneClass.hasOwnProperty(LaunchName)) {
        //     return;// Promise.reject("className error: " + name);
        // }
        data.render = this.render;
        const scene = sceneManager.getScene(LaunchName) as BasicScene;
        this.render.emitter.once("sceneCreated", () => {
            if (data.callBack) data.callBack();
        }, this);
        if (scene) {
        } else {
            sceneManager.add(LaunchName, this.sceneClass[sceneName]);
        }
        startScene.scene.launch(LaunchName, data);
    }

    public setMainScene(scene: Phaser.Scene) {
        this.mMainScene = scene;
    }

    public getMainScene() {
        return this.mMainScene;
    }

    get currentScene(): BasicScene {
        return null;
    }

    public resize(width, height) {
    }

    public getSceneByName(sceneName: string): Phaser.Scene {
        return null;
    }

    public showProgress(progress: number) {
    }

    public bringToTop(sceneName: string) {
    }

    public startScene(name: string, data?: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    public stopScene(name: string) {
    }

    public wakeScene(name: string, data?: any) {
    }

    public sleepScene(name: string) {
    }

    public pauseScene(name: string) {
    }

    public resumeScene(name: string) {
    }

    public remove(key: string) {
    }

    public isActive(name: string): boolean {
        return false;
    }

    public destroy() {
        this.mMainScene = null;
    }

    public updateInput(val: SceneInputEnum) {
    }

    protected initScene() {
    }
}

export enum SceneInputEnum {
    Disable = 0,
    Mouse,
    Keyboard,
    All
}
