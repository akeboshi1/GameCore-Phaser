import { Handler, i18n, UIHelper, Url } from "utils";
import { ButtonEventDispatcher, DynamicImage } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { ICountablePackageItem } from "picaStructure";
import { ItemButton } from "..";
import { UITools } from "../uitool";

export class PicaNewIllustratedItem extends ButtonEventDispatcher {
    public itemData: ICountablePackageItem;
    private codeTex: Phaser.GameObjects.Text;
    private starImg: Phaser.GameObjects.Image;
    private surveyImg: Phaser.GameObjects.Image;
    private surveyLight: Phaser.GameObjects.Image;
    private itemIcon: DynamicImage;
    private magnifyingImg: Phaser.GameObjects.Image;
    private discoveryTips: Phaser.GameObjects.Text;
    private rarityTex: Phaser.GameObjects.Text;
    private yoyoTween: Phaser.Tweens.Tween;
    private aniTweens: Phaser.Tweens.Tween[] = [];
    private isplayingLight: boolean = false;
    private redImg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0, true);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.surveyImg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_icon_base_1" });
        this.surveyImg.y = height * 0.5 - this.surveyImg.height * 0.5 - 7 * dpr;
        this.surveyLight = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_icon_light" });
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.magnifyingImg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_icon_magnifier" });
        this.starImg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_star1" });
        this.starImg.y = height * 0.5 - 10 * dpr;
        this.codeTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 10) }).setOrigin(0.5);
        this.codeTex.y = this.starImg.y + 10 * dpr;
        this.discoveryTips = this.scene.make.text({ text: i18n.t("illustrate.newdiscovery"), style: UIHelper.colorStyle("#FC1111", 7 * dpr) });
        this.discoveryTips.x = width * 0.5 - 10 * dpr;
        this.discoveryTips.y = -height * 0.5 + 15 * dpr;
        this.discoveryTips.setStroke("#ffffff", 2 * dpr);
        this.discoveryTips.setFontStyle("bold");
        this.discoveryTips.visible = false;
        this.rarityTex = this.scene.make.text({ text: i18n.t("common.rarity"), style: UIHelper.colorStyle("#18FF4E", 7 * dpr) }).setOrigin(0, 0.5);
        this.rarityTex.x = -width * 0.5;
        this.rarityTex.y = -height * 0.5 + 15 * dpr;
        this.rarityTex.setStroke("#000000", 2 * dpr);
        this.rarityTex.setFontStyle("bold");
        this.rarityTex.visible = false;
        this.redImg = UITools.creatRedImge(scene, this, { x: 0, y: 30 * dpr }, UIAtlasName.illustrate_new, "illustrate_survey_lv_prompt_s");
        this.add([this.surveyImg, this.surveyLight, this.itemIcon, this.starImg, this.codeTex, this.magnifyingImg, this.rarityTex, this.discoveryTips, this.redImg]);
        for (const item of this.list) {
            const temp = <Phaser.GameObjects.Container>item;
            temp.y -= 10 * dpr;
        }
        this.enable = true;
    }

    destroy() {
        super.destroy();
        this.clearYoyoTween();
    }
    setItemData(item: ICountablePackageItem, code: boolean = true) {
        const before = this.itemData;
        this.itemData = item;
        if (before && before.id === item.id) {
            if (this.isplayingLight) return;
        }
        this.isplayingLight = false;
        this.clearYoyoTween();
        this.clearAniTweens();
        this.redImg.visible = false;
        const url = Url.getOsdRes(item.texturePath);
        this.itemIcon.load(url, this, () => {
            this.itemIcon.visible = true;
        });
        this.itemIcon.scale = this.dpr / this.zoom;
        if (item) {
            this.codeTex.text = code ? item.code : item.name;
            const status = item["status"];
            this.surveyLight.setFrame("illustrate_survey_icon_light");
            this.rarityTex.visible = false;
            this.surveyLight.visible = false;
            this.magnifyingImg.visible = false;
            this.discoveryTips.visible = false;
            if (status === 1) {
                this.surveyImg.setTexture(UIAtlasName.illustrate_new, "illustrate_survey_icon_base_1");
                this.magnifyingImg.visible = true;
                this.discoveryTips.visible = true;
                this.itemIcon.alpha = 0.4;
            } else if (status === 2) {
                this.surveyImg.setTexture(UIAtlasName.illustrate_new, "illustrate_survey_icon_base_1");
                this.itemIcon.alpha = 0.4;
            } else if (status === 3) {
                this.surveyImg.setTexture(UIAtlasName.illustrate_new, "illustrate_survey_icon_base_1");
                this.itemIcon.alpha = 1;
                this.playAni();
                this.redImg.visible = true;
            } else if (status === 4) {
                if (this.itemData.rarity === 5) {
                    this.surveyLight.setFrame("illustrate_survey_icon_light_1");
                    this.rarityTex.visible = true;
                }
                this.surveyImg.setTexture(UIAtlasName.illustrate_new, "illustrate_survey_icon_base");
                this.surveyLight.visible = true;
                this.itemIcon.alpha = 1;
            }
            this.setStarImg(status, item.grade);
        }
    }

    playAni() {
        this.yoyoTween = this.scene.tweens.add({
            targets: this.itemIcon,
            y: {
                from: -2 * this.dpr,
                to: 2 * this.dpr
            },
            ease: "Linear",
            duration: 300,
            delay: 0,
            yoyo: true,
            repeat: -1
        });
    }

    playLightAni(compl: Handler) {
        if (this.isplayingLight) return;
        this.clearYoyoTween();
        this.itemIcon.y = 0;
        const surveyAniImg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_icon_base" });
        surveyAniImg.y = this.surveyImg.y;
        this.addAt(surveyAniImg, 1);
        surveyAniImg.alpha = 0;
        const graphicsMask = this.createMask();
        this.surveyLight.mask = graphicsMask.createGeometryMask();
        this.setStarImg(4, this.itemData.grade);
        this.isplayingLight = true;
        this.redImg.visible = false;
        this.surveyLight.setFrame("illustrate_survey_icon_light");
        const tween1 = UIHelper.playAlphaTween(this.scene, surveyAniImg, 0, 1, 500, undefined, 0, new Handler(this, () => {
            const from = this.height * 0.5 + this.surveyLight.height * 0.5;
            const to = -10 * this.dpr;
            if (this.isplayingLight) {
                this.surveyLight.visible = true;
                this.surveyLight.y = from;
            }
            const tween2 = UIHelper.playtPosYTween(this.scene, this.surveyLight, from, to, 300, "Linear", 0, new Handler(this, () => {
                graphicsMask.destroy();
                surveyAniImg.destroy();
                if (this.isplayingLight) {
                    this.surveyImg.setFrame("illustrate_survey_icon_base");
                    this.surveyLight.mask = undefined;
                    if (this.itemData.rarity === 5) {
                        this.surveyLight.setFrame("illustrate_survey_icon_light_1");
                        this.rarityTex.visible = true;
                    }
                }
                if (compl) compl.run();
            }));
            // this.aniTweens.push(tween2);
        }));
        //  this.aniTweens.push(tween1);
    }
    protected createMask() {
        const graphicsMask = this.scene.make.graphics(undefined, false);
        graphicsMask.fillStyle(0x000000, 1);
        graphicsMask.fillRect(-this.width * 0.5 * this.zoom, -this.height * 0.5 * this.zoom, this.width * this.zoom, this.height * this.zoom);
        const world = this.getWorldTransformMatrix();
        graphicsMask.x = world.tx;
        graphicsMask.y = world.ty - 30 * this.dpr * this.zoom;
        return graphicsMask;
    }
    protected setStarImg(status: number, grade: number) {
        if (grade > 0) {
            this.starImg.visible = true;
            const frame = status !== 4 ? "illustrate_survey_star_gray" : "illustrate_survey_star";
            const starFrame = frame + grade;
            this.starImg.setFrame(starFrame);
        } else this.starImg.visible = false;
    }

    protected clearYoyoTween() {
        if (this.yoyoTween) {
            this.yoyoTween.stop();
            this.yoyoTween.remove();
            this.yoyoTween = undefined;
        }
    }
    protected clearAniTweens() {
        // for (const tween of this.aniTweens) {
        //     tween.stop();
        //     tween.remove();
        // }
        this.aniTweens.length = 0;
        this.surveyLight.visible = true;
        const to = -10 * this.dpr;
        this.surveyLight.y = to;
        this.surveyLight.mask = undefined;

    }
}

