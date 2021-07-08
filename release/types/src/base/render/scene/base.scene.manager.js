var BaseSceneManager = /** @class */ (function () {
    function BaseSceneManager(render) {
        this.sceneClass = {};
        this.render = render;
        this.initScene();
    }
    BaseSceneManager.prototype.getSceneClass = function (name) {
        return this.sceneClass[name];
    };
    BaseSceneManager.prototype.launchScene = function (startScene, LaunchName, sceneName, data) {
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
    BaseSceneManager.prototype.setMainScene = function (scene) {
        this.mMainScene = scene;
    };
    BaseSceneManager.prototype.getMainScene = function () {
        return this.mMainScene;
    };
    Object.defineProperty(BaseSceneManager.prototype, "currentScene", {
        get: function () {
            return null;
        },
        enumerable: true,
        configurable: true
    });
    BaseSceneManager.prototype.resize = function (width, height) {
    };
    BaseSceneManager.prototype.getSceneByName = function (sceneName) {
        return null;
    };
    BaseSceneManager.prototype.showProgress = function (progress) {
    };
    BaseSceneManager.prototype.bringToTop = function (sceneName) {
    };
    BaseSceneManager.prototype.startScene = function (name, data) {
    };
    BaseSceneManager.prototype.stopScene = function (name) {
    };
    BaseSceneManager.prototype.wakeScene = function (name, data) {
    };
    BaseSceneManager.prototype.sleepScene = function (name) {
    };
    BaseSceneManager.prototype.pauseScene = function (name) {
    };
    BaseSceneManager.prototype.resumeScene = function (name) {
    };
    BaseSceneManager.prototype.remove = function (key) {
    };
    BaseSceneManager.prototype.isActive = function (name) {
        return false;
    };
    BaseSceneManager.prototype.destroy = function () {
    };
    BaseSceneManager.prototype.updateInput = function (val) {
    };
    BaseSceneManager.prototype.initScene = function () {
    };
    return BaseSceneManager;
}());
export { BaseSceneManager };
export var SceneInputEnum;
(function (SceneInputEnum) {
    SceneInputEnum[SceneInputEnum["Disable"] = 0] = "Disable";
    SceneInputEnum[SceneInputEnum["Mouse"] = 1] = "Mouse";
    SceneInputEnum[SceneInputEnum["Keyboard"] = 2] = "Keyboard";
    SceneInputEnum[SceneInputEnum["All"] = 3] = "All";
})(SceneInputEnum || (SceneInputEnum = {}));
//# sourceMappingURL=base.scene.manager.js.map