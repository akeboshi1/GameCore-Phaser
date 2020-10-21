import { Logger } from "../../utils/log";
import { Render } from "../render";
import { BasicScene } from "../scenes/basic.scene";
import { CreateRoleScene } from "../scenes/create.role.scene";
import { GamePauseScene } from "../scenes/game.pause.scene";
import { LoadingScene } from "../scenes/loading.scene";
import { LoginAccountScene } from "../scenes/login.account.scene";
import { LoginScene } from "../scenes/login.scene";
import { MainUIScene } from "../scenes/main.ui.scene";
import { PlayScene } from "../scenes/play.scene";
import { RoomScene } from "../scenes/room.scene";
import { SelectRoleScene } from "../scenes/select.role.scene";
import { SkyBoxScene } from "../scenes/sky.box.scene";

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
    }

    public currentScene(): BasicScene {
        const sceneManager = this.render.game.scene;
        if (!sceneManager) {
            return null;
        }
        return sceneManager.getScene(this.mCurSceneName) as BasicScene;
    }

    public getSceneByName(sceneName: string): Phaser.Scene {
        return this.render.game.scene.getScene(sceneName);
    }

    public async startScene(name: string, data?: any) {
        const sceneManager = this.render.game.scene;
        if (!data) data = {};
        if (!sceneManager) {
            return Promise.reject("start faild. SceneManager does not exist");
        }
        if (!this.sceneClass.hasOwnProperty(name)) {
            return Promise.reject("className error: " + name);
        }
        data.render = this.render;
        data.callBack = this.sceneCallback.bind(this);
        this.mCurSceneName = name;
        const scene = sceneManager.getScene(name) as BasicScene;
        if (scene) {
            scene.wake(data);
        } else {
            sceneManager.add(name, this.sceneClass[name]);
            sceneManager.start(name, data);
        }
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
        scene.scene.stop();
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

    private sceneCallback(scene: Phaser.Scene) {
        return Promise.resolve();
    }
}
