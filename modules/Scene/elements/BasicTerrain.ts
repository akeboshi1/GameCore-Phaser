import {BasicElementAvatar} from "../../../common/avatar/BasicElementAvatar";
import Globals from "../../../Globals";
import {op_gameconfig} from "pixelpai_proto";
import SceneEntity from "../view/SceneEntity";
import {TerrainInfo} from "../../../common/struct/TerrainInfo";
import {IObjectPool} from "../../../base/pool/interfaces/IObjectPool";
import {Const} from "../../../common/const/Const";
import GameConst = Const.GameConst;

export class BasicTerrain extends SceneEntity {
    public display: BasicElementAvatar;
    protected mAnimationDirty = false;
    protected mScaleX = 1;
    protected myAnimationName: string;
    private dBitmapData: Phaser.BitmapData;
    private dPoint: Phaser.Point;

    public constructor() {
        super();
    }

    public get terrainInfo(): TerrainInfo {
        return this.data;
    }

    public setAnimation(value: string): void {
        // Log.trace("角度-->"+value);
        this.myAnimationName = value;
        if (this.display) {
            this.display.animationName = value;
        }

        this.invalidAnimation();
    }

    public loadModel(value: TerrainInfo) {
        if (this.display) {
            this.display.loadModel(value);
        }
    }

    public getRect(): Phaser.Rectangle {
        if (this._rect === undefined) {
            this._rect = new Phaser.Rectangle();
        }
        let _ox = this.ox + (this.baseLoc ? this.baseLoc.x : 0);
        let _oy = this.oy + (this.baseLoc ? this.baseLoc.y : 0);
        this._rect.setTo(_ox, _oy, GameConst.MAP_TILE_WIDTH, GameConst.MAP_TILE_HEIGHT + GameConst.MAP_TILE_DEPTH);
        return this._rect;
    }

    public getScreenRect(): Phaser.Rectangle {
        if (this.s_rect === undefined) {
            this.s_rect = new Phaser.Rectangle();
        }
        let _ox = this.ox + (this.baseLoc ? this.baseLoc.x : 0) - Globals.Scene45Util.tileWidth;
        let _oy = this.oy + (this.baseLoc ? this.baseLoc.y : 0) - Globals.Scene45Util.tileHeight;
        this.s_rect.setTo(_ox, _oy, Globals.Scene45Util.tileWidth * 3, Globals.Scene45Util.tileHeight * 3);
        return this.s_rect;
    }

    public isInScreen(): boolean {
        let _ox = this.ox + (this.baseLoc ? this.baseLoc.x : 0) - Globals.Scene45Util.tileWidth;
        let _oy = this.oy + (this.baseLoc ? this.baseLoc.y : 0) - Globals.Scene45Util.tileHeight;
        return Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
            this.camera.width, this.camera.height, _ox, _oy, Globals.Scene45Util.tileWidth * 3, Globals.Scene45Util.tileHeight * 3);
    }

    public setPosition(x: number, y: number, z?: number): void {
        let p2: Phaser.Point = Globals.Scene45Util.tileToPixelCoords(x, y);
        super.setPosition(p2.x, p2.y, z);
    }

    public drawBit(value: Phaser.BitmapData, offset: Phaser.Point): void {
        this.dBitmapData = value;
        this.dPoint = offset;
        if (this.display.Loader.modelLoaded) {
            this.onDraw();
            this.drawDirty = false;
        } else {
            this.drawDirty = true;
        }
    }

    public initPosition(): void {
        this.initBaseLoc();
        this.setPosition(this.terrainInfo.x, this.terrainInfo.y, this.terrainInfo.z);
    }

    protected invalidAnimation(): void {
        this.mAnimationDirty = true;
    }

    protected createDisplay() {
        let terrain = new BasicElementAvatar(Globals.game);
        return terrain;
    }

    protected onUpdating(deltaTime: number): void {
        if (this.mAnimationDirty) {
            this.onAvatarAnimationChanged();
            this.mAnimationDirty = false;
        }
        super.onUpdating(deltaTime);
    }

    protected onDisplayLoadCompleted(): void {
        if (this.drawDirty) {
            this.onDraw();
            this.drawDirty = false;
        }
    }

    protected onInitialize() {
        super.onInitialize();
        this.initBaseLoc();
        this.setPosition(this.terrainInfo.x, this.terrainInfo.y, this.terrainInfo.z);
        this.setAnimation(this.terrainInfo.animationName);
        this.loadModel(this.terrainInfo);
    }

    protected onAvatarAnimationChanged(): void {
        (<BasicElementAvatar>this.display).animationName = this.myAnimationName;
        (<BasicElementAvatar>this.display).scaleX = this.mScaleX;
    }

    protected initBaseLoc(): void {
        // 图片坐标
        let config: op_gameconfig.IAnimation = this.terrainInfo.config;
        if (config == null) return;
        let tmp: Array<string> = config.baseLoc.split(",");
        if (this.baseLoc === undefined) {
            this.baseLoc = new Phaser.Point(+(tmp[0]), +(tmp[1]));
        } else {
            this.baseLoc.set(+(tmp[0]), +(tmp[1]));
        }
    }

    private onDraw(): void {
        let loader = this.display.Loader;
        this.dBitmapData.draw(loader, this.dPoint.x, this.dPoint.y);
    }
}
