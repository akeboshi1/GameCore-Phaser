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
import { Button, BBCodeText, ClickEvent } from "apowophaserui";
import { Font, i18n } from "structure";
import { UiUtils } from "utils";
import { MainUIScene } from "../../scenes/main.ui.scene";
import { BaseBatchPanel } from "./base.batch.panel";
var AlertView = /** @class */ (function (_super) {
    __extends_1(AlertView, _super);
    function AlertView(scene, uiManager) {
        var _this = _super.call(this, scene, uiManager.render) || this;
        _this.uiManager = uiManager;
        _this.skinName = "AlertView";
        _this.key = _this.skinName;
        _this.disInteractive();
        return _this;
    }
    AlertView.prototype.show = function (config) {
        this.mShowData = config;
        _super.prototype.show.call(this, config);
        if (this.mInitialized) {
            var ox = config.ox, oy = config.oy;
            this.x = (ox || this.scene.cameras.main.width / 2);
            this.y = (oy || this.scene.cameras.main.height / 2);
            this.mBackGround.clear();
            this.mBackGround.fillStyle(0xffffff, 0);
            this.mBackGround.fillRect(-this.x, -this.y, this.cameraWidth, this.cameraHeight);
            this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(-this.x, -this.y, this.cameraWidth, this.cameraHeight), Phaser.Geom.Rectangle.Contains);
            this.mContent.setText(config.text);
            if (config.title) {
                this.mTitleLabel.setText(config.title);
            }
            // if (config.btns === Buttons.Ok) {
            // }
            var btns = config.btns;
            if (btns === Buttons.Cancel) {
                this.remove(this.mOkBtn);
                this.mCancelBtn.x = 0;
            }
            else if (btns === Buttons.Ok) {
                this.remove(this.mCancelBtn);
                this.mOkBtn.x = 0;
            }
            // this.render.uiManager.getUILayerManager().addToDialogLayer(this);
        }
    };
    AlertView.prototype.preload = function () {
        this.addAtlas(this.key, "pica_alert/pica_alert.png", "pica_alert/pica_alert.json");
        _super.prototype.preload.call(this);
    };
    AlertView.prototype.setOKText = function (val) {
        this.mOkText = val;
        if (this.mOkBtn) {
            this.mOkBtn.setText(val);
        }
        return this;
    };
    AlertView.prototype.init = function () {
        var zoom = this.mWorld.uiScale || UiUtils.baseScale;
        this.mBackGround = this.scene.make.graphics(undefined, false);
        this.add(this.mBackGround);
        var bg = this.scene.make.image({
            key: this.key,
            frame: "bg.png"
        }, false);
        bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        var title = this.scene.make.image({
            key: this.key,
            frame: "title.png"
        }, false);
        title.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        title.y = -bg.height / 2;
        this.mTitleLabel = this.scene.make.text({
            text: i18n.t("common.tips"),
            style: {
                fontFamily: Font.DEFULT_FONT,
                fontSize: 12 * this.dpr * zoom + "px",
                color: "#905B06"
            }
        }, false).setOrigin(0.5);
        this.mTitleLabel.y = title.y;
        this.mContent = new BBCodeText(this.scene, 0, -11 * this.dpr, "", {
            fontSize: 12 * this.dpr * zoom + "px",
            fontFamily: Font.DEFULT_FONT,
            color: "#0",
            wrap: {
                mode: "char",
                width: 218 * this.dpr
            }
        });
        this.mContent.setOrigin(0.5, 0.5);
        this.mOkBtn = new Button(this.scene, this.key, "yellow_btn.png", undefined, this.mOkText || i18n.t("common.confirm"));
        this.mOkBtn.setTextStyle({
            color: "#905B06",
            fontFamily: Font.DEFULT_FONT,
            fontSize: 13 * this.dpr * zoom
        });
        this.mOkBtn.x = (bg.width - this.mOkBtn.displayWidth) / 2 - 38 * this.dpr;
        this.mOkBtn.y = (bg.height - this.mOkBtn.displayHeight) / 2 - 16 * this.dpr;
        this.mOkBtn.on(ClickEvent.Tap, this.onOkHandler, this);
        this.mCancelBtn = new Button(this.scene, this.key, "red_btn.png", undefined, i18n.t("common.cancel"));
        this.mCancelBtn.setTextStyle({
            fontFamily: Font.DEFULT_FONT,
            fontSize: 13 * this.dpr * zoom
        });
        this.mCancelBtn.x = -(bg.width - this.mCancelBtn.displayWidth) / 2 + 38 * this.dpr;
        this.mCancelBtn.y = this.mOkBtn.y;
        this.mCancelBtn.on(ClickEvent.Tap, this.onCancelHandler, this);
        this.add([bg, title, this.mTitleLabel, this.mTitleLabel, this.mContent, this.mOkBtn, this.mCancelBtn]);
        _super.prototype.init.call(this);
        this.mScene.layerManager.addToLayer(MainUIScene.LAYER_TOOLTIPS, this);
    };
    AlertView.prototype.onOkHandler = function () {
        if (!this.mShowData) {
            return;
        }
        var callback = this.mShowData.callback;
        if (callback) {
            callback.call(this.mShowData.content);
        }
        this.closePanel();
    };
    AlertView.prototype.onCancelHandler = function () {
        var callback = this.mShowData.cancelback;
        if (callback) {
            callback.call(this.mShowData.content);
        }
        this.closePanel();
    };
    AlertView.prototype.closePanel = function () {
        this.uiManager.hideBatchPanel(this);
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
        if (!this.mShowData || this.mShowData.once !== false) {
            this.destroy();
            this.mShowData = undefined;
        }
    };
    return AlertView;
}(BaseBatchPanel));
export { AlertView };
export var Buttons;
(function (Buttons) {
    Buttons[Buttons["Ok"] = 0] = "Ok";
    Buttons[Buttons["Cancel"] = 1] = "Cancel";
    Buttons[Buttons["OKAndCancel"] = 2] = "OKAndCancel";
})(Buttons || (Buttons = {}));
//# sourceMappingURL=alert.view.js.map