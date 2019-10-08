import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";

export class ShopPanel extends Panel {
    private mParent: Phaser.GameObjects.Container;
    private mWorld: WorldService;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
    }

    public isShow(): boolean {
        return this.mShowing;
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mScene.load.image("shopBtn", Url.getRes("ui/shop/shop_btn.png"));
        this.mScene.load.atlas("shopView", Url.getRes("ui/shop/shopView.png"), Url.getRes("ui/shop/shopView.json"));
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        super.init();
        this.mParent = this.mScene.add.container(0, 0);

    }
}