export class PicaIllustratedItemButton extends ItemButton {
    private codeTex: Phaser.GameObjects.Text;
    private star: Phaser.GameObjects.Image;
    private surveyImg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, undefined, undefined, dpr, zoom, false);
        this.setSize(width, height);
        this.codeTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 10) }).setOrigin(0, 0.5);
        this.codeTex.x = -this.width * 0.5 + 9 * dpr;
        this.codeTex.y = this.height * 0.5 - 4 * dpr;
        this.star = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_survey_star_empty" });
        this.star.x = this.width * 0.5 - this.star.width * 0.5 - 2 * dpr;
        this.star.y = this.codeTex.y;
        this.star.visible = false;
        this.surveyImg = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_survey_nohave" });
        this.add([this.codeTex, this.star, this.surveyImg]);
        for (const item of this.list) {
            const temp = <Phaser.GameObjects.Container>item;
            temp.y -= 10 * dpr;
        }
    }

    setItemData(item: ICountablePackageItem, code: boolean = true) {
        super.setItemData(item, false);
        if (item) {
            this.codeTex.text = code ? item.code : item.name;
            const status = item["status"];
            if (status !== 4) {
                this.bg.setTexture(UIAtlasName.illustrate, "illustrate_survey_nohave");
                this.itemIcon.alpha = 0.4;
                this.star.alpha = 0.4;
            } else {
                this.bg.setTexture(UIAtlasName.uicommon, this.bgFrame);
                this.itemIcon.alpha = 1;
                this.star.alpha = 1;
            }
            this.surveyImg.visible = false;
        }
    }
}
