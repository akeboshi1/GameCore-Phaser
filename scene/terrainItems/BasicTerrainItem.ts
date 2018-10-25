import {IAnimatedObject} from "../../base/IAnimatedObject";
import {Const} from "../../const/Const";
import {TerrainSceneLayer} from "../TerrainSceneLayer";
import Globals from "../../Globals";
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;

export class BasicTerrainItem extends Phaser.Group implements IAnimatedObject {
    public data: any;
    public isoX: number = 0;
    public isoY: number = 0;
    public isoZ: number = 0;
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

    public constructor(game: Phaser.Game,owner: TerrainSceneLayer) {
        super(game);
        this.mOwner = owner;
    }

    public onFrame(deltaTime: number) {
        // this.mTerrainItemIsInCamera = Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
        // this.camera.width, this.camera.height, this.isoX, this.isoY, this.itemWidth, this.itemHeight)
        this.mTerrainItemIsInCamera = true;
        if (this.mTerrainItemIsInCamera) {
            this.mTerrainItemOutCameraTime = 0;

            if (!this.mTerrainItemDisplayObjectCreated) {
                this.onTerrainItemCreate();
                if (this.terrainIsoDisplayObject) {
                    this.terrainIsoDisplayObject.isoX = this.isoX;
                    this.terrainIsoDisplayObject.isoY = this.isoY;
                    this.terrainIsoDisplayObject.isoZ = this.isoZ;
                }
                this.visible = true;
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

        }
        else {
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

    public dispose() {
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