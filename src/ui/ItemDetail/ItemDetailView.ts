import { Panel } from "../components/panel";
import { Url } from "../../utils/resUtil";
import { WorldService } from "../../game/world.service";
import { Size } from "../../utils/size";

export class ItemDetailView extends Panel {
    constructor(scene: Phaser.Scene, private mWorld: WorldService) {
        super(scene);
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mScene.load.atlas("itemDetail", Url.getRes("ui/shop/shopView.png"), Url.getRes("ui/shop/shopView.json"));
        super.preload();
    }

    protected init() {
        super.init();
        const size: Size = this.mWorld.getSize();
        const width = size.width;
        const height = size.height;
        const rect = this.mScene.add.graphics();
        rect.fillStyle(0, .2);
        rect.fillRect(0, 0, width, height);
        const preBtn: Phaser.GameObjects.Sprite = this.mScene.make.sprite(undefined, false);
        const nextBtn: Phaser.GameObjects.Sprite = this.mScene.make.sprite(undefined, false);
        this.add(preBtn);
        this.add(nextBtn);

        const iconBG: Phaser.GameObjects.Graphics = this.mScene.make.graphics(undefined, false);
        iconBG.fillStyle(0xEF9F5D, .5);
        iconBG.fillRect(0, 0, 256, 256);
        this.add(iconBG);

        const itemBG: Phaser.GameObjects.Graphics = this.mScene.make.graphics(undefined, false);
        itemBG.fillStyle(0, .5);
        itemBG.fillRect(0, 0, 658, 190);
        this.add(itemBG);

        const nameTF: Phaser.GameObjects.Text = this.mScene.make.text(undefined, false);
        nameTF.setFontFamily("Tahoma");
        nameTF.setFontStyle("bold");
        nameTF.setFontSize(20);
        nameTF.setText("内购商城");
        nameTF.x = size.width / 2 - 10;
        nameTF.y = size.height / 2 - 10;
        this.add(nameTF);
    }

}
