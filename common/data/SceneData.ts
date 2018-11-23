import BaseSingleton from "../../base/BaseSingleton";
import {SceneInfo} from "../struct/SceneInfo";
import {op_gateway} from "../../../protocol/protocols";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";

export class SceneData extends BaseSingleton {
    private _initialize: boolean = false;
    private _mapInfo: SceneInfo = new SceneInfo();

    public get mapInfo(): SceneInfo {
        return this._mapInfo;
    }

    public setMapInfo(value: op_gateway.IScene): void {
        this._mapInfo.mapId = value.id;
        this._mapInfo.setConfig(value.xEnd - value.xStart, value.yEnd - value.yStart, value.zStart, value.zEnd, 68, 32);
        this._mapInfo.setTerrainInfo(value.layers);
        this._mapInfo.setElementInfo(value.Elements);
        if ( this.initialize === false ) {
            Globals.MessageCenter.emit(MessageType.SCENE_DATA_INITIALIZE);
            this._initialize = true;
        }
    }

    public get initialize(): boolean {
        return this._initialize;
    }
}