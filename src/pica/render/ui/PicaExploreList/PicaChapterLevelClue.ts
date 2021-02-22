import { UIAtlasName } from "picaRes";
import { ICountablePackageItem } from "picaStructure";
import { ItemButton } from "../Components";
export class PicaChapterLevelClue extends ItemButton {
    private gou: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, dpr: number, width: number, height: number) {
        super(scene, UIAtlasName.uicommon, "bag_icon_common_bg", dpr, 1, false);
        this.dpr = dpr;
        this.setSize(width, height);
        this.gou = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "selected" });
        this.gou.x = this.width * 0.5 - this.gou.width * 0.5;
        this.gou.y = this.height * 0.5 - this.gou.height * 0.5;
        this.add([this.gou]);
        this.BGVisible = false;
    }

    setItemData(data: ICountablePackageItem) {
        super.setItemData(data);
        this.gou.visible = data.count === 0 ? false : true;
        this.itemIcon.scale = this.dpr / this.zoom;
    }
    setTexture(key: string, frame: string) {
        this.itemIcon.setTexture(key, frame);
        this.itemIcon.scale = 1;
        this.gou.visible = false;
    }
}
