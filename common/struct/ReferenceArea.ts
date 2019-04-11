import {Scene45Util} from "../manager/Scene45Util";
import Globals from "../../Globals";

export class ReferenceArea extends Phaser.Graphics {

  constructor(game: Phaser.Game, value: string, orgin?: Phaser.Point, color?: number, alpha?: number) {
    super(game);
    this.areaStr = value;
    this._color = color || -1;
    this._alpha = alpha || 0;
    this._orgin = orgin || new Phaser.Point(0, 0);
    this.init();
  }

  public static get room45(): Scene45Util {
    if ( this._room45 === undefined) {
      this._room45 = new Scene45Util();
    }
    return this._room45;
  }

  public static get poly(): Phaser.Polygon {
    if ( this._poly === undefined) {
      this._poly = new Phaser.Polygon();
    }
    return this._poly;
  }

  public get cols(): number {
    return this._cols;
  }

  public get rows(): number {
    return this._rows;
  }

  protected static _room45: Scene45Util;

  protected static _poly: Phaser.Polygon;
  protected areaStr: string;
  protected _orgin: Phaser.Point;
  protected areaArr: number[][];
  protected _color = 0;
  protected _alpha = 0;

  protected _cols = 0;

  protected _rows = 0;

  public onReset(value: string, orgin?: Phaser.Point, color?: number, alpha?: number): void {
    this.areaStr = value;
    this._color = color || -1;
    this._alpha = alpha || 0;
    this._orgin = orgin || new Phaser.Point(0, 0);
    this.areaArr.splice(0);

    if (this.cacheAsBitmap) {
      this.cacheAsBitmap = false;
    }
    this.init();
  }

  public onClear(): void {
    if (this.cacheAsBitmap) {
      this.cacheAsBitmap = false;
    }
    this.clear();
  }

  protected onDraw(hTileWidth: number, hTileHeight: number): void {
    if (this.areaArr === undefined || this.areaArr === null || this.areaArr.length === 0) return;

    ReferenceArea.room45.setting(this.rows, this.cols, hTileWidth, hTileHeight);

    this.lineStyle(1, this._color, 0.3);
    let p1: Phaser.Point;
    let p2: Phaser.Point;
    let p3: Phaser.Point;
    let p4: Phaser.Point;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        p1 = ReferenceArea.room45.tileToPixelCoords(x, y);
        p2 = ReferenceArea.room45.tileToPixelCoords(x + 1, y);
        p3 = ReferenceArea.room45.tileToPixelCoords(x + 1, y + 1);
        p4 = ReferenceArea.room45.tileToPixelCoords(x, y + 1);
        this.beginFill(this._color === -1 ? (this.areaArr[y][x] === 1 ?  0x00FF00 : 0xFF0000) : this._color, this._alpha === 0 ? 1 : this._alpha);
        ReferenceArea.poly.setTo([p1, p2, p3, p4]);
        this.drawPolygon(ReferenceArea.poly.points);
      }
    }

    this.endFill();

    // let ox =  -ReferenceArea.room45.originX - (this._orgin.x - this._orgin.y) * (hTileWidth >> 1);
    // let oy =  -(this._orgin.x + this._orgin.y) * (hTileHeight >> 1);

    // let ox =  -ReferenceArea.room45.originX
    // let oy =  0;
    //
    // this.x = ox;
    // this.y = oy;
  }

  public setPosition(x: number, y: number): void {
    this.x = x - ReferenceArea.room45.originX - (this._orgin.x - this._orgin.y) * ReferenceArea.room45.hTileWidth;
    this.y = y - (this._orgin.x + this._orgin.y) * ReferenceArea.room45.hTileHeight;
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

    this.clear();
    this.onDraw(Globals.Room45Util.hTileWidth, Globals.Room45Util.hTileHeight);

    if (!this.cacheAsBitmap) {
      this.cacheAsBitmap = true;
    }
  }
}
