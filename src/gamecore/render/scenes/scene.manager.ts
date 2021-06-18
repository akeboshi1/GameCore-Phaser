import { Logger, SceneName } from "structure";
import { StringUtils } from "utils";
import { Render } from "../render";
import { BasicScene, SkyBoxScene, BaseSceneManager } from "baseRender";
import { CreateRoleScene } from "./create.role.scene";
import { GamePauseScene } from "./game.pause.scene";
import { LoadingScene } from "./loading.scene";
import { LoginAccountScene } from "./login.account.scene";
import { LoginScene } from "./login.scene";
import { MainUIScene } from "./main.ui.scene";
import { PlayScene } from "./play.scene";
import { RoomScene } from "./room.scene";
import { SelectRoleScene } from "./select.role.scene";
import { BlackScene } from "./black.scene";
import { SceneInputEnum } from "baseRender";
export class SceneManager extends BaseSceneManager {
    protected sceneManagerName: string;
    protected mCurSceneName: string;
    constructor(render: Render) {
        super(render);
        this.sceneManagerName = "SceneManager";
        (<Render>this.render).exportProperty(this, this.render, this.sceneManagerName)
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
        const playScene = sceneManager.getScene(SceneName.PLAY_SCENE) as BasicScene;
        if (playScene) playScene.setScale(zoom);
        const uiScene = sceneManager.getScene(SceneName.MAINUI_SCENE) as BasicScene;
        if (uiScene) uiScene.setScale(zoom);
    }

    public getSceneByName(sceneName: string): Phaser.Scene {
        if (!this.render || !this.render.game) return undefined;
        return this.render.game.scene.getScene(sceneName);
    }

    public showProgress(progress: number) {
        const sceneManager = this.render.game.scene;
        if (!sceneManager) {
            return;
        }
        const scene = sceneManager.getScene(SceneName.LOADING_SCENE) as LoadingScene;
        if (scene && scene.scene.isActive) {
            progress *= 100;
            const text = StringUtils.format("正在加载资源 {0}", [progress.toFixed(0) + "%"]);
            (<LoadingScene>scene).updateProgress(text);
        }
        const pauseScene = sceneManager.getScene(SceneName.GAMEPAUSE_SCENE) as GamePauseScene;
        if (pauseScene && pauseScene.scene.isActive()) return;
        sceneManager.bringToTop(SceneName.LOADING_SCENE);
    }

    public bringToTop(sceneName: string) {
        const sceneManager = this.render.game.scene;
        if (!sceneManager) {
            return;
        }
        const scene = sceneManager.getScene(sceneName);
        if (scene && scene.scene.isActive) {
            sceneManager.bringToTop(sceneName);
        }
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
        const scene = sceneManager.getScene(name) as BasicScene;
        if (scene) {
            const isActive = scene.scene.isActive(name);
            if (!isActive) {
                scene.wake(data);
            } else {
                if (data.text && data.text.length > 0) scene.updateProgress(data.text);
                if (data.loadProgress) scene.loadProgress(data.loadProgress);
            }
            if (data.callBack) data.callBack();
        } else {
            this.render.emitter.once("sceneCreated", () => {
                Logger.getInstance().debug("sceneCreated===scenemanager");
                if (data.callBack) data.callBack();
            }, this);
            sceneManager.add(name, this.sceneClass[name]);
            sceneManager.start(name, data);
        }
        this.mCurSceneName = name;
    }

    public launchScene(startScene: BasicScene, LaunchName: string, sceneName: string, data?: any) {
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
            Logger.getInstance().debug(name + "sleep faild");
            return;
        }
        const scene = this.render.game.scene.getScene(name) as BasicScene;
        if (!scene.scene.isActive(name)) return;
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

    public remove(key: string) {
        this.render.game.scene.remove(key);
    }

    public isActive(name: string): boolean {
        if (!this.render.game.scene.getScene(name)) {
            return false;
        }
        return this.render.game.scene.getScene(name).scene.isActive();
    }

    public destroy() {
        if (this.mCurSceneName) this.mCurSceneName = undefined;
        if (this.render && this.render.hasOwnProperty(this.sceneManagerName)) delete this.render[this.sceneManagerName];
        this.mMainScene = undefined;
    }

    public updateInput(val: SceneInputEnum) {
        const scenes = this.render.game.scene.getScenes();
        scenes.map((scene: Phaser.Scene) => scene.input.enabled = (val !== SceneInputEnum.Disable));
        // switch(val) {
        //     case SceneInputEnum.Disable:
        //         scenes.map((scene: Phaser.Scene) => scene.input.enabled = false);
        //         break;
        //     default:
        //         scenes.map((scene: Phaser.Scene) => scene.input.enabled = true);
        //         break;
        // }
    }

    protected initScene() {
        this.sceneClass = {
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
            "SkyBoxScene": SkyBoxScene,
            "BlackScene": BlackScene,
        };
    }
}
