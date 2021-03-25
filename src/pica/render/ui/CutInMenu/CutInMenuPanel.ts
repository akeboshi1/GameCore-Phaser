import { op_client } from "pixelpai_proto";
import { BasePanel, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { Handler, i18n, UIHelper } from "utils";
export class CutInMenuPanel extends BasePanel {
    private rightPopButton: RightPopContainer;
    private mapPop: Map<any, any> = new Map();
    private popData: any;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.CUTINMENU_NAME;
    }

    resize(width: number, height: number) {
        super.resize(width, height);
        this.setSize(width, height);
    }

    preload() {
        this.addAtlas(this.key, "cutInmenu/cutInmenu.png", "cutInmenu/cutInmenu.json");
        super.preload();
    }

    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        const buttonType = this.buttonType;
        if (buttonType === "work") {
            // this.rightPopButton = new WorkPopContainer(this.scene, width, this.key, this.dpr);
        } else if (buttonType === "minecar") {
            this.rightPopButton = new MinePopContainer(this.scene, width, this.key, this.dpr);
        } else if (buttonType === "editor") {
            this.rightPopButton = new EditorPopContainer(this.scene, width, this.key, this.dpr);
        } else
            this.rightPopButton = new RightPopContainer(this.scene, width, this.key, this.dpr);
        if (this.rightPopButton) {
            const posx = width + this.rightPopButton.width * 0.5 - 15 * this.dpr;
            this.rightPopButton.setPosition(posx, height * 0.5 + 20 * this.dpr);
            this.rightPopButton.setClickHandler(new Handler(this, this.onRightClickHandler));
            this.add(this.rightPopButton);
        }
        this.resize(width, height);
        super.init();
        this.opneButton();
    }
    onShow() {
        this.setPopData(this.popData);
    }
    setPopData(data: any) {
        this.popData = data;
        if (!this.mInitialized || !this.rightPopButton) return;
        const type = this.buttonType;
        if (type === "work") {
            (<WorkPopContainer>(this.rightPopButton)).setCount(data);
        } else if (type === "minecar") {

        }
    }

    destroy() {
        super.destroy();
    }
    public opneButton() {
        if (!this.mInitialized || !this.rightPopButton) return;
        this.rightPopButton.onTakeBack();
    }
    private onRightClickHandler() {
        const type = this.buttonType;
        if (type === "work") {
            this.render.renderEmitter(ModuleName.CUTINMENU_NAME + "_openmed", ModuleName.PICAWORK_NAME);
        } else if (type === "minecar") {
            this.render.renderEmitter(ModuleName.CUTINMENU_NAME + "_openmed", ModuleName.PICAMINECAR_NAME);
        } else if (type === "editor") {
            this.render.renderEmitter(ModuleName.CUTINMENU_NAME + "_editor");
        }
    }

    private get buttonType() {
        const data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mShowData;
        const button = data.button[0];
        return button.text;
    }
}

class RightPopContainer extends Phaser.GameObjects.Container {
    public isPop: boolean = false;
    protected readonly dpr: number;
    protected readonly key: string;
    protected imgIcon: Phaser.GameObjects.Image;
    protected text: Phaser.GameObjects.Text;
    protected bgSprite: Phaser.GameObjects.Image;
    protected minecarbg: Phaser.GameObjects.Image;
    protected clickHandler: Handler;
    protected popData: any;
    protected scaleWidth: number;
    protected isPlaying: boolean = false;
    protected timeID: any;
    protected tween: Phaser.Tweens.Tween;
    constructor(scene: Phaser.Scene, width: number, key: string, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.scaleWidth = width;
        this.minecarbg = this.scene.make.image({ key: this.key, frame: "minebag_bg" });
        this.minecarbg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.minecarbg.on("pointerup", this.onClickHandler, this);
        this.minecarbg.setInteractive();
        this.setSize(this.minecarbg.width, this.minecarbg.height);
        this.bgSprite = this.scene.make.image({ key: this.key, frame: "minebag_bg_brth" }, false);
        this.bgSprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.imgIcon = this.scene.make.image({ key: this.key, frame: "minecar" });
        this.imgIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.imgIcon.setPosition(-12 * dpr, -this.imgIcon.height * 0.5);
        this.text = scene.make.text({
            x: this.imgIcon.x,
            y: 2 * dpr,
            text: i18n.t("common.open"),
            style: UIHelper.whiteStyle(dpr, 12)
        }, false).setOrigin(0.5);
        this.text.setFontStyle("bold");
        this.text.setStroke("#2D1415", 3 * dpr);
        this.add([this.bgSprite, this.minecarbg, this.imgIcon, this.text]);
        this.tween = this.scene.tweens.add({
            targets: this.bgSprite,
            alpha: { value: 0, duration: 500, ease: "Power1", yoyo: true },
            repeat: -1
        });
    }
    public setClickHandler(handler: Handler) {
        this.clickHandler = handler;
    }
    public setIconFrame(frame: string) {
        this.imgIcon.setFrame(frame);
    }
    public setPopData(data: any) {
        this.popData = data;
    }

