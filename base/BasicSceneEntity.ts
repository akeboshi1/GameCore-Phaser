import {ITickedObject} from "./ITickedObject";
import {IAnimatedObject} from "./IAnimatedObject";
import {Const} from "../const/Const";
import {SceneBasic} from "../scene/SceneBasic";
import Globals from "../Globals";
import {BasicAvatar} from "./BasicAvatar";
import {IEntityComponent} from "./IEntityComponent";

export class BasicSceneEntity implements ITickedObject, IAnimatedObject {
    //basic
    public uid: string;//runtime id
    public elementTypeId: number = -1;//see SceneElementType
    public sceneLayerType: number = Const.SceneConst.SceneLayerMiddle;

    public isValidDisplay: boolean = false;
    public zFighting: number = 0;
    public screenX: number = 0;
    public screenY: number = 0;
    public data: any;
    public display: any;
    public scene: SceneBasic;
    public camera: Phaser.Camera;
    private mInitilized: boolean = false;

    public constructor() {
    }

    private _x: number = 0;

    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        this._x = value;
    }

    private _y: number = 0;

    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        this._y = value;
    }

    private _z: number = 0;

    public get z(): number {
        return this._z;
    }

    public set z(value: number) {
        this._z = value;
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
    public setPosition(x: number, y: number): void {
        this._x = x;
        this._y = y;
    }

    public getGridPositionColIndex(): number {
        return Globals.Room45Util.pixelToTileCoords(this._x, this._y).x;
    }

    public getGridPositionRowIndex(): number {
        return Globals.Room45Util.pixelToTileCoords(this._x, this._y).y;
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
        // this.screenX = this.x - this.camera.x;
        // this.screenY = this.y - this.camera.y;

        this.checkIsValidDisplayAvatar();
        if ((this.display as IEntityComponent).onTick !== undefined) (<IEntityComponent>this.display).onTick(deltaTime);
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isInScreen();
    }

    protected onUpdatingDisplay(deltaTime: number): void {
        // this.display.x = this.screenX >> 0;
        // this.display.y = this.screenY >> 0;
        if (this.display instanceof Phaser.Plugin.Isometric.IsoSprite) {
            let point3 = this.display.isoPosition;
            point3.setTo(this.x, this.y, this.z);
        }
       if ((this.display as IAnimatedObject).onFrame !== undefined) (<IAnimatedObject>this.display).onFrame(deltaTime);
    }
}
