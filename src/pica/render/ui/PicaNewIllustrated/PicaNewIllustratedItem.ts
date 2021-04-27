import { i18n, UIHelper, Url } from "utils";
import { ButtonEventDispatcher, DynamicImage } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { ICountablePackageItem } from "picaStructure";

export class PicaNewIllustratedItem extends ButtonEventDispatcher {
    public itemData: ICountablePackageItem;
    private codeTex: Phaser.GameObjects.Text;
    private starImg: Phaser.GameObjects.Image;
    private surveyImg: Phaser.GameObjects.Image;
    private surveyLight: Phaser.GameObjects.Image;
    private itemIcon: DynamicImage;
    private magnifyingImg: Phaser.GameObjects.Image;
    private discoveryTips: Phaser.GameObjects.Text;
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
        this.discoveryTips.x = width * 0.5;
        this.discoveryTips.y = -height * 0.5;
        this.discoveryTips.setStroke("#ffffff", 2 * dpr);
        this.discoveryTips.setFontStyle("bold");
        this.discoveryTips.visible = false;
        this.add([this.surveyImg, this.surveyLight, this.itemIcon, this.starImg, this.codeTex, this.magnifyingImg]);
        for (const item of this.list) {
            const temp = <Phaser.GameObjects.Container>item;
            temp.y -= 10 * dpr;
        }
        this.enable = true;
    }

    setItemData(item: ICountablePackageItem, code: boolean = true) {
        const url = Url.getOsdRes(item.texturePath);
        this.itemIcon.load(url, this, () => {
            this.itemIcon.visible = true;
        });
        this.itemIcon.scale = this.dpr / this.zoom;
        if (item) {
            this.codeTex.text = code ? item.code : item.name;
            const status = item["status"];
            if (status === 1) {
                this.surveyImg.setTexture(UIAtlasName.illustrate_new, "illustrate_survey_icon_base_1");
                this.surveyLight.visible = false;
                this.magnifyingImg.visible = true;
                this.itemIcon.alpha = 0.4;
            } else {
                this.surveyImg.setTexture(UIAtlasName.illustrate_new, "illustrate_survey_icon_base");
                this.surveyLight.visible = true;
                this.magnifyingImg.visible = false;
                this.itemIcon.alpha = 1;
            }
            this.setStarImg(status, item.grade);
            this.discoveryTips.visible = true;
        }
    }
    protected setStarImg(status: number, grade: number) {
        if (grade > 0) {
            this.starImg.visible = true;
            const frame = status === 1 ? "illustrate_survey_star_gray" : "illustrate_survey_star";
            const starFrame = frame + grade;
            this.starImg.setFrame(starFrame);
        } else this.starImg.visible = false;
    }
}
