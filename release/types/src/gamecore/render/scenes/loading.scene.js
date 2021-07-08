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
import { UiUtils } from "utils";
import { BaseLayer, BasicScene } from "baseRender";
import { MainUIScene } from "./main.ui.scene";
import { Font, Logger, SceneName } from "structure";
var LoadingScene = /** @class */ (function (_super) {
    __extends_1(LoadingScene, _super);
    function LoadingScene() {
        var _this = _super.call(this, { key: SceneName.LOADING_SCENE }) || this;
        _this.mTxtList = [];
        _this.mErrorList = [];
        return _this;
    }
    LoadingScene.prototype.preload = function () {
        // atlas可以用于webgl渲染，和canvas渲染，spritesheet只能用于canvas
        // this.load.image("avatar_placeholder", Url.getRes("dragonbones/avatar.png"));
        // this.load.atlas("curtain", Url.getUIRes(this.dpr, "loading/curtain.png"), Url.getUIRes(this.dpr, "loading/curtain.json"));
        // this.load.atlas("loading", Url.getRes("ui/loading/loading.png"), Url.getRes("ui/loading/loading.json"));
        // // this.load.script("webfont", Url.getRes("scripts/webfont/1.6.26/webfont.js"));
        // this.load.script("webfont", `${Url.RES_PATH}scripts/webfont/1.6.26/webfont.js`);
        // this.load.atlas(ModuleName.MASK_LOADING_NAME, Url.getUIRes(this.dpr, "mask_loading/mask_loading.png"), Url.getUIRes(this.dpr, "mask_loading/mask_loading.json"));
        // this.load.atlas(ModuleName.ALERTVIEW_NAME, Url.getUIRes(this.dpr, "pica_alert/pica_alert.png"), Url.getUIRes(this.dpr, "pica_alert/pica_alert.json"));
    };
    LoadingScene.prototype.init = function (data) {
        _super.prototype.init.call(this, data);
        this.createFont();
        this.dpr = data.dpr || UiUtils.baseDpr;
        this.mRequestCom = false;
        this.progressData = data.data;
        this.mCallback = data.callBack;
        this.mGameVersion = data.version || "beta";
        this.tipsText = data.text || "";
    };
    LoadingScene.prototype.create = function () {
        try {
            WebFont.load({
                custom: {
                    // families: ["Source Han Sans", "tt0173m_", "tt0503m_"]
                    families: ["Source Han Sans", "tt0173m_", "tt0503m_", "t04B25"]
                },
            });
        }
        catch (error) {
            Logger.getInstance().warn("webfont failed to load");
        }
        var width = this.scale.gameSize.width;
        var height = this.scale.gameSize.height;
        // 手动把json配置中的frames给予anims
        this.anims.create({
            key: "loading_anis",
            frames: this.anims.generateFrameNames("loading", { prefix: "loading_", start: 1, end: 3, zeroPad: 1, suffix: ".png" }),
            frameRate: 5,
            repeat: -1
        });
        this.curtain = new Curtain(this, this.dpr);
        this.mask = this.add.graphics({ x: 0, y: 0 });
        this.mask.fillStyle(0);
        this.mask.fillRect(0, 0, width, height);
        this.mask.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        var dpr = this.render.uiRatio;
        this.bg = this.add.sprite(width * 0.5, height * 0.5, "loading").setScale(this.render.uiScale * dpr * 2);
        this.bg.play("loading_anis");
        this.progressText = this.add.text(this.bg.x, this.bg.y + this.bg.displayHeight * 0.5, this.tipsText, {
            fontSize: 12 * dpr + "px",
            fontFamily: Font.DEFULT_FONT
        }).setOrigin(0.5);
        this.debug = this.add.text(width - 4 * dpr, height - 4 * dpr, "v" + this.mGameVersion + " " + this.getDebug(), {
            fontSize: 12 * dpr + "px",
            fontFamily: Font.DEFULT_FONT
        }).setOrigin(1);
        this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_UI, 1);
        this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_DIALOG, 2);
        this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_TOOLTIPS, 3);
        this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_MASK, 4);
        for (var tmpData in this.progressData) {
            this.loadProgress(this.progressData[tmpData]);
        }
        _super.prototype.create.call(this);
        var uimanager = this.render.uiManager;
        uimanager.setScene(this);
    };
    LoadingScene.prototype.getProgress = function () {
        return "test";
    };
    LoadingScene.prototype.updateProgress = function (text) {
        if (!text || text.length < 0)
            return;
        // 更新load状态
        this.tipsText = text;
        if (text && this.progressText) {
            if (this.progressText.active)
                this.progressText.setText(text);
        }
    };
    LoadingScene.prototype.loadProgress = function (text) {
        var len = this.mTxtList.length;
        var dpr = this.render.uiRatio;
        var mainTxt = this.add.text(this.bg.x - this.scale.gameSize.width / 2, this.scale.gameSize.height - 10 * dpr * (len + 1), "", {
            fontSize: 12 * dpr + "px",
            fontFamily: Font.DEFULT_FONT
        }).setOrigin(0, .5);
        mainTxt.setText(text);
        this.mTxtList.unshift(mainTxt);
    };
    LoadingScene.prototype.showErrorMsg = function (msg) {
        var width = this.scale.gameSize.width;
        var len = this.mErrorList.length;
        var dpr = this.render.uiRatio;
        var errorTxt = this.add.text(width - 4 * dpr, 15 * dpr * len, "", {
            fontSize: 12 * dpr + "px",
            fontFamily: Font.DEFULT_FONT
        }).setOrigin(1);
        errorTxt.setText(msg);
        this.mErrorList.unshift(errorTxt);
    };
    LoadingScene.prototype.wake = function (data) {
        var _this = this;
        if (!this.scene || !this.scene.settings) {
            return;
        }
        if (this.curtain) {
            this.displayVisible(true);
            this.curtain.open().then(function () {
                // this.displayVisible(true);
                _this.scene.wake();
            }).catch(function (error) {
                Logger.getInstance().debug(error);
            });
            // this.scale.on("resize", this.checkSize, this);
            this.scene.bringToTop(SceneName.LOADING_SCENE);
            _super.prototype.wake.call(this, data);
        }
        if (!data) {
            return;
        }
        // 更新load状态
        this.tipsText = data.text;
        Logger.getInstance().debug("loadState:----", data.text);
        if (data.text && this.progressText) {
            if (this.progressText.active)
                this.progressText.setText(data.text);
        }
    };
    LoadingScene.prototype.sleep = function () {
        var _this = this;
        this.mTxtList.forEach(function (text) {
            text.destroy();
        });
        this.mErrorList.forEach(function (text) {
            text.destroy();
        });
        this.mErrorList.length = 0;
        this.mErrorList = [];
        this.mTxtList.length = 0;
        this.mTxtList = [];
        if (this.progressText) {
            if (this.progressText.active)
                this.progressText.setText("");
        }
        if (!this.scene || !this.scene.settings) {
            return;
        }
        // if (!this.scene.settings.active) {
        //   return;
        // }
        if (this.curtain) {
            this.displayVisible(false);
            this.curtain.close().then(function () {
                // this.displayVisible(true);
                // this.render.hideLoading();
                _this.scene.sleep();
            });
        }
        else {
            this.displayVisible(true);
            this.scene.sleep();
        }
    };
    LoadingScene.prototype.appendProgress = function (text) {
        if (this.progressText) {
            // let str = this.progressText.text;
            // str += `${text}\n`;
            this.progressText.setText(text);
        }
    };
    LoadingScene.prototype.getKey = function () {
        return this.sys.config.key;
    };
    LoadingScene.prototype.getDebug = function () {
        var renderType = "WebGL";
        var config = this.game.config;
        if (config.renderType === Phaser.CANVAS) {
            renderType = "Canvas";
        }
        else if (config.renderType === Phaser.HEADLESS) {
            renderType = "Headless";
        }
        var audioConfig = config.audio;
        var deviceAudio = this.game.device.audio;
        var audioType;
        if (deviceAudio.webAudio && !(audioConfig && audioConfig.disableWebAudio)) {
            audioType = "Web Audio";
        }
        else if ((audioConfig && audioConfig.noAudio) || (!deviceAudio.webAudio && !deviceAudio.audioData)) {
            audioType = "No Audio";
        }
        else {
            audioType = "HTML5 Audio";
        }
        return "(" + renderType + " | " + audioType + ")";
    };
    LoadingScene.prototype.displayVisible = function (val) {
        if (this.bg) {
            this.bg.visible = val;
            this.debug.visible = val;
            this.mask.visible = val;
        }
    };
    LoadingScene.prototype.createFont = function () {
        var element = document.createElement("style");
        document.head.appendChild(element);
        var sheet = element.sheet;
        var font = ["en/tt0173m_.ttf", "en/tt0503m_.ttf", "04B.ttf"];
        // const styles = "@font-face { font-family: 'Source Han Sans'; src: url('./resources/fonts/otf/SourceHanSansTC-Regular.otf') format('opentype');font-display:swap; }\n";
        var styles2 = "@font-face { font-family: 'tt0173m_'; src: url('" + this.render.url.getRes("fonts/en/tt0173m_.ttf") + "') format('truetype');font-display:swap }\n";
        var styles3 = "@font-face { font-family: 'tt0503m_'; src: url('" + this.render.url.getRes("fonts/en/tt0503m_.ttf") + "') format('truetype'); font-display:swap}\n";
        var styles4 = "@font-face { font-family: 't04B25'; src: url('" + this.render.url.getRes("fonts/04B.ttf") + "') format('truetype'); font-display:swap}";
        // sheet.insertRule(styles, 0);
        sheet.insertRule(styles2, 0);
        sheet.insertRule(styles3, 0);
        sheet.insertRule(styles4, 0);
    };
    return LoadingScene;
}(BasicScene));
export { LoadingScene };
var Curtain = /** @class */ (function () {
    function Curtain(scene, dpr) {
        this.scene = scene;
        this.dpr = dpr;
        this.key = "curtain";
        this.upDisplay = this.scene.add.image(0, 0, this.key, "up.png").setOrigin(0).setVisible(false).setScale(this.dpr);
        this.downDisplay = this.scene.add.image(0, 0, this.key, "down.png").setOrigin(0, 1).setVisible(false).setScale(this.dpr);
    }
    Curtain.prototype.open = function () {
        var _this = this;
        this.upDisplay.visible = true;
        this.downDisplay.visible = true;
        return new Promise(function (resolve, reject) {
            if (!_this.scene.cameras.main) {
                resolve();
                return;
            }
            if (_this.upTween || _this.downTween) {
                reject();
                return;
            }
            var height = _this.scene.cameras.main.height;
            _this.upDisplay.y = -_this.upDisplay.displayHeight;
            _this.downDisplay.y = height + _this.downDisplay.displayHeight;
            _this.upTween = _this.scene.tweens.add({
                targets: _this.upDisplay,
                props: { y: 0 },
                duration: 1000
            });
            _this.downTween = _this.scene.tweens.add({
                targets: _this.downDisplay,
                props: { y: height },
                duration: 1000,
                onComplete: function () {
                    // this.upDisplay.visible = false;
                    // this.downDisplay.visible = false;
                    _this.clearTween();
                    resolve();
                }
            });
        });
    };
    Curtain.prototype.close = function () {
        var _this = this;
        this.downDisplay.visible = true;
        this.upDisplay.visible = true;
        return new Promise(function (resolve, reject) {
            if (!_this.scene.cameras.main) {
                resolve(null);
                return;
            }
            var height = _this.scene.cameras.main.height;
            _this.upDisplay.y = 0;
            _this.downDisplay.y = height;
            _this.clearTween();
            _this.upTween = _this.scene.tweens.add({
                targets: _this.upDisplay,
                props: { y: -_this.upDisplay.displayHeight },
                duration: 1000
            });
            _this.downTween = _this.scene.tweens.add({
                targets: _this.downDisplay,
                props: { y: height + _this.downDisplay.displayHeight },
                duration: 1000,
                onComplete: function () {
                    // this.downDisplay.visible = false;
                    // this.upDisplay.visible = false;
                    _this.clearTween();
                    resolve();
                }
            });
        });
    };
    Curtain.prototype.destroy = function () {
    };
    Curtain.prototype.clearTween = function () {
        if (this.upTween) {
            this.upTween.stop();
            this.upTween = null;
        }
        if (this.downTween) {
            this.downTween.stop();
            this.downTween = null;
        }
    };
    return Curtain;
}());
//# sourceMappingURL=loading.scene.js.map