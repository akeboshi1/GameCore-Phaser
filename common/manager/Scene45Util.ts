import BaseSingleton from "../../base/BaseSingleton";
import Globals from "../../Globals";
import Point = Phaser.Point;
import Point3 = Phaser.Plugin.Isometric.Point3;

export class Scene45Util extends BaseSingleton {

    public rows: number;
    public cols: number;
    public tileWidth: number;
    public tileHeight: number;
    private _projectionAngle: number = Math.PI / 6;
    private _transform;

    constructor() {
        super();
    }

  public getUid(col: number, row: number): string {
    return col + "&" + row;
  }

    // 这里返回的结果是，场景中层次高在数组的前面， 1表示在上层- 1表示在下层
    public sortFunc(a: any, b: any): number {
        if (a.sortY > b.sortY) {
            return 1;
        } else if (a.sortY < b.sortY) {
            return -1;
        } else {
            // 左边的排在下面
            if (a.sortX > b.sortX) {
                return 1;
            } else if (a.sortX < b.sortX) {
                return -1;
            }
        }
        return 0;
    }

    // 这里返回的结果是，场景中层次高在数组的前面， 1表示在上层- 1表示在下层
    public sortDataFunc(a: any, b: any): number {
        if (a.y > b.y) {
            return 1;
        } else if (a.y < b.y) {
            return -1;
        } else {
            // 左边的排在下面
            if (a.x > b.x) {
                return 1;
            } else if (a.x < b.x) {
                return -1;
            }
        }
        return 0;
    }

    private _hTileWidth: number;

    public get hTileWidth(): number {
        return this._hTileWidth;
    }

    private _hTileHeight: number;

    public get hTileHeight(): number {
        return this._hTileHeight;
    }

    private _originX: number;

    public get originX(): number {
        return this._originX;
    }

    private _mapTotalWidth = 0;

    public get mapTotalWidth(): number {
        return this._mapTotalWidth;
    }

    private _mapTotalHeight = 0;

    public get mapTotalHeight(): number {
        return this._mapTotalHeight;
    }

    public setting(rows: number, cols: number, tileWidth: number, tileHeight: number): void {
        this.rows = +rows;
        this.cols = +cols;
        this.tileWidth = +tileWidth;
        this.tileHeight = +tileHeight;
        this._hTileWidth = this.tileWidth / 2;
        this._hTileHeight = this.tileHeight / 2;
        this._originX = this.rows * this._hTileWidth;
        this._mapTotalWidth = (this.rows + this.cols) * (this.tileWidth / 2);
        this._mapTotalHeight = (this.rows + this.cols) * (this.tileHeight / 2);
        this._transform = [Math.cos(this._projectionAngle), Math.sin(this._projectionAngle)];
    }

    /**
     * 直角转斜角
     * @param x 水平像素坐标
     * @param y 垂直像素坐标
     * @version Egret 3.0.3
     */
    public p3top2(x: number, y: number, z: number): Point {
        let point: Point = Globals.game.iso.project(new Point3(x, y, z));
        return point;
    }

    /**
     * 斜角转直角
     * @param tileX 水平格子坐标
     * @param tileY 垂直格子坐标
     * @version Egret 3.0.3
     */
    public p2top3(x: number, y: number, z: number = 0): Point3 {
        let point3: Phaser.Plugin.Isometric.Point3 = Globals.game.iso.unproject(new Phaser.Point(x + Globals.game.world.x, y + Globals.game.world.y), undefined, z);
        return point3;
    }

    /**
     * 像素坐标转化为格子坐标
     * @param x 水平像素坐标
     * @param y 垂直像素坐标
     * @version Egret 3.0.3
     */
    public pixelToTileCoords(x: number, y: number): Point {
        let __x: number = Math.floor(this.pixelToTileX(x, y));
        let __y: number = Math.floor(this.pixelToTileY(y, x));
        return new Point(__x, __y);
    }

    /**
     * 格子坐标转化为像素坐标
     * @param tileX 水平格子坐标
     * @param tileY 垂直格子坐标
     * @version Egret 3.0.3
     */
    public tileToPixelCoords(tileX: number, tileY: number): Point {
        let temp = new Point((tileX - tileY) * this._hTileWidth + this._originX, (tileX + tileY) * this._hTileHeight);
        return temp;
    }

    /**
     * 像素坐标转化为水平格子坐标
     * @param x 水平像素坐标
     * @param y 垂直像素坐标
     * @version Egret 3.0.3
     */
    private pixelToTileX(x: number, y: number): number {
        let temp: number = (y / this.tileHeight) + ((x - this._originX) / this.tileWidth);
        return temp;
    }

    /**
     * 像素坐标转化为垂直格子坐标
     * @param y 垂直像素坐标
     * @param x 水平像素坐标
     * @version Egret 3.0.3
     */
    private pixelToTileY(y: number, x: number): number {
        let temp = (y / this.tileHeight) - ((x - this._originX) / this.tileWidth);
        return temp;
    }
}
