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
import { BasicScene } from "baseRender";
import { Size, Logger, SceneName } from "structure";
var LoginAccountScene = /** @class */ (function (_super) {
    __extends_1(LoginAccountScene, _super);
    function LoginAccountScene() {
        return _super.call(this, { key: SceneName.LOGINACCOUNT_SCENE }) || this;
    }
    LoginAccountScene.prototype.preload = function () {
        // atlas可以用于webgl渲染，和canvas渲染，spritesheet只能用于canvas
        // this.load.image("loading_bg", Url.getRes(""))
        var dpr = 2;
        if (this.mWorld) {
            dpr = this.mWorld.uiRatio || 2;
        }
        this.load.image("avatar_placeholder", this.render.url.getRes("dragonbones/avatar.png"));
        this.load.atlas("curtain", this.render.url.getUIRes(dpr, "loading/curtain.png"), this.render.url.getUIRes(dpr, "loading/curtain.json"));
        this.load.atlas("loading", this.render.url.getRes("ui/loading/loading.png"), this.render.url.getRes("ui/loading/loading.json"));
        // this.load.atlas("grass", Url.getUIRes(dpr, "loading/grass.png"), Url.getUIRes(dpr, "loading/grass.json"));
        this.load.script("webfont", "./resources/scripts/webfont/1.6.26/webfont.js");
        // this.load.spritesheet("rabbit00.png", "./resources/rabbit00.png", { frameWidth: 150, frameHeight: 150 });
    };
    LoginAccountScene.prototype.init = function (data) {
        _super.prototype.init.call(this, data);
        this.createFont();
        this.mWorld = data.world;
        this.mCallback = data.callBack;
    };
    LoginAccountScene.prototype.create = function () {
        var _this = this;
        _super.prototype.create.call(this);
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
        var dpr = this.mWorld.uiRatio;
        this.bg = this.add.sprite(width * 0.5, height * 0.5, "loading").setScale(this.mWorld.uiScale * dpr * 2);
        this.bg.play("loading_anis");
        this.checkSize(new Size(width, height));
        this.scale.on("resize", this.checkSize, this);
        var bgg = this.add.graphics();
        bgg.fillStyle(0xffcc00, .8);
        bgg.fillRect(0, 0, 100, 50);
        bgg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 100, 50), Phaser.Geom.Rectangle.Contains);
        bgg.x = 200;
        bgg.y = 300;
        bgg.on("pointerdown", function () {
            if (_this.mCallback) {
                _this.mCallback.call(_this, _this);
                _this.mCallback = undefined;
            }
        }, this);
    };
    LoginAccountScene.prototype.getKey = function () {
        return this.sys.config.key;
    };
    LoginAccountScene.prototype.checkSize = function (size) {
    };
    LoginAccountScene.prototype.createFont = function () {
        var element = document.createElement("style");
        document.head.appendChild(element);
        var sheet = element.sheet;
        // const styles = "@font-face { font-family: 'Source Han Sans'; src: url('./resources/fonts/otf/SourceHanSansTC-Regular.otf') format('opentype');font-display:swap; }\n";
        var styles2 = "@font-face { font-family: 'tt0173m_'; src: url('./resources/fonts/en/tt0173m_.ttf') format('truetype');font-display:swap }\n";
        var styles3 = "@font-face { font-family: 'tt0503m_'; src: url('./resources/fonts/en/tt0503m_.ttf') format('truetype'); font-display:swap}\n";
        var styles4 = "@font-face { font-family: 't04B25'; src: url('./resources/fonts/04B.ttf') format('truetype'); font-display:swap}";
        // sheet.insertRule(styles, 0);
        sheet.insertRule(styles2, 0);
        sheet.insertRule(styles3, 0);
        sheet.insertRule(styles4, 0);
    };
    return LoginAccountScene;
}(BasicScene));
export { LoginAccountScene };
//# sourceMappingURL=login.account.scene.js.map