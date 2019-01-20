import {Scene45Util} from "../manager/Scene45Util";
import Globals from "../../Globals";
import {IDisposeObject} from "../../base/object/interfaces/IDisposeObject";
import {IAnimatedObject} from "../../base/IAnimatedObject";
import {GameConfig} from "../../GameConfig";

export class DrawArea implements IAnimatedObject, IDisposeObject {
  protected areaStr: string;
  protected _orgin: Phaser.Point;
  protected areaArr: number[][];
  protected _color = 0;
  private mPosDirty = false;
  private mCanShow = false;
  private mPosInit = false;

  constructor(value: string, color: number, orgin?: Phaser.Point) {
    this.areaStr = value;
    this._color = color;
    this._orgin = orgin || new Phaser.Point(0, 0);
    this._room45 = new Scene45Util();
    this.init();
  }

  private _oz = 0;

  public get oz(): number {
    return this._oz;
  }

  private _ox = 0;

  public get ox(): number {
    return this._ox;
  }

  private _oy = 0;

  public get oy(): number {
    return this._oy;
  }

  protected _cols = 0;

  public get cols(): number {
    return this._cols;
  }

  protected _rows = 0;

  public get rows(): number {
    return this._rows;
  }

  public get height(): number {
    return this._room45.mapTotalHeight;
  }

  public get width(): number {
    return this._room45.mapTotalWidth;
  }

  protected _room45: Scene45Util;

  public get room45(): Scene45Util {
    return this._room45;
  }

  /**protected _graphics: Phaser.Graphics;

  public get graphics(): Phaser.Graphics {
    if (this._graphics === undefined || this._graphics === null) this._graphics = Globals.game.make.graphics();
    return this._graphics;
  }**/

  public onFrame(): void {
    /**if (this.mPosDirty) {
      this.graphics.x = this.ox;
      this.graphics.y = this.oy;
      this.graphics.z = this.oz;
      this.graphics.visible = true;
      this.mPosDirty = false;
    }
    this.graphics.visible = this.mPosInit && this.mCanShow;**/
  }

  public setPosition(x: number, y: number, z: number): void {
    if (this.ox === x && this.oy === y && this.oz === z) return;
    this._ox = x - this.room45.originX - (this._orgin.x - this._orgin.y) * this.room45.hTileWidth;
    this._oy = y - (this._orgin.x + this._orgin.y) * this.room45.hTileHeight;
    this._oz = z;
    this.mPosDirty = true;
    if (this.mPosInit === false) {
      this.mPosInit = true;
    }
  }

  public draw(hTileWidth: number, hTileHeight: number): void {
    this.room45.setting(this.rows, this.cols, hTileWidth, hTileHeight);
    /**if (this.areaArr === undefined || this.areaArr === null || this.areaArr.length === 0) return;

    this.room45.setting(this.rows, this.cols, hTileWidth, hTileHeight);
    this.graphics.clear();

    if (!GameConfig.isEditor) {
      this.graphics.beginFill(0x444444, 0.4);
      this.graphics.drawEllipse(hTileWidth >> 1, hTileHeight >> 1, this.room45.mapTotalWidth / 2, this.room45.mapTotalHeight / 2);
    } else {
      this.graphics.lineStyle(1, this._color, 0.6);
      let p1: Phaser.Point;
      let p2: Phaser.Point;
      let p3: Phaser.Point;
      let p4: Phaser.Point;
      let poly: Phaser.Polygon;
      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          this.graphics.beginFill(this.areaArr[i][j] === 1 ? this._color : 0x00ff00, this.areaArr[i][j] === 1 ? 0.6 : 0.1);
          p1 = this._room45.tileToPixelCoords(i, j);
          p2 = this._room45.tileToPixelCoords(i + 1, j);
          p3 = this._room45.tileToPixelCoords(i + 1, j + 1);
          p4 = this._room45.tileToPixelCoords(i, j + 1);
          poly = new Phaser.Polygon([p1, p2, p3, p4]);
          this.graphics.drawPolygon(poly.points);
        }
      }
    }
    this.graphics.endFill();**/
  }

  public onClear(): void {
  }

  public onDispose() {
    // this.graphics.destroy(true);
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
    // this.graphics.visible = false;
  }

  public show(): void {
    this.mCanShow = true;
  }

  public hide(): void {
    this.mCanShow = false;
  }
}
