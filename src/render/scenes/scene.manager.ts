import { ModuleName } from "structure";
import { Logger } from "utils";
import { Render } from "../render";
import { BasicScene } from "./basic.scene";
import { CreateRoleScene } from "./create.role.scene";
import { GamePauseScene } from "./game.pause.scene";
import { LoadingScene } from "./loading.scene";
import { LoginAccountScene } from "./login.account.scene";
import { LoginScene } from "./login.scene";
import { MainUIScene } from "./main.ui.scene";
import { PlayScene } from "./play.scene";
import { RoomScene } from "./room.scene";
import { SelectRoleScene } from "./select.role.scene";
import { SkyBoxScene } from "./sky.box.scene";

export class SceneManager {
    private readonly sceneClass = {
        "BasicScene": BasicScene,
        "CreateRoleScene": CreateRoleScene,
        "GamePauseScene": GamePauseScene,
        "LoadingScene": LoadingScene,
        "LoginAccountScene": LoginAccountScene,
        "LoginScene": LoginScene,
        "MainUIScene": MainUIScene,
        "PlayScene": PlayScene,
        "RoomScene": RoomScene,
        "SelectRoleScene": SelectRoleScene,
        "SkyBoxScene": SkyBoxScene
    };

    private mCurSceneName: string;
    constructor(private render: Render) {
        this.render.exportProperty(this, this.render, ModuleName.SCENEMANAGER_NAME)
            .onceReady(() => {
            });
    }

    get currentScene(): BasicScene {
        const sceneManager = this.render.game.scene;
        if (!sceneManager) {
            return null;
        }
        return sceneManager.getScene(this.mCurSceneName) as BasicScene;
    }

    public resize(width, height) {
        const sceneManager = this.render.game.scene;
        if (!sceneManager) {
            return null;
        }
        const zoom = this.render.scaleRatio;
        const playScene = sceneManager.getScene("PlayScene") as BasicScene;
        if (playScene) playScene.setScale(zoom);
        const uiScene = sceneManager.getScene("MainUIScene") as BasicScene;
        if (uiScene) uiScene.setScale(zoom);
    }

    public getSceneByName(sceneName: string): Phaser.Scene {
        if (!this.render || !this.render.game) return undefined;
        return this.render.game.scene.getScene(sceneName);
    }

    public startScene(name: string, data?: any) {
        const sceneManager = this.render.game.scene;
        if (!data) data = { render: this.render };
        if (!sceneManager) {
            return; // Promise.reject("start faild. SceneManager does not exist");
        }
        if (!this.sceneClass.hasOwnProperty(name)) {
            return;// Promise.reject("className error: " + name);
        }
        data.render = this.render;
        this.mCurSceneName = name;
        const scene = sceneManager.getScene(name) as BasicScene;
        this.render.emitter.once("sceneCreated", () => {
            Logger.getInstance().log("createRoleScene===scenemanager");
            if (data.callBack) data.callBack();
        }, this);
        if (scene) {
            if (this.mCurSceneName) {
                const curScene: BasicScene = sceneManager.getScene(this.mCurSceneName) as BasicScene;
                if (curScene) curScene.sleep();
            }
            scene.wake(data);
            if (data.callBack) data.callBack();
        } else {
            sceneManager.add(name, this.sceneClass[name]);
            sceneManager.start(name, data);
        }
    }

    public launchScene(startScene: BasicScene, LaunchName: string, data?: any) {
        const sceneManager = this.render.game.scene;
        if (!data) data = { render: this.render };
        if (!sceneManager) {
            return; // Promise.reject("start faild. SceneManager does not exist");
        }
        if (!this.sceneClass.hasOwnProperty(LaunchName)) {
            return;// Promise.reject("className error: " + name);
        }
        data.render = this.render;
        const scene = sceneManager.getScene(LaunchName) as BasicScene;
        this.render.emitter.once("sceneCreated", () => {
            if (data.callBack) data.callBack();
        }, this);
        if (scene) {
        } else {
            sceneManager.add(LaunchName, this.sceneClass[LaunchName]);
        }
        startScene.scene.launch(LaunchName, data);
    }

    public stopScene(name: string) {
        const sceneManager = this.render.game.scene;
        if (!sceneManager) {
            return Promise.reject("start faild. SceneManager does not exist");
        }
        if (!this.sceneClass.hasOwnProperty(name)) {
            return Promise.reject("className error: " + name);
        }
        const scene = sceneManager.getScene(name) as BasicScene;
        if (!scene) return;
        scene.stop();
        this.render.game.scene.remove(name);
    }

    public wakeScene(name: string, data?: any) {
        const sceneManager = this.render.game.scene;
        if (!sceneManager) {
            return Promise.reject("start faild. SceneManager does not exist");
        }
        if (!this.sceneClass.hasOwnProperty(name)) {
            return Promise.reject("className error: " + name);
        }
        const scene = sceneManager.getScene(name) as BasicScene;
        if (!scene) {
            return;
        } else {
            scene.wake(data);
        }
    }

    public sleepScene(name: string) {
        if (!this.render.game.scene.getScene(name)) {
            Logger.getInstance().log(name + "sleep faild");
            return;
        }
        const scene = this.render.game.scene.getScene(name) as BasicScene;
        scene.sleep();
    }

    public pauseScene(name: string) {
        const scene = this.render.game.scene.getScene(name);
        if (!scene) {
            Logger.getInstance().error("scene not found : ", name);
            return;
        }

        scene.scene.pause(name);
    }

    public resumeScene(name: string) {
        const scene = this.render.game.scene.getScene(name);
        if (!scene) {
            Logger.getInstance().error("scene not found : ", name);
            return;
        }
        scene.scene.resume(name);
    }

    public isActive(name: string): boolean {
        if (!this.render.game.scene.getScene(name)) {
            return false;
        }
        return this.render.game.scene.getScene(name).scene.isActive();
    }

    public destroy() {
        if (this.mCurSceneName) this.mCurSceneName = undefined;
        if (this.render && this.render.hasOwnProperty(ModuleName.SCENEMANAGER_NAME)) delete this.render[ModuleName.SCENEMANAGER_NAME];
    }

    private sceneCallback(scene: Phaser.Scene) {
        return Promise.resolve();
    }
}
