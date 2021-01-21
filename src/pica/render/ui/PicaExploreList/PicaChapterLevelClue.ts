import { ItemButton } from "picaRender";
import { UIAtlasName } from "picaRes";
import { op_client } from "pixelpai_proto";
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
        this.enable = true;
        this.BGVisible = false;
    }

    setItemData(data: op_client.ICountablePackageItem) {
        super.setItemData(data);
        this.gou.visible = data.count === 0 ? false : true;
    }
}
