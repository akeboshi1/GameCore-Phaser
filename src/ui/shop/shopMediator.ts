import { IMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { ShopPanel } from "./shop.panel";
import { IAbstractPanel } from "../abstractPanel";

export class ShopMediator implements IMediator {
    public world: WorldService;
    private mView: ShopPanel;
    private mName: string;
    constructor(world: WorldService, scene: Phaser.Scene) {
        this.world = world;
    }

    public isSceneUI(): boolean {
        return false;
    }

    public resize() {
        if (this.mView) return this.mView.resize();
    }

    public setName(val: string) {
        this.mName = val;
    }

    public getName(): string {
        return this.mName;
    }

    public getView(): IAbstractPanel {
        return this.mView;
    }

    public show(param?: any) {
        if (this.mView) this.mView.show();
    }

    public update(param?: any) {
        if (this.mView) this.mView.update(param);
    }

    public hide() {
        if (this.mView) this.mView.hide();
    }

    public isShow(): boolean {
        return this.mView ? this.mView.isShow() : false;
    }
}
