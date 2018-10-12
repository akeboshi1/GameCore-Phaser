import {TerrainInfo} from './TerrainInfo';
import {ElementInfo} from './ElementInfo';

export class MapInfo {
    private _mapTotalWidth: number = 0;
    private _mapTotalHeight: number = 0;
    private _tilewidth: number;
    private _tileheight: number;
    public get rows(): number {
        return this._rows;
    }

    public set rows(value: number) {
        this._rows = value;
    }
    public get cols(): number {
        return this._cols;
    }

    public set cols(value: number) {
        this._cols = value;
    }
    private _cols: number;
    private _rows: number;
    private _terrainInfo: Array<TerrainInfo>;
    private _elemenInfo: Array<ElementInfo>;
    public get terrainInfo(): Array<TerrainInfo> {
        return this._terrainInfo;
    }

    public set terrainInfo(value: Array<TerrainInfo>) {
        this._terrainInfo = value;
    }

    /**
     * 获取格子宽（单位：像素）
     */
    public get tilewidth() {
        return this._tilewidth;
    }

    /**
     * 获取格子高（单位：像素）
     */
    public get tileheight() {
        return this._tileheight;
    }

    public get mapTotalWidth(): number {
        return this._mapTotalWidth;
    }

    public get mapTotalHeight(): number {
        return this._mapTotalHeight;
    }

    public get elementInfo(): Array<ElementInfo> {
        return this._elemenInfo;
    }

    public set elementInfo(value: Array<ElementInfo>) {
        this._elemenInfo = value;
    }
}