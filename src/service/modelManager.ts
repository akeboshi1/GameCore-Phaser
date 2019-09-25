import { IBaseModel } from "./baseModel";
import { PlayerDataModel } from "./player/playerDataModel";
import { EventEmitter } from "events";
import { WorldService } from "../game/world.service";
import { BagModel } from "./bag/bagModel";

export class ModelManager extends EventEmitter {

    private mModelClassDic: {};
    private mModelDic: {};
    constructor(private mWorld: WorldService) {
        super();
        this.init();
    }

    public init() {
        this.mModelClassDic = {};
        this.mModelDic = {};
        // =============定义好class 用于后面调用时new
        this.mModelClassDic[PlayerDataModel.NAME] = PlayerDataModel;
        this.mModelClassDic[BagModel.NAME] = BagModel;
    }

    public getModel(name: string): IBaseModel | undefined {
        let baseModel: IBaseModel = this.mModelDic[name];
        if (!baseModel) {
            baseModel = this.mModelDic[name] = new (this.mModelClassDic[name])(this.mWorld);
        }
        return baseModel;
    }

}
