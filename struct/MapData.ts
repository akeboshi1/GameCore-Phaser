import {TerrainInfo} from './TerrainInfo';
import {ElementInfo} from './ElementInfo';

export class MapData {
    private _terrainInfo: Array<TerrainInfo>;
    private _elemenInfo: Array<ElementInfo>;
    public get terrainInfo(): Array<TerrainInfo> {
        return this._terrainInfo;
    }

    public set terrainInfo(value: Array<TerrainInfo>) {
        this._terrainInfo = value;
    }

    public get elementInfo(): Array<ElementInfo> {
        return this._elemenInfo;
    }

    public set elementInfo(value: Array<ElementInfo>) {
        this._elemenInfo = value;
    }
}