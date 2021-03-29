import { ItemButton } from "picaRender";
import { UIAtlasName } from "picaRes";
import { ICountablePackageItem } from "picaStructure";
import { UIHelper } from "utils";

export class IllustratedItem extends ItemButton {
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

    setItemData(item: ICountablePackageItem) {
        super.setItemData(item, false);
        if (item) {
            this.codeTex.text = item.code;
            const status = item["status"];
            if (status === 1) {
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
