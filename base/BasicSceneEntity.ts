import {ITickedObject} from "./ITickedObject";
import {IAnimatedObject} from "./IAnimatedObject";
import {Const} from "../common/const/Const";
import Globals from "../Globals";
import {BasicAvatar} from "./BasicAvatar";
import {IEntityComponent} from "./IEntityComponent";
import {SceneBasic} from "../modules/Scene/view/SceneBasic";
import {op_client} from "../../protocol/protocols";
import {IQuadTreeNode} from "./ds/IQuadTreeNode";
import {DrawArea} from "../common/struct/DrawArea";
import {IDisposeObject} from "./IDisposeObject";
import {GameConfig} from "../GameConfig";

export class BasicSceneEntity implements ITickedObject, IAnimatedObject, IQuadTreeNode, IDisposeObject {
    public uid: number;
    public elementTypeId = 0;
    public sceneLayerType: number = Const.SceneConst.SceneLayerMiddle;
    protected baseLoc: Phaser.Point;
    public isValidDisplay = false;

    public data: any;
    public display: any;
    public scene: SceneBasic;
    public camera: Phaser.Camera;
    public isNeedSort = true;

    public walkableArea: DrawArea;
    public collisionArea: DrawArea;

    private mInitilized = false;

    public constructor() {
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

    public get initilized(): boolean {
        return this.mInitilized;
    }

    public get key(): any {
        return this.uid;
    }

    public get quadH(): number {
        return this.collisionArea.height;
    }

    public get quadW(): number {
        return this.collisionArea.width;
    }

    public get quadX(): number {
        return this.collisionArea.ox;
    }

    public get quadY(): number {
        return this.collisionArea.oy;
    }

    public get needSort(): boolean {
        return this.isValidDisplay && this.isNeedSort;
    }

    public setWalkableArea(value: string, orgin: Phaser.Point, hWidth: number, hHeight: number): void {
        if (this.walkableArea === undefined) {
            this.walkableArea = new DrawArea(value, 0x00FF00, orgin);
        }
        this.walkableArea.draw(hWidth, hHeight);
    }

    public setCollisionArea(value: string, orgin: Phaser.Point, hWidth: number, hHeight: number): void {
        if (this.collisionArea === undefined) {
            this.collisionArea = new DrawArea(value, 0xFF0000, orgin);
        }
        this.collisionArea.draw(hWidth, hHeight);
    }

    public moveToTarget(value: op_client.IMoveData): void {
    }

    public moveStopTarget(value: op_client.IMovePosition): void {
    }

    // Position
    public positionDirty = false;
    public setPosition(x: number, y: number, z?: number): void {
        // Log.trace("[x,y,z]", x, y, z);
        this._ox = x >> 0;
        this._oy = y >> 0;
        this._oz = z || 0;
        if (this.collisionArea) {
            this.collisionArea.setPosition(x, y, z);
        }
        this.positionDirty = true;
    }

    public isInScreen(): boolean {
        // let p2 = Globals.Room45Util.p3top2(this._ox, this._oy, this._oz);
        return Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
            this.camera.width, this.camera.height, this._ox - Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS / 2 + GameConfig.GameWidth / 2, this._oy + GameConfig.GameHeight / 2, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS);
    }

    public initialize(): void {
        if (!this.mInitilized) {
            this.onInitialize();
            this.mInitilized = true;
            this.onInitializeCompleted();
        }
    }

    public updateByData(data: any = null): void {
        if (!this.mInitilized) return;

        this.data = data;

        this.onUpdateByData();
    }

    public onDispose(): void {
        this.isValidDisplay = false;
        if (this.display) {
            if ((this.display as IDisposeObject).onDispose() !== undefined) (<IDisposeObject>this.display).onDispose();
            this.display = null;
        }
    }

    public onTick(deltaTime: number): void {
        // Log.trace("更新-->", deltaTime);
        this.onPreUpdate(deltaTime);
        this.onUpdating(deltaTime);
        // may remove is the updating.
        if (this.scene) this.onUpdated(deltaTime);
    }

    public onFrame(deltaTime: number): void {
        // Log.trace("渲染-->", deltaTime);
        if (this.isValidDisplay) {
            this.display.visible = true;
            this.onUpdatingDisplay(deltaTime);
        } else {
            this.display.visible = false;
        }
    }

    protected onInitialize(): void {
        if (!this.display) this.display = this.createDisplay();

        this.display.visible = false;
        if (this.display instanceof BasicAvatar) (<BasicAvatar>this.display).initialize();
        if ((this.display as IEntityComponent).onTick !== undefined) (<IEntityComponent>this.display).owner = this;
    }

    protected onInitializeCompleted(): void {

    }

    protected createDisplay(): any {
        let d: BasicAvatar = new BasicAvatar(Globals.game);
        return d;
    }

    protected onUpdateByData(): void {
    }

    protected onPreUpdate(deltaTime: number): void {
    }

    protected onUpdating(deltaTime: number): void {
    }

    protected onUpdated(deltaTime: number): void {

        this.checkIsValidDisplayAvatar();
        if ((this.display as IEntityComponent).onTick !== undefined) (<IEntityComponent>this.display).onTick(deltaTime);
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isInScreen();
    }

    protected onUpdatingDisplay(deltaTime: number): void {
        let p3 = Globals.Room45Util.p2top3(this.ox + (this.baseLoc ? this.baseLoc.x : 0), this.oy + (this.baseLoc ? this.baseLoc.y : 0), this.oz);
        // let p3 = Globals.Room45Util.p2top3(this.ox, this.oy, this.oz);
        // Log.trace(p3.x,p3.y,p3.z);
        this.display.isoX = p3.x;
        this.display.isoY = p3.y;
        this.display.isoZ = p3.z;
        // Log.trace(this.display.isoX,this.display.isoY,this.display.isoZ);
        if ((this.display as IAnimatedObject).onFrame !== undefined) (<IAnimatedObject>this.display).onFrame(deltaTime);
    }
}
