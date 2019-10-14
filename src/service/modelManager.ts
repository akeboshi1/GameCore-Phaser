import { IBaseModel } from "./baseModel";
import { PlayerDataModel } from "./player/playerDataModel";
import { WorldService } from "../game/world.service";
import { BagModel } from "./bag/bagModel";
import { MapDataModel } from "./map/mapDataModel";
import { ShopModel } from "./shop/shopModel";
import { StorageModel } from "./storage/storageModel";

export class ModelManager extends Phaser.Events.EventEmitter {

    private mModelClassDic: Map<string, any>;
    private mModelDic: Map<string, IBaseModel>;
    constructor(private mWorld: WorldService) {
        super();
        this.init();
    }

    public init() {
        this.mModelClassDic = new Map();
        this.mModelDic = new Map();
        // =============定义好class 用于后面调用时new
        this.mModelClassDic.set(PlayerDataModel.NAME, PlayerDataModel);
        this.mModelClassDic.set(MapDataModel.NAME, MapDataModel);
        this.mModelClassDic.set(BagModel.NAME, BagModel);
        this.mModelClassDic.set(ShopModel.NAME, ShopModel);
        this.mModelClassDic.set(StorageModel.NAME, StorageModel);
    }

    public getModel(name: string): IBaseModel | undefined {
        let baseModel: IBaseModel = this.mModelDic.get(name);
        if (!baseModel) {
            baseModel = new (this.mModelClassDic.get(name))(this.mWorld);
            baseModel.register();
            this.mModelDic.set(name, baseModel);
        }
        return baseModel;
    }

    public destroy() {
        this.mModelClassDic.forEach((modelClass) => {
            modelClass = null;
        });
        this.mModelClassDic.clear();
        this.mModelClassDic = null;

        this.mModelDic.forEach((model) => {
            model.unRegister();
            model.destroy();
            model = null;
        });
        this.mModelDic.clear();
        this.mModelDic = null;
    }

}
