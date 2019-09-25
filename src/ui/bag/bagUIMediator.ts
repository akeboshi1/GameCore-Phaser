import { IMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { IAbstractPanel } from "../abstractPanel";
import { PlayerDataModel } from "../../service/player/playerDataModel";
import { BagModel } from "../../service/bag/bagModel";
import { BagUIPC } from "./bagUI.pc";
import { Size } from "../../utils/size";

export class BagUIMediator implements IMediator {
    public world: WorldService;
    private mName: string;
    private mView: IAbstractPanel;
    private mPlayerModel: PlayerDataModel;
    private mBagModel: BagModel;
    constructor(mWorld: WorldService, scene: Phaser.Scene) {
        this.world = mWorld;
        this.mPlayerModel = this.world.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel;
        this.mBagModel = this.world.modelManager.getModel(BagModel.NAME) as BagModel;

        const size: Size = this.world.getSize();
        if (this.world.game.device.os.desktop) {
            this.mView = new BagUIPC(scene, this.world, (size.width >> 1) - 29, size.height - 50);
        } else {
            //  this.mBagUI = new BagUIMobile(scene, this.worldService, size.width - 100, size.height - 100);
        }
        if (this.mView) {
            this.mView.show(undefined);
        }
    }

    public isSceneUI(): boolean {
        return true;
    }

    public isShow(): boolean {
        if (this.mView) return this.mView.isShow;
    }

    public resize() {
        if (this.mView) this.mView.resize();
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
        if (this.mView) this.mView.show(param);
    }

    public update(param: any) {
        if (this.mView) this.mView.update(param);
    }

    public hide() {
        if (this.mView) this.mView.hide();
    }
}
