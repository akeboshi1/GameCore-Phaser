import { IFramesModel, FramesModel } from "../../rooms/display/frames.model";
import { op_client, op_gameconfig } from "pixelpai_proto";

export class MapInfo {
    public mapId = 1;
    public zStart = 0; // TODO:
    public zEnd = 0; // TODO:
    private _terrainConfig: IFramesModel[];
    private _elementConfig: IFramesModel[];

    private _mapTotalWidth = 0;
    private _bgSound = 1;
    private _voiceChatRoomId = 0;
    private _mapTotalHeight = 0;
    private _tileWidth: number;
    private _tileHeight: number;
    private _cols: number;
    private _rows: number;

    public get bgSound(): number {
        return this._bgSound;
    }

    public set bgSound(value: number) {
        this._bgSound = value;
    }

    public get mapTotalWidth(): number {
        return this._mapTotalWidth;
    }

    public get mapTotalHeight(): number {
        return this._mapTotalHeight;
    }

    /**
     * 获取格子宽（单位：像素）
     */
    public get tileWidth() {
        return this._tileWidth;
    }

    /**
     * 获取格子高（单位：像素）
     */
    public get tileHeight() {
        return this._tileHeight;
    }

    public get terrainConfig(): any[] {
        return this._terrainConfig;
    }

    public get elementConfig(): IFramesModel[] {
        return this._elementConfig;
    }

    public get cols(): number {
        return this._cols;
    }

    public set cols(value: number) {
        this._cols = value;
    }

    public get rows(): number {
        return this._rows;
    }

    public set rows(value: number) {
        this._rows = value;
    }

    public get voiceChatRoomId(): number {
        return this._voiceChatRoomId;
    }

    public set voiceChatRoomId(value: number) {
        this._voiceChatRoomId = value;
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
        const len: number = value.length;
        let terrain: FramesModel;
        for (let i = 0; i < len; i++) {
            terrain = new FramesModel(value[i]);
            this._terrainConfig.push(terrain);
        }
    }

    public addTerrainInfo(value: op_client.ITerrain[]): void {
        const len: number = value.length;
        let terrain: IFramesModel;
        for (let i = 0; i < len; i++) {
            terrain = new FramesModel(value[i]);
            this._terrainConfig.push(terrain);
        }
    }

    public setElementInfo(value: op_client.IElement[]): void {
        this._elementConfig = [];
        const len: number = value.length;
        let element: IFramesModel;
        for (let i = 0; i < len; i++) {
            element = new FramesModel(value[i]);
            this._elementConfig.push(element);
        }
    }

    public addElementInfo(value: op_client.IElement[]): void {
        const len: number = value.length;
        let element: IFramesModel;
        for (let i = 0; i < len; i++) {
            element = new FramesModel(value[i]);
            this._elementConfig.push(element);
        }
    }

    public addPackItems(elementId: number, items: op_gameconfig.IItem[]): void {
        const element = this.getElementInfo(elementId);
        if (element) {
            if (!element.package) {
                element.package = op_gameconfig.Package.create();
            }
            element.package.items = element.package.items.concat(items);
        }
    }

    public removePackItems(elementId: number, itemId: number): boolean {
        const element = this.getElementInfo(elementId);
        if (element) {
            const len = element.package.items.length;
            for (let i = 0; i < len; i++) {
                if (itemId === element.package.items[i].id) {
                    element.package.items.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    public getElementInfo(value: number): IFramesModel {
        const len = this._elementConfig.length;
        for (let i = 0; i < len; i++) {
            if (this._elementConfig[i].id === value) {
                return this._elementConfig[i];
            }
        }
        return null;
    }
}
