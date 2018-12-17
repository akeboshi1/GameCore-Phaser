import {IAnimatedObject} from "../../../base/IAnimatedObject";
import {Const} from "../../../common/const/Const";
import {TerrainSceneLayer} from "../view/TerrainSceneLayer";
import Globals from "../../../Globals";
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;
import {GameConfig} from "../../../GameConfig";
import {IDisposeObject} from "../../../base/IDisposeObject";

export class BasicTerrainItem extends Phaser.Group implements IAnimatedObject, IDisposeObject {
    public data: any;
    public isoX: number = 0;
    public isoY: number = 0;
    public isoZ: number = 0;
    public col: number  = 0;
    public itemWidth: number = 0;
    public itemHeight: number = 0;
    public camera: Phaser.Camera;
    protected mOwner: TerrainSceneLayer;
    protected mTerrainItemIsLoadInited: boolean = false;
    protected mTerrainItemIsLoading: boolean = false;
    protected mTerrainItemDisplayObjectCreated: boolean = false;
    protected mTerrainItemOutCameraTime: number = 0;
    protected mTerrainItemIsInCamera: boolean = false;
    protected terrainIsoDisplayObject: IsoSprite;

    public constructor(game: Phaser.Game, owner: TerrainSceneLayer) {
        super(game);
        this.mOwner = owner;
    }

    public onFrame(deltaTime: number) {
        let p2 = Globals.Room45Util.p3top2(this.isoX, this.isoY, this.isoZ)
        // this.game.world.x, this.game.world.y;
        // this.parent.y
        // this.parent.parent.y
        // let p = this.game.input.getLocalPosition(this.terrainIsoDisplayObject, this.game.input.activePointer);
        // let p = this.game.world.toLocal(p2, this);
        this.mTerrainItemIsInCamera = Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
            this.camera.width, this.camera.height, p2.x - this.itemWidth / 2, p2.y, this.itemWidth, this.itemHeight);
        if (this.mTerrainItemIsInCamera || GameConfig.isEditor) {
            this.mTerrainItemOutCameraTime = 0;

            if (!this.mTerrainItemDisplayObjectCreated) {
                this.onTerrainItemCreate();
                if (this.terrainIsoDisplayObject) {
                    this.terrainIsoDisplayObject.isoX = this.isoX;
                    this.terrainIsoDisplayObject.isoY = this.isoY;
                    this.terrainIsoDisplayObject.isoZ = this.isoZ;
                }
                this.mTerrainItemDisplayObjectCreated = true;
            }
            else {
                if (!this.mTerrainItemIsLoadInited) {
                    if (this.mOwner.isValidLoad()) {
                        this.onTerrainItemLoad();

                        this.mTerrainItemIsLoadInited = true;
                        this.mTerrainItemIsLoading = true;
                    }
                }
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

    public releaseTerrainItem() {
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
