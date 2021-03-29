
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { DynamicImage, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { ICountablePackageItem } from "picaStructure";
import { PicaBasePanel } from "../pica.base.panel";
export class PicaSurveyPanel extends PicaBasePanel {
    private topbg: Phaser.GameObjects.Image;
    private title: Phaser.GameObjects.Text;
    private targetPos: Phaser.Math.Vector2;
    private furniItem: FurnitureItem;
    private moveTween: Phaser.Tweens.Tween;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.survey];
        this.key = ModuleName.PICASURVEY_NAME;
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        this.topbg.x = w * 0.5;
        this.topbg.y = 78 * this.dpr;
        this.title.x = this.topbg.x;
        this.title.y = this.topbg.y;
        super.resize(w, h);
        this.setSize(w, h);
        // this.setInteractive();
    }

    init() {
        this.topbg = this.scene.make.image({ key: UIAtlasName.survey, frame: "survey_title_bg" });
        this.title = this.scene.make.text({ text: i18n.t("illustrate.surveyfurni"), style: UIHelper.colorStyle("#27E8FF", 16 * this.dpr) }).setOrigin(0.5);
        this.furniItem = new FurnitureItem(this.scene, this.dpr, this.scale);
        this.furniItem.visible = false;
        this.add([this.topbg, this.title, this.furniItem]);
        this.resize();
        super.init();
    }

    public setSurveyData(data: ICountablePackageItem) {
        this.furniItem.scale = 1;
        this.furniItem.visible = true;
        this.furniItem.x = this.width * 0.5;
        this.furniItem.y = this.height * 0.5;
        this.furniItem.setItemData(data);
        const bottomPanel: any = this.render.uiManager.getPanel(ModuleName.BOTTOM);
        this.targetPos = bottomPanel.navigatePanel.getIllustredPos();
        this.playMove();
        this.setInteractive();
    }

    private playMove() {
        const targetX = this.targetPos.x / this.scale;
        const targetY = this.targetPos.y / this.scale;
        const curX = this.furniItem.x;
        const curY = this.furniItem.y;
        this.moveTween = this.scene.tweens.add({
            targets: this.furniItem,
            x: {
                from: curX,
                to: targetX
            },
            y: {
                from: curY,
                to: targetY
            },
            ease: "Linear",
            duration: 1000,
            delay: 2000,
            onComplete: () => {
                this.moveTween.stop();
                this.moveTween.remove();
                this.moveTween = undefined;
                this.furniItem.visible = false;
                this.disInteractive();
            }
        });
        const scaleTween = UIHelper.playScaleTween(this.scene, this.furniItem, 1, 0, 1000, "Linear", 2000);
    }
}

class FurnitureItem extends Phaser.GameObjects.Container {
    private lightBg: Phaser.GameObjects.Image;
    private bg: Phaser.GameObjects.Image;
    private star: Phaser.GameObjects.Image;
    private iconImg: DynamicImage;
    private nameTex: Phaser.GameObjects.Text;
    private dpr: number;
    private zoom: number;
    private itemData: ICountablePackageItem;
    private intervalTimer: any;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.lightBg = this.scene.make.image({ key: UIAtlasName.survey, frame: "survey_light" });
        this.bg = this.scene.make.image({ key: UIAtlasName.survey, frame: "survey_ordinary_bg" });
        this.iconImg = new DynamicImage(this.scene, 0, 0);
        this.star = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "bag_star_small_1" }).setOrigin(0, 0.5);
        this.nameTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 12) }).setOrigin(0.5);
        this.setSize(this.bg.width, this.bg.height);
        this.iconImg.y = -5 * dpr;
        this.star.x = -this.width * 0.5 + 5 * dpr;
        this.star.y = -this.height * 0.5 + 10 * dpr;
        this.nameTex.y = this.height * 0.5 - 10 * dpr;
        this.add([this.lightBg, this.bg, this.iconImg, this.star, this.nameTex]);
    }

    public setItemData(data: ICountablePackageItem) {
        this.itemData = data;
        const url = Url.getOsdRes(data.texturePath);
        this.iconImg.load(url, this, () => {
            this.iconImg.visible = true;
        });
        this.iconImg.scale = this.dpr / this.zoom;
        this.nameTex.text = data.name;
        this.star.setFrame("bag_star_small_" + data.grade);
        this.playRotateTween();
    }

    public destroy() {
        super.destroy();
        if (this.intervalTimer) clearInterval(this.intervalTimer);
    }
    private playRotateTween() {
        if (!this.scene) return;
        this.lightBg.rotation = 0;
        if (this.intervalTimer) clearInterval(this.intervalTimer);
        this.lightBg.visible = true;
        this.intervalTimer = setInterval(() => {
            if (!this.scene) {
                if (this.intervalTimer) clearInterval(this.intervalTimer);
                return;
            }
            this.lightBg.rotation += 0.1;
        }, 30);
    }
}
