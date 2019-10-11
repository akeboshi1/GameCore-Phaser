import { IMediator } from "../../baseMediator";
import { WorldService } from "../../../game/world.service";
import { IAbstractPanel } from "../../abstractPanel";
import { PlayerDataModel } from "../../../service/player/playerDataModel";
import { BagModel } from "../../../service/bag/bagModel";
import { BagUIPC } from "./bagUI.pc";
import { Size } from "../../../utils/size";
import { MessageType } from "../../../const/MessageType";
import { op_client, op_gameconfig } from "pixelpai_proto";
import { BagUIMobile } from "./bagUI.mobile";

export class BagUIMediator implements IMediator {
    public static NAME: string = "BagUIMediator";
    public world: WorldService;
    private mView: IAbstractPanel;
    private mPlayerModel: PlayerDataModel;
    private mBagModel: BagModel;
    private mScene: Phaser.Scene;
    constructor(mWorld: WorldService, scene: Phaser.Scene) {
        this.world = mWorld;
        this.mScene = scene;
        this.mPlayerModel = this.world.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel;
        this.mBagModel = this.world.modelManager.getModel(BagModel.NAME) as BagModel;
    }

    public isSceneUI(): boolean {
        return true;
    }

    public isShow(): boolean {
        if (this.mView) {
            return this.mView.isShow();
        }
    }

    public resize() {
        if (this.mView) this.mView.resize();
    }

    public getView(): IAbstractPanel {
        return this.mView;
    }

    public show(param?: any) {
        if (this.mView && this.mView.isShow()) {
            return;
        }
        const size: Size = this.world.getSize();
        if (this.world.game.device.os.desktop) {
            this.mView = new BagUIPC(this.mScene, this.world, (size.width >> 1) - 29, size.height - 50);
        } else {
            this.mView = new BagUIMobile(this.mScene, this.world);
        }
        this.mView.show(param);
        this.world.modelManager.on(MessageType.QUERY_PACKAGE, this.queryPackAge, this);
        this.world.modelManager.on(MessageType.UPDATED_CHARACTER_PACKAGE, this.heroItemChange, this);
        this.mBagModel.register();
    }

    public update(param: any) {
        if (this.mView) this.mView.update(param);
    }

    public hide() {
        this.world.modelManager.off(MessageType.QUERY_PACKAGE, this.queryPackAge, this);
        this.world.modelManager.off(MessageType.UPDATED_CHARACTER_PACKAGE, this.heroItemChange, this);
        if (this.mView) this.mView.hide();
        this.mView = null;
    }

    private heroItemChange() {
        const itemList: op_gameconfig.IItem[] = (this.world.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel).mainPlayerInfo.package.items;
        if (this.mView && this.world.game.device.os.desktop) {
            (this.mView as BagUIPC).setDataList(itemList);
        }
    }

    private queryPackAge(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE) {
        if (data.id !== this.mPlayerModel.mainPlayerInfo.package.id) return;
        const itemLen: number = data.items.length;
        if (this.mView && this.world.game.device.os.desktop) {
            (this.mView as BagUIPC).setDataList(data.items);
        }
    }
}
