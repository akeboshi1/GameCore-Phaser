import { AvatarSuitType, Logger } from "structure";
import { AvatarEditorDragonbone, AvatarEditorScene } from "editorCanvas";
var EditorCanvasManager = /** @class */ (function () {
    function EditorCanvasManager(render) {
        this.render = render;
        this.AVATAR_CANVAS_TEST_DATA = [{ id: "5facff1a67d3b140e835e1d0", parts: ["head_hair"] }];
        this.AVATAR_CANVAS_RESOURCE_PATH = "https://osd-alpha.tooqing.com";
        this.AVATAR_CANVAS_PARENT = "avatarCanvas";
        this.SCENEKEY_SNAPSHOT = "AvatarEditorSnapshotScene";
    }
    EditorCanvasManager.prototype.destroy = function () {
        if (this.render.game) {
            this.render.game.scene.stop(this.SCENEKEY_SNAPSHOT);
            this.render.game.scene.remove(this.SCENEKEY_SNAPSHOT);
        }
    };
    // 生成合图；上传合图（png+json）；生成头像；上传头像
    // dbDisplay: 已经装扮完成（数据正确）的龙骨显示对象
    EditorCanvasManager.prototype.saveAvatar = function (dbDisplay) {
        var _this = this;
        if (!dbDisplay || !dbDisplay.displayInfo || !dbDisplay.displayInfo.avatar) {
            return Promise.reject("display info error");
        }
        return new Promise(function (resolve, reject) {
            var avatarSets = AvatarSuitType.toIAvatarSets(dbDisplay.displayInfo.avatar);
            // this.render.uiManager.showPanel(ModuleName.MASK_LOADING_NAME);
            dbDisplay.save()
                .then(function (saveData) {
                _this.render.mainPeer.uploadDBTexture(saveData.key, saveData.url, saveData.json)
                    .catch(function (reason) {
                    Logger.getInstance().error("uploadDBTexture error: " + reason);
                });
                return _this.createHeadIcon(avatarSets);
            })
                .then(function (str) {
                _this.render.mainPeer.uploadHeadImage(str);
                // this.render.uiManager.hidePanel(ModuleName.MASK_LOADING_NAME);
                resolve(null);
            })
                .catch(function (reason) {
                Logger.getInstance().error("save avatar error: " + reason);
                reject(reason);
            });
        });
    };
    EditorCanvasManager.prototype.createHeadIcon = function (sets) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.render.game.scene.getScene(_this.SCENEKEY_SNAPSHOT))
                _this.render.game.scene.add(_this.SCENEKEY_SNAPSHOT, AvatarEditorScene, false);
            _this.render.sceneManager.currentScene.scene.launch(_this.SCENEKEY_SNAPSHOT, {
                onCreated: function (s) {
                    _this.render.game.scene.sendToBack(_this.SCENEKEY_SNAPSHOT);
                    var a = new AvatarEditorDragonbone(s, _this.render.url.RES_PATH, _this.render.url.OSD_PATH, _this.render.emitter, false, sets, function (dragonbone) {
                        dragonbone.generateHeadIcon().then(function (src) {
                            resolve(src);
                            dragonbone.destroy();
                            _this.render.game.scene.stop(_this.SCENEKEY_SNAPSHOT);
                            _this.render.game.scene.remove(_this.SCENEKEY_SNAPSHOT);
                        });
                    });
                }
            });
        });
    };
    return EditorCanvasManager;
}());
export { EditorCanvasManager };
//# sourceMappingURL=editor.canvas.manager.js.map