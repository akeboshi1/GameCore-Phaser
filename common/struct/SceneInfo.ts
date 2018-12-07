import {TerrainInfo} from "./TerrainInfo";
import {ElementInfo} from "./ElementInfo";
import Globals from "../../Globals";
import {op_client, op_gateway} from "../../../protocol/protocols";
import {Log} from "../../Log";

export class SceneInfo {

    public mapId: number = 1;
    public zStart: number = 0; //TODO:
    public zEnd: number = 0; //TODO:
    private _terrainConfig: Array<any>;
    private _elementConfig: Array<ElementInfo>;

    private _mapTotalWidth: number = 0;
    private _atanAngle: number = 0;
    private _bgSound: number = 1;

    public get bgSound(): number {
        return this._bgSound;
    }

    public set bgSound(value: number) {
        this._bgSound = value;
    }

    public set atanAngle(value: number) {
        this._atanAngle = value;
    }

    public get atanAngle(): number {
        return this._atanAngle;
    }

    public get mapTotalWidth(): number {
        return this._mapTotalWidth;
    }

    private _mapTotalHeight: number = 0;

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


    public setTerrainInfo(value: op_client.ILayers[]): void {
        let i: number = 0;
        let len: number = value.length;
        this._terrainConfig = [];
        for (; i < len; i++) {
            this._terrainConfig.push(this.readMapGidTypes(value[i]));
        }
    }

    public setElementInfo(value: op_client.IElement[]): void {
        this._elementConfig = [];
        let elements = value;
        let i: number = 0;
        let len: number = elements.length;
        let element: ElementInfo;
        for (; i < len; i++) {
            element = new ElementInfo();
            element.setInfo(elements[i]);
            // element.setWalkableArea(elements[i].walkableArea, new Phaser.Point(1, 1));
            element.setCollisionArea(elements[i].collisionArea, new Phaser.Point(elements[i].originPoint[0], elements[i].originPoint[1]));
            this._elementConfig.push(element);
        }
    }

    /**
     * 读取地图网格数据
     * @param data
     */
    private readMapGidTypes(value: op_client.ILayers): TerrainInfo[] {
        let data: Array<any> = this.readTerrainData(value);

        let arr: TerrainInfo[] = [];

        let len: number = data.length;
        let len2: number = data[0].length;
        let rowIndex: number = 0;
        let colIndex: number = 0;
        let i: number = 0;
        let j: number = 0;
        let str: string;
        let terrain: TerrainInfo;
        for (; i < len; i++) {
            colIndex = i;
            for (j = 0; j < len2; j++) {
                rowIndex = j;
                str = data[i][j];
                terrain = new TerrainInfo();
                if (str !== "" && str !== "0") {
                    let arr = str.split("-");
                    terrain.type = +arr[0];
                    terrain.subIdx = +arr[1];
                    terrain.colorIdx = +arr[2];
                }
                terrain.row = rowIndex;
                terrain.col = colIndex;
                arr.push(terrain);
            }
        }
        return arr;
    }

    private readTerrainData(child: op_client.ILayers): Array<any> {
        let data: Array<any> = [];
        let _width: number = this._cols;
        let _height: number = this._rows;
        for (let i: number = 0; i < _width; i++) {
            data[i] = new Array();
            for (let j: number = 0; j < _height; j++) {
                data[i][j] = new Array();
            }
        }

        let arr = Globals.Tool.mapDecode(child.map, child.compression, child.encoding);

        let i: number = 0;
        let n: number = arr.length;
        for (; i < n; i++) {
            let colIndex: number = Math.floor(i % _width);
            let rowIndex: number = Math.floor(i / _width);
            data[colIndex][rowIndex] = arr[i];
        }
        return data;
    }
}