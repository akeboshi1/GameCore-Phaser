import { LoadState, ModuleName, SceneName } from "structure";
import { Logger, StringUtils } from "utils";
import { LoadingTips } from "../loadqueue";
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
export class SceneManager extends BaseSceneManager {

    private mCurSceneName: string;
    constructor(render: Render) {
        super(render);

        (<Render>this.render).exportProperty(this, this.render, ModuleName.SCENEMANAGER_NAME)
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
        if (data.state !== undefined) {
            const state = data.state;
            switch (state) {
                case LoadState.ENTERWORLD:
                    // data.loadProgress = RENDER_PEER + `_v${version}` + "/n" + MAIN_WORKER + `_v${version}` + "/n" + PHYSICAL_WORKER + `_v${version}`;
                    data.text = LoadingTips.enterWorld();
                    break;
                case LoadState.DOWNLOADGAMECONFIG:
                    data.loadProgress = "正在加载游戏pi";
                    data.text = LoadingTips.downloadGameConfig();
                    break;
                case LoadState.DOWNLOADSCENECONFIG:
                    data.loadProgress = "正在加载场景pi";
                    data.text = LoadingTips.downloadSceneConfig();
                    break;
                case LoadState.LOADINGRESOURCES:
                    data.text = LoadingTips.loadingResources();
                    break;
                case LoadState.LOGINGAME:
                    data.loadProgress = "正在请求登陆游戏";
                    data.text = LoadingTips.loginGame();
                    break;
                case LoadState.PARSECONFIG:
                    data.loadProgress = "正在解析一大波游戏数据";
                    data.text = LoadingTips.parseConfig();
                    break;
                case LoadState.WAITENTERROOM:
                    data.loadProgress = "正在等待进入房间";
                    data.text = LoadingTips.waitEnterRoom();
                    break;
                case LoadState.CREATESCENE:
                    data.text = LoadingTips.createScene();
                    break;
            }
        }
        const scene = sceneManager.getScene(name) as BasicScene;
        if (scene) {
            const isActive = scene.scene.isActive(name);
            if (!isActive) {
                scene.wake(data);
            } else {
                if (data.text) scene.updateProgress(data.text);
                if (data.loadProgress) scene.loadProgress(data.loadProgress);
            }
            if (data.callBack) data.callBack();
        } else {
            this.render.emitter.once("sceneCreated", () => {
                Logger.getInstance().debug("sceneCreated===scenemanager");
                // if (this.mCurSceneName !== name) {
                //     const curScene: BasicScene = sceneManager.getScene(this.mCurSceneName) as BasicScene;
                //     if (curScene) curScene.sleep();
                // }
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
        if (this.render && this.render.hasOwnProperty(ModuleName.SCENEMANAGER_NAME)) delete this.render[ModuleName.SCENEMANAGER_NAME];
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

    private sceneCallback(scene: Phaser.Scene) {
        return Promise.resolve();
    }
}

enum SceneInputEnum {
    Disable = 0,
    Mouse,
    Keyboard,
    All
}
