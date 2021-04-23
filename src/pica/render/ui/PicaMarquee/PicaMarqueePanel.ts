import { BBCodeText } from "apowophaserui";
import { BasePanel, DynamicImage, MainUIScene, UiManager } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { ModuleName, RENDER_PEER } from "structure";
import { Font, Handler, UIHelper, Url } from "utils";
import { PicaBasePanel } from "../pica.base.panel";

export class PicaMarqueePanel extends PicaBasePanel {
    private mContent: BBCodeText;
    private bg: Phaser.GameObjects.Image;
    private lightSprite: Phaser.GameObjects.Sprite;
    private maskGraphic: Phaser.GameObjects.Graphics;
    private content: Phaser.GameObjects.Container;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.atlasNames = [UIAtlasName.bulletin];
        this.key = ModuleName.PICAMARQUEE_NAME;
    }

    public resize() {
        this.x = this.scene.cameras.main.width / 2;
        this.y = 120 * this.dpr;
        this.maskGraphic.x = this.x;
        this.maskGraphic.y = this.y;
    }
    public onShow() {
        if (this.tempDatas) this.setMarqueeData(this.tempDatas);
    }
    public setMarqueeData(data: any) {
        this.tempDatas = data;
        if (!this.mInitialized) return;
        const tips = data.tips;
        const content = data.message || "";
        const count = data.count || 1;
        this.mContent.text = tips ? `[color=#FFEA00][${tips}][/color]${content}` : content;
        const minitime = 6000, delta = minitime / (267 * this.dpr);
        let moveTime = this.mContent.width * delta;
        moveTime = moveTime < minitime ? minitime : moveTime;
        this.playAni(moveTime, count);
    }
    destroy() {
        super.destroy();
        this.maskGraphic.destroy();
    }

    protected init() {
        this.content = this.scene.make.container(undefined, false);
        this.bg = this.scene.make.image({ key: UIAtlasName.bulletin, frame: "bulletin_bg" }, false);
        this.content.setSize(this.bg.width, this.bg.height);
        this.lightSprite = this.createSprite(UIAtlasName.bulletin, "bulletinlight", "bulletin_light_", [1, 2], 10, -1);
        this.mContent = new BBCodeText(this.mScene, 0, 0, "", UIHelper.colorStyle("#68FAFF", 11 * this.dpr)).setOrigin(0, 0.5);
        this.maskGraphic = this.scene.make.graphics(undefined, false);
        const width = this.bg.width / this.scale - 20 * this.dpr, height = this.bg.height / this.scale;
        this.maskGraphic.fillStyle(0x000000, 1);
        this.maskGraphic.fillRect(-width * 0.5, -height * 0.5, width, height);
        this.content.add([this.mContent]);
        this.add([this.bg, this.lightSprite, this.content]);
        this.content.setMask(this.maskGraphic.createGeometryMask());
        super.init();
        (<MainUIScene>this.mScene).layerManager.addToLayer(MainUIScene.LAYER_TOOLTIPS, this);
        this.resize();
    }

    protected playAni(time: number, count: number) {
        const offset = 10 * this.dpr;
        const width = this.content.width;
        const from = width * 0.5 + offset;
        const to = - width * 0.5 - this.mContent.width - offset + 5 * this.dpr;
        UIHelper.playtPosXTween(this.scene, this.mContent, from, to, time, "Linear", 0, Handler.create(this, () => {
            if (count > 0) this.playAni(time, count);
            else {
                this.render.renderEmitter(this.key + "_close");
            }
        }));
        count--;
    }
    private createSprite(key: string, animkey: string, frame: string, indexs: number[], frameRate: number = 30, repeat = 0) {
        const sprite = this.scene.make.sprite({ key, frame: frame + "1" });
        this.scene.anims.create({ key: animkey, frames: this.scene.anims.generateFrameNames(key, { prefix: frame + "", start: indexs[0], end: indexs[1] }), frameRate, repeat });
        sprite.play(animkey);
        return sprite;
    }
}