    public play() {
        this.bgSprite.alpha = 1;
        this.tween.resume();
        this.isPop = false;
    }

    public stop() {
        this.tween.pause();
        this.bgSprite.alpha = 0;
        this.isPop = true;
    }
    public onClickHandler() {
        if (this.clickHandler) this.clickHandler.runWith(this.popData);
    }

    public onTakeBack() {
        if (!this.isPlaying && !this.isPop) {
            this.popAnim();
        } else if (!this.isPlaying && this.isPop) {
            this.takeback();
        }
    }
    protected popAnim() {
        this.isPlaying = true;
        const posTx = this.scaleWidth - 15 * this.dpr;
        const target = this;
        this.scene.tweens.add({
            targets: target,
            x: { value: posTx, duration: 300, ease: "Bounce.easeOut" },
            onComplete: () => {
                target.stop();
                target.isPlaying = false;
            }
        });
    }

    protected takeback() {
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        this.isPlaying = true;
        const posx = this.scaleWidth + this.width * 0.5 - 15 * this.dpr;
        const target = this;
        this.scene.tweens.add({
            targets: target,
            x: { value: posx, duration: 300, ease: "Bounce.easeOut" },
            onComplete: () => {
                target.play();
                target.isPlaying = false;
            }
        });
    }
}

class MinePopContainer extends RightPopContainer {
    constructor(scene: Phaser.Scene, width: number, key: string, dpr: number) {
        super(scene, width, key, dpr);
        const arrow = this.scene.make.image({ key: this.key, frame: "arow" });
        arrow.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        const arrowcon = scene.make.container(undefined, false);
        arrowcon.setSize(25 * dpr, 31 * dpr);
        arrowcon.add(arrow);
        arrowcon.setPosition(-this.minecarbg.width * 0.5 + 10 * dpr, 0);
        this.add(arrowcon);
        arrowcon.on("pointerup", this.onTakeBack, this);
        arrowcon.setInteractive();
    }
}

class WorkPopContainer extends MinePopContainer {
    protected countTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, key: string, dpr: number) {
        super(scene, width, key, dpr);
        this.imgIcon.x = -22 * dpr;
        this.text.x = this.imgIcon.x;
        const countbg = this.scene.make.image({ key: this.key, frame: "time" });
        countbg.x = this.imgIcon.x + countbg.width * 0.5 + 20 * dpr;
        countbg.y = 2 * dpr;
        this.add(countbg);
        this.countTex = scene.make.text({
            x: countbg.x,
            y: countbg.y,
            text: "",
            style: UIHelper.whiteStyle(dpr, 10)
        }, false).setOrigin(0.5);
        this.countTex.setFontStyle("bold");
        this.add(this.countTex);
        this.setIconFrame("work_icon");
        this.text.text = i18n.t("work.title");
    }
    public setCount(count: number) {
        this.countTex.text = count + "";
    }

    protected popAnim() {
        this.isPlaying = true;
        const posTx = this.scaleWidth - 25 * this.dpr;
        const target = this;
        this.scene.tweens.add({
            targets: target,
            x: { value: posTx, duration: 300, ease: "Bounce.easeOut" },
            onComplete: () => {
                target.stop();
                target.isPlaying = false;
            }
        });
    }

    protected takeback() {
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        this.isPlaying = true;
        const posx = this.scaleWidth + this.width * 0.5 - 15 * this.dpr;
        const target = this;
        this.scene.tweens.add({
            targets: target,
            x: { value: posx, duration: 300, ease: "Bounce.easeOut" },
            onComplete: () => {
                target.play();
                target.isPlaying = false;
            }
        });
    }
}
class EditorPopContainer extends RightPopContainer {
    constructor(scene: Phaser.Scene, width: number, key: string, dpr: number) {
        super(scene, width, key, dpr);
        this.bgSprite.visible = false;
        this.text.visible = false;
        // this.text.x -= 2 * dpr;
        // this.text.y = 0;
        // this.text.setText(i18n.t("common.editor"));
        // this.text.setStyle(UIHelper.brownishStyle(dpr, 19));
        // this.text.setStroke(undefined, 0);
        this.minecarbg.x += 10 * dpr;
        this.setIconFrame("edit_icon");
        this.imgIcon.y = 0;
    }
}
