import {IAnimatedObject} from "../../../base/IAnimatedObject";
import {Const} from "../../../common/const/Const";
import Globals from "../../../Globals";
import {GameConfig} from "../../../GameConfig";
import {IDisposeObject} from "../../../base/IDisposeObject";
import {ITickedObject} from "../../../base/ITickedObject";
import {DrawArea} from "../../../common/struct/DrawArea";
import {ITerrainLayer} from "../view/ITerrainLayer";
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;

export class BasicTerrainItem extends Phaser.Group implements IAnimatedObject, IDisposeObject, ITickedObject {
    public data: any;
    public itemWidth = 0;
    public itemHeight = 0;
    public camera: Phaser.Camera;
    public walkableArea: DrawArea;
    public collisionArea: DrawArea;
    protected mOwner: ITerrainLayer;
    protected mTerrainItemIsLoadInited = false;
    protected mTerrainItemIsLoading = false;
    protected mTerrainItemDisplayObjectCreated = false;
    protected mTerrainItemOutCameraTime = 0;
    protected mTerrainItemIsInCamera = false;
    protected terrainIsoDisplayObject: IsoSprite;
    protected baseLoc: Phaser.Point;
    protected mTerrainItemDisplayObjectHadCreated = false;
    public mouseOverArea: DrawArea;

    public constructor(game: Phaser.Game, owner: ITerrainLayer) {
        super(game);
        this.mOwner = owner;
    }

    protected _ox = 0;

    public get ox(): number {
        return this._ox;
    }

    protected _oy = 0;

    public get oy(): number {
        return this._oy;
    }

    private _oz = 0;

    public get oz(): number {
        return this._oz;
    }

  public setMouseOverArea(hWidth: number, hHeight: number): void {
    if (this.mouseOverArea === undefined) {
      this.mouseOverArea = new DrawArea("1,1&1,1", 0xFF0000);
      this.mouseOverArea.draw(hWidth, hHeight);
    }
  }

  public triggerMouseOver(value: boolean): void {
    if (value === true) {
      this.mouseOverArea.show();
    } else {
      this.mouseOverArea.hide();
    }
  }

    public get key(): string {
        return this.data.col + "|" + this.data.row;
    }

    public get hadCreated(): boolean {
        if (this.mTerrainItemDisplayObjectCreated && this.mTerrainItemDisplayObjectHadCreated === false) {
            this.mTerrainItemDisplayObjectHadCreated = true;
            return true;
        }
        return false;
    }

    public get display(): any {
        return this.terrainIsoDisplayObject;
    }

    // Position
    public setPosition(x: number, y: number, z: number): void {
        this._ox = x >> 0;
        this._oy = y >> 0;
        this._oz = z >> 0;
    }

    public onFrame(deltaTime: number) {
        this.mTerrainItemIsInCamera = Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
            this.camera.width, this.camera.height, this.ox - this.itemWidth / 2, this.oy, this.itemWidth, this.itemHeight);
        if (this.mTerrainItemIsInCamera || GameConfig.isEditor) {
            this.mTerrainItemOutCameraTime = 0;

            if (!this.mTerrainItemDisplayObjectCreated) {
                this.onTerrainItemCreate();
                this.mTerrainItemDisplayObjectCreated = true;
            } else {
                if (!this.mTerrainItemIsLoadInited) {
                    if (this.mOwner.isValidLoad()) {
                        this.onTerrainItemLoad();

                        this.mTerrainItemIsLoadInited = true;
                        this.mTerrainItemIsLoading = true;
                    }
                }
            }
            let p3 = Globals.Room45Util.p2top3(this.ox + (this.baseLoc ? this.baseLoc.x : 0), this.oy + (this.baseLoc ? this.baseLoc.y : 0), this.oz);
            if (this.terrainIsoDisplayObject) {
                this.terrainIsoDisplayObject.isoX = p3.x;
                this.terrainIsoDisplayObject.isoY = p3.y;
                this.terrainIsoDisplayObject.isoZ = p3.z;
            }
            this.visible = true;
        } else {
            this.mTerrainItemOutCameraTime += deltaTime;
            if (this.mTerrainItemOutCameraTime > Const.GameConst.OUT_OF_CAMERA_RELEASE_WAITE_TIME) {
                this.mTerrainItemOutCameraTime = 0;

                this.releaseTerrainItem();

                this.mTerrainItemDisplayObjectCreated = false;
                this.mTerrainItemIsLoading = false;
            }

            this.visible = false;
        }
    }

    public onTick(deltaTime: number): void {
    }

    protected releaseTerrainItem() {
        if (this.mTerrainItemDisplayObjectCreated) {
            this.mTerrainItemDisplayObjectCreated = false;

            this.remove(this.terrainIsoDisplayObject);
            this.terrainIsoDisplayObject = null;

            if (this.mTerrainItemIsLoading) {
                this.mTerrainItemIsLoading = false;
                this.mOwner.decreaseLoadCount();
            }

            this.mTerrainItemIsLoadInited = false;
            this.mTerrainItemOutCameraTime = 0;

            this.visible = false;
        }
    }

    public onClear(): void {
    }

    public onDispose() {
        this.releaseTerrainItem();
    }

    protected onTerrainItemCreate() {
        this.add(this.terrainIsoDisplayObject);
    }

    protected onTerrainItemLoad() {
        this.mOwner.increaseLoadCount();
    }

    protected onTerrainItemLoadComplete() {
        this.mOwner.decreaseLoadCount();
        this.mTerrainItemIsLoading = false;
    }
}
