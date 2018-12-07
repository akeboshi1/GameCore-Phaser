import {Room45Util} from "../manager/Room45Util";
import Globals from "../../Globals";
import {IDisposeObject} from "../../base/IDisposeObject";
import {ITickedObject} from "../../base/ITickedObject";

export class DrawArea implements ITickedObject, IDisposeObject {
    protected areaStr: string;
    protected _orgin: Phaser.Point;
    protected areaArr: number[][];
    protected _color: number = 0;
    private mPosDirty: boolean = false;

    constructor(value: string, color: number, orgin: Phaser.Point) {
        this.areaStr = value;
        this._color = color;
        this._orgin = orgin;
        this._room45 = new Room45Util();
        this._graphics = Globals.game.make.graphics();
        this.init();
    }

    private _oz: number = 0;

    public get oz(): number {
        return this._oz;
    }

    private _ox: number = 0;

    public get ox(): number {
        return this._ox;
    }

    private _oy: number = 0;

    public get oy(): number {
        return this._oy;
    }

    protected _cols: number = 0;

    public get cols(): number {
        return this._cols;
    }

    protected _rows: number = 0;

    public get rows(): number {
        return this._rows;
    }

    protected _room45: Room45Util;

    public get room45(): Room45Util {
        return this._room45;
    }

    protected _graphics: Phaser.Graphics;

    public get graphics(): Phaser.Graphics {
        return this._graphics;
    }

    public onTick(deltaTime: number): void {
        if (this.mPosDirty) {
            this.graphics.x = this.ox;
            this.graphics.y = this.oy;
            this.graphics.z = this.oz;
        }
        this.mPosDirty = false;
    }

    public setPosition(x: number, y: number, z: number): void {
        if (this.ox === x && this.oy === y && this.oz === z) return;
        this._ox = x - this.room45.originX - (this._orgin.x - this._orgin.y) * this.room45.hTilewidth;
        this._oy = y - (this._orgin.x + this._orgin.y) * this.room45.hTileheight;
        this._oz = z;
        this.mPosDirty = true;
    }

    public draw(hTileWidth: number, hTileHeight: number): void {
        if (this.areaArr === undefined || this.areaArr === null || this.areaArr.length === 0) return;

        this.room45.setting(this.rows, this.cols, hTileWidth, hTileHeight);
        this._graphics.clear();
        this._graphics.lineStyle(1);

        // this._graphics.x = -(this.room45.mapTotalWidth >> 1);
        // this._graphics.y = -(this.room45.mapTotalHeight >> 1);
        let p1: Phaser.Point;
        let p2: Phaser.Point;
        let p3: Phaser.Point;
        let p4: Phaser.Point;
        let poly: Phaser.Polygon;
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this._graphics.beginFill(this.areaArr[i][j] === 1 ? this._color : 0x00ff00, this.areaArr[i][j] === 1 ? 0.6 : 0.1);
                p1 = this._room45.tileToPixelCoords(i, j);
                p2 = this._room45.tileToPixelCoords(i + 1, j);
                p3 = this._room45.tileToPixelCoords(i + 1, j + 1);
                p4 = this._room45.tileToPixelCoords(i, j + 1);
                poly = new Phaser.Polygon([p1, p2, p3, p4]);
                this._graphics.drawPolygon(poly.points);
            }
        }
        this._graphics.endFill();
    }

    public onDispose() {
        this._graphics.destroy(true);
    }

    protected init(): void {
        if (this.areaStr === "" || this.areaStr === undefined || this.areaStr === null) return;

        let arr = this.areaStr.split("&");
        this._rows = arr.length;

        if (arr.length === 0) return;

        this._cols = arr[0].split(",").length;
        this.areaArr = new Array(this.rows);
        let tempStr: string;
        let tempArr: string[];
        for (let j = 0; j < arr.length; j++) {
            tempStr = arr[j];
            tempArr = tempStr.split(",");
            this.areaArr[j] = new Array(this.cols);
            for (let i = 0; i < tempArr.length; i++) {
                this.areaArr[j][i] = +tempArr[i];
            }
        }
    }
}