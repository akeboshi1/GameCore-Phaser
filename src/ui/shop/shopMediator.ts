import { IMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { ShopPanel } from "./shop.panel";
import { IAbstractPanel } from "../abstractPanel";
import { ShopModel } from "../../service/shop/shopModel";

export class ShopMediator implements IMediator {
    public static NAME: string = "ShopMediator";
    public world: WorldService;
    private mView: ShopPanel;
    private mShopModel: ShopModel;
    constructor(world: WorldService, scene: Phaser.Scene) {
        this.world = world;
        this.mShopModel = this.world.modelManager.getModel(ShopMediator.NAME) as ShopModel;
    }

    public isSceneUI(): boolean {
        return false;
    }

    public resize() {
        if (this.mView) return this.mView.resize();
    }

    public getView(): IAbstractPanel {
        return this.mView;
    }

    public show(param?: any) {
        if (this.mView) this.mView.show();
        this.mShopModel.register();
    }

    public update(param?: any) {
        if (this.mView) this.mView.update(param);
    }

    public hide() {
        if (this.mView) this.mView.hide();
        this.mShopModel.unRegister();
    }

    public isShow(): boolean {
        return this.mView ? this.mView.isShow() : false;
    }
}
