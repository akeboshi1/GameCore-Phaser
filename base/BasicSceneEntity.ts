import {ITickedObject} from "./ITickedObject";
import {IAnimatedObject} from "./IAnimatedObject";
import {Const} from "../const/Const";
import {SceneBasic} from "../scene/SceneBasic";
import Globals from "../Globals";
import {BasicAvatar} from "./BasicAvatar";
import {IEntityComponent} from "./IEntityComponent";
import Point = Phaser.Point;
import {Log} from "../Log";

export class BasicSceneEntity implements ITickedObject, IAnimatedObject {
    //basic
    public uid: string;//runtime id
    public elementTypeId: number = 0;
    public sceneLayerType: number = Const.SceneConst.SceneLayerMiddle;

    public isValidDisplay: boolean = false;
    // public screenX: number = 0;
    // public screenY: number = 0;

    public data: any;
    public display: any;
    public scene: SceneBasic;
    public camera: Phaser.Camera;
    private mInitilized: boolean = false;

    public constructor() {
    }

    private _isoX: number = 0;

    public get isoX(): number {
        return this._isoX;
    }

    public set isoX(value: number) {
        this._isoX = value;
    }

    private _isoY: number = 0;

    public get isoY(): number {
        return this._isoY;
    }

    public set isoY(value: number) {
        this._isoY = value;
    }

    private _isoZ: number = 0;

    public get isoZ(): number {
        return this._isoZ;
    }

    public set isoZ(value: number) {
        this._isoZ = value;
    }

    /**
     * 所占X格子的列数
     */
    protected _cols: number = 1;

    public get cols(): number {
        return this._cols;
    }

    /**
     * 所占Y格子的行数
     */
    protected _rows: number = 1;

    public get rows(): number {
        return this._rows;
    }

    public get initilized(): boolean {
        return this.mInitilized
    };

    public get key(): any {
        return this.uid;
    }

    //Position
    public setPosition(x: number, y: number, z:number = 0): void {
        this._isoX = x;
        this._isoY = y;
        this._isoZ = z;
    }

    public get gridPos(): Point {
        let temp = Globals.Room45Util.p3top2(this._isoX, this._isoY,this._isoZ);
        let point: Point = Globals.Room45Util.pixelToTileCoords(temp.x,temp.y);
        return point;
    }
    public isInScreen(): boolean {
        return true;//Globals.Tool.isOverlapCircleAndRectangle(this.screenX, this.screenY, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS, 0, 0, this.camera.width, this.camera.height );
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

    public dispose(): void {
        this.isValidDisplay = false;
        if (this.display) {
            if (this.display.hasOwnProperty("dispose")) this.display["dispose"]();
            this.display = null;
        }
    }

    public onTick(deltaTime: number): void {
        this.onPreUpdate(deltaTime);
        this.onUpdating(deltaTime);
        //may remove is the updating.
        if (this.scene) this.onUpdated(deltaTime);
    }

    public onFrame(deltaTime: number): void {
        if (this.isValidDisplay) {
            this.display.visible = true;

            this.onUpdatingDisplay(deltaTime);
        }
        else {
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
        var d: BasicAvatar = new BasicAvatar(Globals.game);
        return d;
    }

    protected onUpdateByData(): void {
    };

    protected onPreUpdate(deltaTime: number): void {
    };

    protected onUpdating(deltaTime: number): void {
    };

    protected onUpdated(deltaTime: number): void {

        this.checkIsValidDisplayAvatar();
        if ((this.display as IEntityComponent).onTick !== undefined) (<IEntityComponent>this.display).onTick(deltaTime);
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isInScreen();
    }

    protected onUpdatingDisplay(deltaTime: number): void {
        this.display.isoX = this.isoX;
        this.display.isoY = this.isoY;
        this.display.isoZ = this.isoZ;
       if ((this.display as IAnimatedObject).onFrame !== undefined) (<IAnimatedObject>this.display).onFrame(deltaTime);
    }
}
