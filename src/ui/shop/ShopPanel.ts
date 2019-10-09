import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";

export class ShopPanel extends Panel {
    private mWorld: WorldService;
    private mParentCon: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
    }

    public isShow(): boolean {
        return this.mShowing;
    }

    public destroy() {
        if (this.mParentCon) {
            this.mParentCon.destroy(true);
        }
        this.mInitialized = false;
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mScene.load.atlas("shopView", Url.getRes("ui/shop/shopView.png"), Url.getRes("ui/shop/shopView.json"));
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        super.init();
        const size = this.mWorld.getSize();
        this.mParentCon = this.mScene.add.container(size.width >> 1, size.height - 200);
        const mBg: Phaser.GameObjects.Sprite = this.mScene.make.sprite(undefined, false);
        mBg.setTexture("shopView", "shopView_bg");
        mBg.x = size.width >> 1;
        mBg.y = size.height - 200;
        this.mParentCon.add(mBg);

        const titleCon: Phaser.GameObjects.Sprite = this.mScene.make.sprite(undefined, false);
        titleCon.setTexture("shopView", "shopView_titleIcon");
        // titleCon.x = (- wid >> 1) + 80;
        // titleCon.y = (-hei >> 1);
        this.mParentCon.add(titleCon);
        const titleTF: Phaser.GameObjects.Text = this.mScene.make.text(undefined, false);

        titleTF.setFontFamily("Tahoma");
        titleTF.setFontStyle("bold");
        titleTF.setFontSize(20);
        titleTF.setText("内购商城");
        titleTF.x = titleCon.x + titleCon.width - 10;
        titleTF.y = titleCon.y - (titleTF.height >> 1);
        this.mParentCon.add(titleTF);
    }

    protected loadComplete(loader: Phaser.Loader.LoaderPlugin, totalComplete: integer, totalFailed: integer) {
        if (this.mInitialized) {
            return;
        }
        this.init();
    }
}
