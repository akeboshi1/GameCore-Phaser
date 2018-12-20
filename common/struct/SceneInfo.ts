import {TerrainInfo} from "./TerrainInfo";
import {ElementInfo} from "./ElementInfo";
import Globals from "../../Globals";
import {op_client, op_gateway} from "../../../protocol/protocols";
import {Log} from "../../Log";

export class SceneInfo {

    public mapId = 1;
    public zStart = 0; // TODO:
    public zEnd = 0; // TODO:
    private _terrainConfig: Array<TerrainInfo>;
    private _elementConfig: Array<ElementInfo>;

    private _mapTotalWidth = 0;
    private _bgSound = 1;

    public get bgSound(): number {
        return this._bgSound;
    }

    public set bgSound(value: number) {
        this._bgSound = value;
    }

    public get mapTotalWidth(): number {
        return this._mapTotalWidth;
    }

    private _mapTotalHeight = 0;

    public get mapTotalHeight(): number {
        return this._mapTotalHeight;
    }

    private _tileWidth: number;

    /**
     * 获取格子宽（单位：像素）
     */
    public get tileWidth() {
        return this._tileWidth;
    }

    private _tileHeight: number;

    /**
     * 获取格子高（单位：像素）
     */
    public get tileHeight() {
        return this._tileHeight;
    }

    public get terrainConfig(): Array<any> {
        return this._terrainConfig;
    }

    public get elementConfig(): Array<ElementInfo> {
        return this._elementConfig;
    }

    private _cols: number;

    public get cols(): number {
        return this._cols;
    }

    public set cols(value: number) {
        this._cols = value;
    }

    private _rows: number;

    public get rows(): number {
        return this._rows;
    }

    public set rows(value: number) {
        this._rows = value;
    }

    public setConfig(cols: number, rows: number, zStart: number, zEnd: number, tileWidth: number, tileHeight: number): void {
        this._cols = cols; // 水平方向格子数量
        this._rows = rows; // 垂直方向格子数量
        this.zStart = zStart;
        this.zEnd = zEnd;
        this._tileWidth = tileWidth;
        this._tileHeight = tileHeight;
        this._mapTotalWidth = (this._rows + this._cols) * (this._tileWidth / 2);
        this._mapTotalHeight = (this._rows + this._cols) * (this._tileHeight / 2);
    }

    public setTerrainInfo(value: op_client.ITerrain[]): void {
        this._terrainConfig = [];
        let terrains = value;
        let len: number = terrains.length;
        let terrain: TerrainInfo;
        for (let i = 0; i < len; i++) {
          terrain = new TerrainInfo();
          terrain.setInfo(terrains[i]);
          this._terrainConfig.push(terrain);
        }
    }

    public setElementInfo(value: op_client.IElement[]): void {
        this._elementConfig = [];
        let elements = value;
        let len: number = elements.length;
        let element: ElementInfo;
        for (let i = 0; i < len; i++) {
            element = new ElementInfo();
            element.setInfo(elements[i]);
            this._elementConfig.push(element);
        }
    }
}
