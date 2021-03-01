import { Handler, IProjection, LogicPos, projectionAngle, ValueResolver } from "utils";
import { DisplayField, IDragonbonesModel, IFramesModel, RunningAnimation } from "structure";
import { ISortObject } from "./sort.object";

export interface IBaseDisplay {
    displayInfo: IDragonbonesModel | IFramesModel | undefined;
    direction: number;
    x: number;
    y: number;
    z: number;

    load(data: IDragonbonesModel | IFramesModel, field?: DisplayField): Promise<any>;

    displayCreated();

    play(animation: RunningAnimation);

    changeAlpha(val: number);

    getPosition(): LogicPos;

    setRootMount(gameObject: Phaser.GameObjects.Container);

    fadeIn(callback?: () => void);

    fadeOut(callback?: () => void);

    getSprite(key: DisplayField);

    // phaser function
    destroy(fromScene?: boolean);

    setDepth(value: integer);

    setPosition(x?: number, y?: number, z?: number, w?: number);

    once(event: string | symbol, fn: Function, context?: any);

    setInteractive(shape?: Phaser.Types.Input.InputConfiguration | any, callback?: Phaser.Types.Input.HitAreaCallback, dropZone?: boolean);

    disableInteractive();
}

export abstract class BaseDisplay extends Phaser.GameObjects.Container implements IBaseDisplay, ISortObject {
    public createdHandler: Handler;
    protected mAlpha: number = 1;
    protected mDirection: number = 3;
    protected mDisplayInfo: IDragonbonesModel | IFramesModel | undefined;
    protected mAnimation: RunningAnimation;
    protected mRootMount: Phaser.GameObjects.Container;
    protected moveData: any;
    protected mCreated: boolean = false;
    protected mSprites: Map<DisplayField, Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | Phaser.GameObjects.Container> = new Map<DisplayField,
        Phaser.GameObjects.Sprite | Phaser.GameObjects.Image>();
    protected mLoadDisplayPromise: ValueResolver<any> = null;
    protected mProjectionSize: IProjection;
    protected mSortX: number = 0;
    protected mSortY: number = 0;

    public destroy(fromScene?: boolean) {
        this.mSprites.forEach((sprite) => sprite.destroy());
        this.mSprites.clear();

        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
        super.destroy(fromScene);
    }

    public load(data: IDragonbonesModel | IFramesModel): Promise<any> {
        this.displayInfo = data;
        if (!this.displayInfo) return Promise.reject("displayInfo error");
        this.mLoadDisplayPromise = new ValueResolver<any>();
        return this.mLoadDisplayPromise.promise(() => {
            this.scene.load.start();
        });
    }

    public displayCreated() {
        this.mCreated = true;
        if (this.createdHandler) {
            this.createdHandler.runWith(this.displayInfo);
        }
    }

    public get created() {
        return this.mCreated;
    }

    public set direction(dir: number) {
        this.mDirection = dir;
        if (this.mDisplayInfo) {
            this.mDisplayInfo.avatarDir = dir;
            this.play(this.mAnimation);
        }
    }

    public get direction(): number {
        return this.mDirection;
    }

    public get displayInfo() {
        return this.mDisplayInfo;
    }

    public set displayInfo(data: IDragonbonesModel | IFramesModel) {
        this.mDisplayInfo = data;
    }

    public play(animation: RunningAnimation) {
        this.mAnimation = animation;
    }

    public changeAlpha(val: number) {
        if (this.mAlpha === val) {
            return;
        }
        this.alpha = val;
        this.mAlpha = val;
    }

    public setDirection(dir: number) {
        if (dir === this.direction) return;
        // this.mDisplayInfo.avatarDir = dir;
        this.direction = dir;
        // Logger.getInstance().log("render display ===>", this.direction);
        this.play(this.mAnimation);
    }

    public setPosition(x?: number, y?: number, z?: number, w?: number) {
        super.setPosition(x, y, z, w);
        this.updateSort();
        return this;
    }

    public getPosition(): LogicPos {
        const pos = new LogicPos(this.x, this.y);
        if (this.mRootMount) {
            pos.x += this.mRootMount.x;
            pos.y += this.mRootMount.y;
        }
        return pos;
    }

    public setRootMount(gameObject: Phaser.GameObjects.Container) {
        this.mRootMount = gameObject;
    }

    public fadeIn(callback?: () => void) {
    }

    public fadeOut(callback?: () => void) {
    }

    public getSprite(key: DisplayField) {
        return this.mSprites.get(key);
    }

    protected updateSort() {
        const x = this.x - this.projectionSize.offset.x;
        const y = this.y - this.projectionSize.offset.y;
        this.mSortX = (x + 2 * y) / 30; // 转化为斜45度的格子
        this.mSortY = (2 * y - x) / 30;
    }

    get runningAnimation() {
        return this.mAnimation;
    }

    get rootMount() {
        return this.mRootMount;
    }

    get projectionSize(): IProjection {
        if (!this.mProjectionSize) {
            this.mProjectionSize = {offset: {x: 0, y: 0}, width: 0, height: 0};
        }
        return this.mProjectionSize;
    }

    get sortX() {
        return this.mSortX;
    }

    get sortY() {
        return this.mSortY;
    }

    get sortZ(): number {
        return this.z || 0;
    }
}
