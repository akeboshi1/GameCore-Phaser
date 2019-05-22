import BaseSingleton from "../../base/BaseSingleton";
import {SceneInfo} from "../struct/SceneInfo";
import {op_client} from "pixelpai_proto";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";

export class SceneData extends BaseSingleton {
    private _initialize = false;
    private _mapInfo: SceneInfo = new SceneInfo();

    public get mapInfo(): SceneInfo {
        return this._mapInfo;
    }

    public setMapInfo(value: op_client.IScene): void {
        this._mapInfo.mapId = value.id;
        this._mapInfo.voiceChatRoomId = value.voiceChatRoomId;
        this._mapInfo.setConfig(value.cols, value.rows, value.zStart, value.zEnd, value.tileWidth, value.tileHeight);
        this._mapInfo.setTerrainInfo(value.terrains);
        this._mapInfo.setElementInfo(value.elements);
        if ( this.initialize === false ) {
            this._initialize = true;
            Globals.MessageCenter.emit(MessageType.SCENE_DATA_INITIALIZE);
        }
    }

    public get initialize(): boolean {
        return this._initialize;
    }
}
