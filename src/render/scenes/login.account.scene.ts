import { BasicScene } from "baseRender";
import { SceneName } from "structure";
import { Url, Size, Logger } from "utils";

export class LoginAccountScene extends BasicScene {
    private mWorld: any;
    private bg: Phaser.GameObjects.Sprite;
    private mCallback: Function;
    constructor() {
        super({ key: SceneName.LOGINACCOUNT_SCENE });
    }

    public preload() {
        // atlas可以用于webgl渲染，和canvas渲染，spritesheet只能用于canvas
        // this.load.image("loading_bg", Url.getRes(""))
        let dpr = 2;
        if (this.mWorld) {
            dpr = this.mWorld.uiRatio || 2;
        }
        this.load.image("avatar_placeholder", Url.getRes("dragonbones/avatar.png"));
        this.load.atlas("curtain", Url.getUIRes(dpr, "loading/curtain.png"), Url.getUIRes(dpr, "loading/curtain.json"));
        this.load.atlas("loading", Url.getRes("ui/loading/loading.png"), Url.getRes("ui/loading/loading.json"));
        // this.load.atlas("grass", Url.getUIRes(dpr, "loading/grass.png"), Url.getUIRes(dpr, "loading/grass.json"));
        this.load.script("webfont", "./resources/scripts/webfont/1.6.26/webfont.js");
        // this.load.spritesheet("rabbit00.png", "./resources/rabbit00.png", { frameWidth: 150, frameHeight: 150 });
    }

    public init(data: any) {
        super.init(data);
        this.createFont();
        this.mWorld = data.world;
        this.mCallback = data.callBack;
    }

    public create() {
        super.create();
        try {
            WebFont.load({
                custom: {
                    // families: ["Source Han Sans", "tt0173m_", "tt0503m_"]
                    families: ["Source Han Sans", "tt0173m_", "tt0503m_", "t04B25"]
                },
            });
        } catch (error) {
            Logger.getInstance().warn("webfont failed to load");
        }

        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;
        // 手动把json配置中的frames给予anims

        this.anims.create({
            key: "loading_anis",
            frames: this.anims.generateFrameNames("loading", { prefix: "loading_", start: 1, end: 3, zeroPad: 1, suffix: ".png" }),
            frameRate: 5,
            repeat: -1
        });

        const dpr = this.mWorld.uiRatio;
        this.bg = this.add.sprite(width * 0.5, height * 0.5, "loading").setScale(this.mWorld.uiScale * dpr * 2);
        this.bg.play("loading_anis");

        this.checkSize(new Size(width, height));
        this.scale.on("resize", this.checkSize, this);
        const bgg = this.add.graphics();
        bgg.fillStyle(0xffcc00, .8);
        bgg.fillRect(0, 0, 100, 50);
        bgg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 100, 50), Phaser.Geom.Rectangle.Contains);
        bgg.x = 200;
        bgg.y = 300;
        bgg.on("pointerdown", () => {
            if (this.mCallback) {
                this.mCallback.call(this, this);
                this.mCallback = undefined;
            }
        }, this);
    }

    getKey(): string {
        return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
    }

    private checkSize(size: Size) {
    }

    private createFont() {
        const element = document.createElement("style");
        document.head.appendChild(element);
        const sheet: CSSStyleSheet = <CSSStyleSheet>element.sheet;
        // const styles = "@font-face { font-family: 'Source Han Sans'; src: url('./resources/fonts/otf/SourceHanSansTC-Regular.otf') format('opentype');font-display:swap; }\n";
        const styles2 = "@font-face { font-family: 'tt0173m_'; src: url('./resources/fonts/en/tt0173m_.ttf') format('truetype');font-display:swap }\n";
        const styles3 = "@font-face { font-family: 'tt0503m_'; src: url('./resources/fonts/en/tt0503m_.ttf') format('truetype'); font-display:swap}\n";
        const styles4 = "@font-face { font-family: 't04B25'; src: url('./resources/fonts/04B.ttf') format('truetype'); font-display:swap}";
        // sheet.insertRule(styles, 0);
        sheet.insertRule(styles2, 0);
        sheet.insertRule(styles3, 0);
        sheet.insertRule(styles4, 0);
    }

}
