import {ITickedObject} from "./ITickedObject";
import {IAnimatedObject} from "./IAnimatedObject";
import {Const} from "../const/Const";
import {SceneBasic} from "../scene/SceneBasic";
import {SceneCamera} from "../scene/SceneCamera";
import {Globals} from "../Globals";
import {BasicAvatar} from "./BasicAvatar";
import {IEntityComponent} from "./IEntityComponent";
import BasicDisplay from "../display/BasicDisplay";

export class BasicSceneEntity implements ITickedObject, IAnimatedObject {
    public static DEFAULT_VISIBLE_TEST_RADIUS: number = 150;
    //basic
    public uid: string;//runtime id
    public elementTypeId: number = -1;//see SceneElementType
    public sceneLayerType: number = Const.SceneConst.SceneLayerMiddle;
    public visibleTestRadius: number = BasicSceneEntity.DEFAULT_VISIBLE_TEST_RADIUS;

    public isValidDisplay: boolean = false;
    public layerIndex: number = 0;
    public zFighting: number = 0;
    public screenX: number = 0;
    public screenY: number = 0;
    public data: any;
    public display: any;
    public scene: SceneBasic;
    public camera: SceneCamera;
    public isNeedSort: boolean = true;
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

    public get needSort(): boolean {
        return this.isValidDisplay && this.isNeedSort;
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

    public isInScene(): boolean {
        return this.scene != null;
    }

    public isInScreen(): boolean {
        return Globals.Tool.isOverlapCircleAndRectangle(this.screenX, this.screenY, this.visibleTestRadius, 0, 0, this.camera.width, this.camera.height );
    }

    public initialize(): void {
        if (!this.mInitilized) {
            this.onInitialize();
            this.mInitilized = true;
            this.onInitializeCompleted();
        }
    }

    public loadDisplayComplete(): void {
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

    protected createDisplay(): BasicDisplay {
        var d: BasicAvatar = new BasicAvatar();
        return d;
    }

    protected onUpdateByData(): void {
    };

    protected onPreUpdate(deltaTime: number): void {
    };

    protected onUpdating(deltaTime: number): void {
    };

    protected onUpdated(deltaTime: number): void {
        this.screenX = this.x - this.camera.scrollX;
        this.screenY = this.y - this.camera.scrollY;

        this.checkIsValidDisplayAvatar();
        if ((this.display as IEntityComponent).onTick !== undefined) (<IEntityComponent>this.display).onTick(deltaTime);
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isInScreen();
    }

    protected onUpdatingDisplay(deltaTime: number): void {
        if (this.needSort) {
            this.display.x = this.screenX >> 0;
            this.display.y = this.screenY >> 0;
        }
       if ((this.display as IAnimatedObject).onFrame !== undefined) (<IAnimatedObject>this.display).onFrame(deltaTime);
    }
}
