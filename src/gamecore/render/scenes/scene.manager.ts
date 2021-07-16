import { LoadingTips, LoadState, Logger, SceneName } from "structure";
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
import { i18n } from "../utils";
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
            // const text = StringUtils.format("正在加载资源 {0}", [progress.toFixed(0) + "%"]);
            (<LoadingScene>scene).updateProgress(i18n.t(LoadingTips.LOADING_RESOURCES, { progress: progress.toFixed(0) }));
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
        if (data.state !== undefined) {
            const state = data.state;
            switch (state) {
                case LoadState.ENTERWORLD:
                    data.text = LoadingTips.ENTER_WORLD;
                    break;
                case LoadState.DOWNLOADGAMECONFIG:
                    // data.loadProgress = "异世界发现中..."; // "正在加载游戏pi";
                    data.text = LoadingTips.DOWNLOAD_CONFIG;
                    break;
                case LoadState.DOWNLOADSCENECONFIG:
                    // data.loadProgress = "构建次元空间...";// "正在加载场景pi";
                    data.text = LoadingTips.DOWNLOAD_SCENE_CONFIG;
                    break;
                case LoadState.LOADINGRESOURCES:
                    data.text = LoadingTips.LOADING_RESOURCES;
                    break;
                case LoadState.LOGINGAME:
                    // data.loadProgress = "勇者，正在穿越异世界...";// "正在请求登陆游戏";
                    data.text = LoadingTips.LOGIN_GAME;
                    break;
                case LoadState.PARSECONFIG:
                    // data.loadProgress = "大贤者迪塔装载中...";// "正在解析一大波游戏数据";
                    data.text = LoadingTips.PARSE_CONFIG;
                    break;
                case LoadState.LOADJSON:
                    // data.loadProgress = "大贤者杰森装载中...";// "正在加载前端json配置"; // StringUtils.format("正在加载资源 {0}", [data.data.resName]);
                    data.text = LoadingTips.DOWNLOAD_SCENE_CONFIG;
                    break;
                case LoadState.WAITENTERROOM:
                    // data.loadProgress = "大魔术咏唱:真理之门...";// "正在等待进入房间";
                    data.text = LoadingTips.WAIT_ENTER_ROOM;
                    break;
                case LoadState.CREATESCENE:
                    // data.text = LoadingTips.crea();
                    break;
            }
        }
        // 切换场景时，将之前场景状态变为正在切换（并没有被销毁，销毁是一个异步过程）
        if (this.mCurSceneName && this.mCurSceneName !== name && this.currentScene) {
            this.currentScene.sceneChange = true;
        }
        const scene = sceneManager.getScene(name) as BasicScene;
        if (scene) {
            const isActive = scene.scene.isActive(name);
            if (!isActive) {
                scene.wake(data);
            } else {
                if (data.text && data.text.length > 0) scene.updateProgress(i18n.t(data.text));
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
