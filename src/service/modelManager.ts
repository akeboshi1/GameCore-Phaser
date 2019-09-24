import { IBaseModel } from "./baseModel";
import { PlayerDataModel } from "./player/playerDataModel";
import { EventEmitter } from "events";
import { WorldService } from "../game/world.service";

export class ModelManager extends EventEmitter {

    private mModelClassDic: {};
    private mModelDic: {};
    constructor(private mWorld: WorldService) {
        super();
    }

    public init() {
        this.mModelClassDic = {};
        this.mModelDic = {};
        // =============定义好class 用于后面调用时new
        this.mModelClassDic[PlayerDataModel.NAME] = PlayerDataModel;
    }

    public getModel(name: string): IBaseModel | undefined {
        let baseModel: IBaseModel;
        if (!this.mModelDic[name]) {
            baseModel = this.mModelDic[name] = new (this.mModelClassDic[name])(this.mWorld);
        }
        return baseModel;
    }

}
