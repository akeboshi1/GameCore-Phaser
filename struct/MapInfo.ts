import {TerrainInfo} from './TerrainInfo';
import {ElementInfo} from './ElementInfo';
import Globals from "../Globals";

export class MapInfo {
    public mapId: number = 1;
    private _tmx: any;
    private _mapConfig: Array<any>;

    private _mapTotalWidth: number = 0;

    public get mapTotalWidth(): number {
        return this._mapTotalWidth;
    }

    private _mapTotalHeight: number = 0;

    public get mapTotalHeight(): number {
        return this._mapTotalHeight;
    }

    private _tilewidth: number;

    /**
     * 获取格子宽（单位：像素）
     */
    public get tilewidth() {
        return this._tilewidth;
    }

    private _tileheight: number;

    /**
     * 获取格子高（单位：像素）
     */
    public get tileheight() {
        return this._tileheight;
    }

    private _elementData: Array<ElementInfo>;

    public get elementData(): Array<ElementInfo> {
        return this._elementData;
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

    private _terrainInfo: Array<TerrainInfo>;

    public get terrainInfo(): Array<TerrainInfo> {
        return this._terrainInfo;
    }

    private _elementInfo: Array<ElementInfo>;

    public get elementInfo(): Array<ElementInfo> {
        return this._elementInfo;
    }

    public setTmx(value: any): void {
        this._tmx = value;
        this._cols = +this._tmx.width;// 水平方向格子数量
        this._rows = +this._tmx.height;// 垂直方向格子数量
        this._tilewidth = +this._tmx.tileWidth;
        this._tileheight = +this._tmx.tileHeight;
        this._mapTotalWidth = (this._rows + this._cols) * (this._tilewidth / 2);
        this._mapTotalHeight = (this._rows + this._cols) * (this._tileheight / 2);
        this.readMapGidTypes();
    }

    /**
     * 读取地图网格数据
     * @param data
     */
    private readMapGidTypes(): void {
        this.mapConversion();
        this.elementConversion();
    }

    private mapConversion(): void {
        let layers: any = this._tmx.layers;
        this._mapConfig = [];
        this.readData(layers, this._mapConfig);

        this._terrainInfo = [];
        let data = this._mapConfig;
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
                if (str !== "0") {
                    let arr = str.split("-");
                    terrain.type = +arr[0];
                    terrain.subIdx = +arr[1];
                    terrain.colorIdx = +arr[2];
                }
                terrain.row = rowIndex;
                terrain.col = colIndex;
                this._terrainInfo.push(terrain);
            }
        }
    }

    private readData(child: any, data: Array<any>): void {
        let _width: number = this._cols;
        let _height: number = this._rows;
        for (let i: number = 0; i < _width; i++) {
            data[i] = new Array();
            for (let j: number = 0; j < _height; j++) {
                data[i][j] = new Array();
            }
        }

        let arr = Globals.Tool.mapDecode(child.map);

        let i: number = 0;
        let n: number = arr.length;
        for (; i < n; i++) {
            var colIndex: number = Math.floor(i % _width);
            var rowIndex: number = Math.floor(i / _width);
            data[colIndex][rowIndex] = arr[i];
        }
    }

    private elementConversion(): void {
        this._elementData = [];
        let elements = this._tmx.elements;
        let i: number = 0;
        let len: number = elements.length;
        let element: ElementInfo;
        for (; i < len; i++) {
            element = new ElementInfo(elements[i]);
            this._elementData.push(element);
        }
    }
}