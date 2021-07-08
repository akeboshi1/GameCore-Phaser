var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Logger, SceneName } from "structure";
import { StringUtils } from "utils";
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
var SceneManager = /** @class */ (function (_super) {
    __extends_1(SceneManager, _super);
    function SceneManager(render) {
        var _this = _super.call(this, render) || this;
        _this.sceneManagerName = "SceneManager";
        _this.render.exportProperty(_this, _this.render, _this.sceneManagerName)
            .onceReady(function () {
        });
        return _this;
    }
    Object.defineProperty(SceneManager.prototype, "currentScene", {
        get: function () {
            var sceneManager = this.render.game.scene;
            if (!sceneManager) {
                return null;
            }
            return sceneManager.getScene(this.mCurSceneName);
        },
        enumerable: true,
        configurable: true
    });
    SceneManager.prototype.resize = function (width, height) {
        var sceneManager = this.render.game.scene;
        if (!sceneManager) {
            return null;
        }
        var zoom = this.render.scaleRatio;
        var playScene = sceneManager.getScene(SceneName.PLAY_SCENE);
        if (playScene)
            playScene.setScale(zoom);
        var uiScene = sceneManager.getScene(SceneName.MAINUI_SCENE);
        if (uiScene)
            uiScene.setScale(zoom);
    };
    SceneManager.prototype.getSceneByName = function (sceneName) {
        if (!this.render || !this.render.game)
            return undefined;
        return this.render.game.scene.getScene(sceneName);
    };
    SceneManager.prototype.showProgress = function (progress) {
        var sceneManager = this.render.game.scene;
        if (!sceneManager) {
            return;
        }
        var scene = sceneManager.getScene(SceneName.LOADING_SCENE);
        if (scene && scene.scene.isActive) {
            progress *= 100;
            var text = StringUtils.format("正在加载资源 {0}", [progress.toFixed(0) + "%"]);
            scene.updateProgress(text);
        }
        var pauseScene = sceneManager.getScene(SceneName.GAMEPAUSE_SCENE);
        if (pauseScene && pauseScene.scene.isActive())
            return;
        sceneManager.bringToTop(SceneName.LOADING_SCENE);
    };
    SceneManager.prototype.bringToTop = function (sceneName) {
        var sceneManager = this.render.game.scene;
        if (!sceneManager) {
            return;
        }
        var scene = sceneManager.getScene(sceneName);
        if (scene && scene.scene.isActive) {
            sceneManager.bringToTop(sceneName);
        }
    };
    SceneManager.prototype.startScene = function (name, data) {
        var sceneManager = this.render.game.scene;
        if (!data)
            data = { render: this.render };
        if (!sceneManager) {
            return; // Promise.reject("start faild. SceneManager does not exist");
        }
        if (!this.sceneClass.hasOwnProperty(name)) {
            return; // Promise.reject("className error: " + name);
        }
        data.render = this.render;
        var scene = sceneManager.getScene(name);
        if (scene) {
            var isActive = scene.scene.isActive(name);
            if (!isActive) {
                scene.wake(data);
            }
            else {
                if (data.text && data.text.length > 0)
                    scene.updateProgress(data.text);
                if (data.loadProgress)
                    scene.loadProgress(data.loadProgress);
            }
            if (data.callBack)
                data.callBack();
        }
        else {
            this.render.emitter.once("sceneCreated", function () {
                Logger.getInstance().debug("sceneCreated===scenemanager");
                if (data.callBack)
                    data.callBack();
            }, this);
            sceneManager.add(name, this.sceneClass[name]);
            sceneManager.start(name, data);
        }
        this.mCurSceneName = name;
    };
    SceneManager.prototype.launchScene = function (startScene, LaunchName, sceneName, data) {
        var sceneManager = this.render.game.scene;
        if (!data)
            data = { render: this.render };
        if (!sceneManager) {
            return; // Promise.reject("start faild. SceneManager does not exist");
        }
        // if (!this.sceneClass.hasOwnProperty(LaunchName)) {
        //     return;// Promise.reject("className error: " + name);
        // }
        data.render = this.render;
        var scene = sceneManager.getScene(LaunchName);
        this.render.emitter.once("sceneCreated", function () {
            if (data.callBack)
                data.callBack();
        }, this);
        if (scene) {
        }
        else {
            sceneManager.add(LaunchName, this.sceneClass[sceneName]);
        }
        startScene.scene.launch(LaunchName, data);
    };
    SceneManager.prototype.stopScene = function (name) {
        var sceneManager = this.render.game.scene;
        if (!sceneManager) {
            return Promise.reject("start faild. SceneManager does not exist");
        }
        if (!this.sceneClass.hasOwnProperty(name)) {
            return Promise.reject("className error: " + name);
        }
        var scene = sceneManager.getScene(name);
        if (!scene)
            return;
        scene.stop();
        this.render.game.scene.remove(name);
    };
    SceneManager.prototype.wakeScene = function (name, data) {
        var sceneManager = this.render.game.scene;
        if (!sceneManager) {
            return Promise.reject("start faild. SceneManager does not exist");
        }
        if (!this.sceneClass.hasOwnProperty(name)) {
            return Promise.reject("className error: " + name);
        }
        var scene = sceneManager.getScene(name);
        if (!scene) {
            return;
        }
        else {
            scene.wake(data);
        }
    };
    SceneManager.prototype.sleepScene = function (name) {
        if (!this.render.game.scene.getScene(name)) {
            Logger.getInstance().debug(name + "sleep faild");
            return;
        }
        var scene = this.render.game.scene.getScene(name);
        if (!scene.scene.isActive(name))
            return;
        scene.sleep();
    };
    SceneManager.prototype.pauseScene = function (name) {
        var scene = this.render.game.scene.getScene(name);
        if (!scene) {
            Logger.getInstance().error("scene not found : ", name);
            return;
        }
        scene.scene.pause(name);
    };
    SceneManager.prototype.resumeScene = function (name) {
        var scene = this.render.game.scene.getScene(name);
        if (!scene) {
            Logger.getInstance().error("scene not found : ", name);
            return;
        }
        scene.scene.resume(name);
    };
    SceneManager.prototype.remove = function (key) {
        this.render.game.scene.remove(key);
    };
    SceneManager.prototype.isActive = function (name) {
        if (!this.render.game.scene.getScene(name)) {
            return false;
        }
        return this.render.game.scene.getScene(name).scene.isActive();
    };
    SceneManager.prototype.destroy = function () {
        if (this.mCurSceneName)
            this.mCurSceneName = undefined;
        if (this.render && this.render.hasOwnProperty(this.sceneManagerName))
            delete this.render[this.sceneManagerName];
        this.mMainScene = undefined;
    };
    SceneManager.prototype.updateInput = function (val) {
        var scenes = this.render.game.scene.getScenes();
        scenes.map(function (scene) { return scene.input.enabled = (val !== SceneInputEnum.Disable); });
        // switch(val) {
        //     case SceneInputEnum.Disable:
        //         scenes.map((scene: Phaser.Scene) => scene.input.enabled = false);
        //         break;
        //     default:
        //         scenes.map((scene: Phaser.Scene) => scene.input.enabled = true);
        //         break;
        // }
    };
    SceneManager.prototype.initScene = function () {
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
    };
    return SceneManager;
}(BaseSceneManager));
export { SceneManager };
//# sourceMappingURL=scene.manager.js.map