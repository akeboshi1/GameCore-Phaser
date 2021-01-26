import { Handler, LogicPos, ValueResolver } from "utils";
import { DisplayField, IDragonbonesModel, IFramesModel, RunningAnimation } from "structure";

export interface IBaseDisplay {
    displayInfo: IDragonbonesModel | IFramesModel | undefined;
    direction: number;
    sortX: number;
    sortY: number;
    sortZ: number;
    x: number;
    y: number;
    z: number;

    load(data: IDragonbonesModel | IFramesModel, field?: DisplayField): Promise<any>;

    created();

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

export abstract class BaseDisplay extends Phaser.GameObjects.Container implements IBaseDisplay {
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

    public created() {
        this.mCreated = true;
        if (this.createdHandler) {
            this.createdHandler.runWith(this.displayInfo);
        }
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

    get sortX(): number {
        return this.x;
    }

    get sortY(): number {
        return this.y;
    }

    get sortZ(): number {
        return this.z || 0;
    }
}
