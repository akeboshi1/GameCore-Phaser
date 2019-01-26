import {Const} from "../../../common/const/Const";
import {BasicElementAvatar} from "../../../common/avatar/BasicElementAvatar";
import Globals from "../../../Globals";
import {op_gameconfig} from "../../../../protocol/protocols";
import SceneEntity from "../view/SceneEntity";
import {TerrainInfo} from "../../../common/struct/TerrainInfo";
import {IObjectPool} from "../../../base/pool/interfaces/IObjectPool";
import {GameConfig} from "../../../GameConfig";

export class BasicTerrain  extends SceneEntity {

    protected mAnimationDirty = false;
    protected mScaleX = 1;
    protected myAnimationName: string;

    public constructor() {
        super();
        this.sceneLayerType = Const.SceneConst.SceneLayerTerrain;
    }

    public get terrainInfo(): TerrainInfo {
        return this.data;
    }

    public setAnimation(value: string): void {
        // Log.trace("角度-->"+value);
        this.myAnimationName = value;

        this.invalidAnimation();
    }

    public loadModel(value: TerrainInfo) {
        this.display.loadModel(value);
    }

    protected invalidAnimation(): void {
        this.mAnimationDirty = true;
    }

    protected get displayPool(): IObjectPool {
        let op = Globals.ObjectPoolManager.getObjectPool("BasicElementAvatar");
        return op;
    }

    protected createDisplay() {
        let terrain = this.displayPool.alloc() as BasicElementAvatar;
        if (null == terrain) {
            terrain = new BasicElementAvatar(Globals.game);
        }
        return terrain;
    }

    protected onUpdating(deltaTime: number): void {
        if (this.mAnimationDirty) {
            this.onAvatarAnimationChanged();
            this.mAnimationDirty = false;
        }

        super.onUpdating(deltaTime);
    }

    public isInScreen(): boolean {
        let _ox = this.ox + (this.baseLoc ? this.baseLoc.x : 0) - Globals.Room45Util.tileWidth;
        let _oy = this.oy + (this.baseLoc ? this.baseLoc.y : 0) - Globals.Room45Util.tileHeight;
        return Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
            this.camera.width, this.camera.height, _ox, _oy, Globals.Room45Util.tileWidth * 3, Globals.Room45Util.tileHeight * 3);
    }

    protected onInitialize() {
        super.onInitialize();
        this.initBaseLoc();
        // this.setPosition(this.terrainInfo.x, this.terrainInfo.y, this.terrainInfo.z, true);
        this.loadModel(this.terrainInfo);
        this.setAnimation(this.terrainInfo.animationName);
    }

    public setPosition(x: number, y: number, z?: number, silent: boolean = false): void {
        let p2: Phaser.Point = Globals.Room45Util.tileToPixelCoords(x, y);
        super.setPosition(p2.x, p2.y, z, silent);
    }

    protected onAvatarAnimationChanged(): void {
        (<BasicElementAvatar>this.display).animationName = this.myAnimationName;
        (<BasicElementAvatar>this.display).scaleX = this.mScaleX;
    }

    protected initBaseLoc(): void {
        // 图片坐标
        let config: op_gameconfig.IAnimation = this.terrainInfo.config;
        if (config === null) return;
        let tmp: Array<string> = config.baseLoc.split(",");
        this.baseLoc = new Phaser.Point(+(tmp[0]), +(tmp[1]));
    }
}
