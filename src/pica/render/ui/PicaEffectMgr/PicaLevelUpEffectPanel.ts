import { UIAtlasName } from "picaRes";
import { Handler, i18n, UIHelper } from "utils";

export class PicaLevelUpEffectPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private content: Phaser.GameObjects.Container;
    private maskBlack: Phaser.GameObjects.Graphics;
    private lightSprite: Phaser.GameObjects.Sprite;
    private yuSprite: Phaser.GameObjects.Sprite;
    private wingSprite: Phaser.GameObjects.Sprite;
    private levelbg: Phaser.GameObjects.Image;
    private levelTex: Phaser.GameObjects.Text;
    private tipTex: Phaser.GameObjects.Text;
    private tipCon: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
    }

    public resize(width, height) {
        this.setSize(width, height);
        const maskW = 592 * this.dpr, maskH = 370 * this.dpr;
        this.maskBlack.fillStyle(0, 1);
        this.maskBlack.fillRect(0, 0, maskW, maskH);
        const masky = -this.height * 0.5 + 50 * this.dpr;
        this.maskBlack.y = 50 * this.dpr / this.zoom;
        this.maskBlack.x = -maskW * 0.5;
        this.content.y = masky + maskH;
        this.tipCon.x = -this.width * 0.5;
        this.tipCon.y = masky + maskH * 0.8 + 5 * this.dpr + this.tipCon.height * 0.5;
        this.content.visible = false;
        this.tipCon.visible = false;
    }
    public setLevelUpData(data) {
        this.tipTex.text = i18n.t("effecttips.unlock", { name: "[合成]" });
        this.levelTex.text = data.level + "";
    }

    public playAnimation() {
        const maskW = 592 * this.dpr, maskH = 370 * this.dpr;
        const masky = -this.height * 0.5 + 50 * this.dpr;
        const from = masky + maskH * 0.8;
        const to = masky + maskH * 0.5;
        UIHelper.playtPosYTween(this.scene, this.content, from, to, 300, "Bounce.easeOut", 0, new Handler(this, () => {
            this.lightSprite.play("light");
            this.lightSprite.visible = true;
            setTimeout(() => {
                if (!this.scene) return;
                this.tipCon.visible = true;
                const xfrom = -this.width * 0.5, xto = 0;
                this.tipCon.x = xfrom;
                UIHelper.playtPosXTween(this.scene, this.tipCon, xfrom, xto, 200, "Bounce.easeOut");
            }, 900);
        }));
        this.wingSprite.play("wing");
        this.content.visible = true;
    }

    public destroy() {
        super.destroy();
        this.maskBlack.destroy();
    }
    protected init() {
        this.content = this.scene.make.container(undefined, false);
        this.add(this.content);
        this.maskBlack = this.scene.make.graphics(undefined, false);
        this.content.setMask(this.maskBlack.createGeometryMask());
        this.lightSprite = this.createSprite(UIAtlasName.effectlevelup, "light", "lv_light_0", [1, 2], 3, -1).setOrigin(0.5);
        this.yuSprite = this.createSprite(UIAtlasName.effectlevelup, "eclosion", "lv_eclosion_0", [1, 4], 7, 2);
        this.yuSprite.on(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, this.onYuAniComplHandler, this);
        this.wingSprite = this.createSprite(UIAtlasName.effectlevelup, "wing", "lv_wing_0", [1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4], 7);
        this.wingSprite.on(Phaser.Animations.Events.SPRITE_ANIMATION_UPDATE, this.onWingAniHandler, this);
        this.levelbg = this.scene.make.image({ key: UIAtlasName.effectlevelup, frame: "lv_prospect" });
        this.levelTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr, 30) }).setOrigin(0.5);
        this.levelTex.setFontStyle("bold");
        this.levelTex.y = 10 * this.dpr;
        this.tipCon = this.scene.make.container(undefined, false);
        const unlockbg = this.scene.make.image({ key: UIAtlasName.effectlevelup, frame: "lv_Unlock_bg" });
        this.tipTex = this.scene.make.text({ style: UIHelper.yellowStyle(this.dpr) }).setOrigin(0.5);
        this.tipCon.add([unlockbg, this.tipTex]);
        this.tipCon.setSize(unlockbg.width, unlockbg.height);
        this.content.add([this.lightSprite, this.yuSprite, this.wingSprite, this.levelbg, this.levelTex]);
        this.add(this.tipCon);
        this.resize(this.width, this.height);
        this.lightSprite.visible = false;
        this.yuSprite.visible = false;
    }
    private createSprite(key: string, animkey: string, frame: string, indexs: number[], frameRate: number = 30, repeat = 0) {
        const sprite = this.scene.make.sprite({ key, frame: frame + "1" });
        if (indexs.length <= 2) {
            this.scene.anims.create({ key: animkey, frames: this.scene.anims.generateFrameNames(key, { prefix: frame + "", start: indexs[0], end: indexs[1] }), frameRate, repeat });
        } else {
            this.scene.anims.create({ key: animkey, frames: this.scene.anims.generateFrameNames(key, { prefix: frame + "", frames: indexs }), frameRate, repeat });
        }
        return sprite;
    }

    private onWingAniHandler(anim, frame, sprite) {
        if (frame.textureFrame === "lv_wing_09") {
            this.yuSprite.alpha = 1;
            this.yuSprite.play("eclosion");
            this.yuSprite.visible = true;

        }
    }
    private onYuAniComplHandler() {
        UIHelper.playAlphaTween(this.scene, this.yuSprite, 1, 0, 200, "Linear");
        UIHelper.playAlphaTween(this.scene, this, 1, 0, 200, "Linear", 2200, new Handler(this, () => {
            this.visible = false;
            this.alpha = 1;
            this.tipCon.visible = false;
            this.content.visible = false;
            this.lightSprite.visible = false;
            this.yuSprite.visible = false;
        }));
    }
}
