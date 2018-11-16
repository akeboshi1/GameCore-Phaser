import BaseSingleton from "../../base/BaseSingleton";
import {MapInfo} from "../struct/MapInfo";

export class MapData extends BaseSingleton {
    private _mapInfo: MapInfo;
    public setMapInfo(value: MapInfo): void {
        this._mapInfo = value;
    }

    public get mapInfo(): MapInfo {
        return this._mapInfo;
    }
}