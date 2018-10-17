import {IAnimatedObject} from "../../base/IAnimatedObject";
import {Const} from "../../const/Const";
import {TerrainSceneLayer} from "../TerrainSceneLayer";
import Globals from "../../Globals";

export class BasicTerrainItem extends Phaser.Group implements IAnimatedObject {
    public data: any;
    public itemX: number = 0;
    public itemY: number = 0;
    public itemWidth: number = 0;
    public itemHeight: number = 0;
    public camera: Phaser.Camera;
    protected mOwner: TerrainSceneLayer;
    protected terrainItemDisplayObject: Phaser.Sprite;
    protected mTerrainItemIsLoadInited: boolean = false;
    protected mTerrainItemIsLoading: boolean = false;
    protected mTerrainItemDisplayObjectCreated: boolean = false;
    protected mTerrainItemOutCameraTime: number = 0;
    protected mTerrainItemIsInCamera: boolean = false

    public constructor(game: Phaser.Game,owner: TerrainSceneLayer) {
        super(game);
        this.mOwner = owner;
    }

    public onFrame(deltaTime: number): void {

            this.mTerrainItemIsInCamera = Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
            this.camera.width, this.camera.height, this.itemX, this.itemY, this.itemWidth, this.itemHeight)
        this.mTerrainItemIsInCamera = true;
        if (this.mTerrainItemIsInCamera) {
            this.mTerrainItemOutCameraTime = 0;

            if (!this.mTerrainItemDisplayObjectCreated) {
                this.onTerrainItemCreate();

                this.x = this.itemX;
                this.y = this.itemY;

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

    public releaseTerrainItem(): void {
        if (this.mTerrainItemDisplayObjectCreated) {
            this.mTerrainItemDisplayObjectCreated = false;

            this.removeChild(this.terrainItemDisplayObject);
            this.terrainItemDisplayObject = null;

            if (this.mTerrainItemIsLoading) {
                this.mTerrainItemIsLoading = false;
                this.mOwner.decreaseLoadCount();
            }

            this.mTerrainItemIsLoadInited = false;
            this.mTerrainItemOutCameraTime = 0;

            this.visible = false;
        }
    }

    public dispose(): void {
        this.releaseTerrainItem();
    }

    protected onTerrainItemCreate(): void {
        this.add(this.terrainItemDisplayObject);
    }

    protected onTerrainItemLoad(): void {
        this.mOwner.increaseLoadCount();
    }

    protected onTerrainItemLoadComplete(): void {
        this.mOwner.decreaseLoadCount();
        this.mTerrainItemIsLoading = false;
    }
}