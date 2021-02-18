import { BasicScene } from "./basic.scene";
import { IRender } from "../render";

export class BaseSceneManager {
    protected sceneClass: any = { };
    protected mMainScene: Phaser.Scene;
    constructor(protected render: IRender) {
        this.initScene();
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

    protected initScene() {
    }
}
