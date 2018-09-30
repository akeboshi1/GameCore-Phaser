import BaseSingleton from '../../base/BaseSingleton';
import Point = Phaser.Point;

class Room45Util extends BaseSingleton {
    private _hTilewidth: number;
    private _hTileheight: number;
    private _originX: number;
    public rows: number;
    public cols: number;
    public tilewidth: number;
    public tileheight: number;
    private _mapTotalWidth: number = 0;
    private _mapTotalHeight: number = 0;

    public setting(rows: number, cols: number, tilewidth: number, tileheight: number): void {
        this.rows = rows;
        this.cols = cols;
        this.tilewidth = tilewidth;
        this.tileheight = tileheight;
        this._hTilewidth = this.tilewidth / 2;
        this._hTileheight = this.tileheight / 2;
        this._originX = this.rows * this._hTilewidth;
        this._mapTotalWidth = (this.rows + this.cols) * (this.tilewidth / 2);
        this._mapTotalHeight = (this.rows + this.cols) * (this.tileheight / 2);
    }

    public get originX(): number {
        return this._originX;
    }

    public get mapTotalWidth(): number {
        return this._mapTotalWidth;
    }

    public get mapTotalHeight(): number {
        return this._mapTotalHeight;
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
     * 像素坐标转化为水平格子坐标
     * @param x 水平像素坐标
     * @param y 垂直像素坐标
     * @version Egret 3.0.3
     */
    private pixelToTileX(x: number, y: number): number {
        let temp: number = (y / this.tileheight) + ((x - this._originX) / this.tilewidth);
        return temp;
    }


    /**
     * 像素坐标转化为垂直格子坐标
     * @param y 垂直像素坐标
     * @param x 水平像素坐标
     * @version Egret 3.0.3
     */
    private pixelToTileY(y: number, x: number): number {
        let temp = (y / this.tileheight) - ((x - this._originX) / this.tilewidth);
        return temp;
    }


    /**
     * 格子坐标转化为像素坐标
     * @param tileX 水平格子坐标
     * @param tileY 垂直格子坐标
     * @version Egret 3.0.3
     */
    public tileToPixelCoords(tileX: number, tileY: number): Point {
        let temp = new Point((tileX - tileY) * this._hTilewidth + this._originX, (tileX + tileY) * this._hTileheight)
        return temp;
    }
}