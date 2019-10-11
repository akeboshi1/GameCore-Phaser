import { IAbstractPanel } from "../../abstractPanel";
import { Panel } from "../../components/panel";
import { ItemSlot } from "../item.slot";
import { Size } from "../../../utils/size";
import { WorldService } from "../../../game/world.service";
import { Url } from "../../../utils/resUtil";

export class StoragePanel extends Panel {
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mWorld: WorldService;
    private mBagItemSlotList: ItemSlot[];
    private mBg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
    }
    public isShow(): boolean {
        return this.mShowing;
    }
    public resize() {
        const size: Size = this.mWorld.getSize();
        this.x = size.width >> 1;
        this.y = size.height - 200;
    }
    public show(param: any) {
        super.show(param);
    }
    public update(param: any) {
        super.update(param);
    }
    public hide() {
        super.hide();
    }
    public destroy() {
        super.destroy();
    }

    protected init() {
        if (this.mInitialized) return;
        super.init();
        this.mBg = this.mScene.make.image(undefined, false);
        this.mBg.setTexture(this.mResStr, "itemBagView_bg");
        this.addAt(this.mBg, 0);
        const titleIcon: Phaser.GameObjects.Image = this.mScene.make.image(undefined, false);
        titleIcon.setTexture(this.mResStr, "itemBagView_title");
        titleIcon.x = (-this.mBg.width >> 1) + 80;
        titleIcon.y = -this.mBg.height >> 1;
        this.add(titleIcon);

        const titleTF: Phaser.GameObjects.Text = this.mScene.make.text(undefined, false);
        titleTF.setFontFamily("Tahoma");
        titleTF.setFontStyle("bold");
        titleTF.setFontSize(20);
        titleTF.setText("书柜");
        titleTF.x = titleIcon.x + titleIcon.width - 10;
        titleTF.y = titleIcon.y - (titleTF.height >> 1);
        this.add(titleTF);

    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mResStr = "bagView";
        this.mResPng = "ui/bag/bagView.png";
        this.mResJson = "ui/bag/bagView.json";
        this.mScene.load.atlas(this.mResStr, Url.getRes(this.mResPng), Url.getRes(this.mResJson));
        super.preload();
    }
}
