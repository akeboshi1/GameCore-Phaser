import {IAnimatedObject} from "./IAnimatedObject";
import {IEntityComponent} from "./IEntityComponent";
import {IDisposeObject} from "./object/interfaces/IDisposeObject";

export class BasicAvatar extends Phaser.Plugin.Isometric.IsoSprite implements IAnimatedObject, IEntityComponent, IDisposeObject {

    protected myData: any = null;
    protected mInitilized = false;
    protected mLoaderAvatar: any;
    private _owner: any;

    public constructor(game: Phaser.Game) {
        super(game, 0, 0, 0);
    }

    public get initilized(): boolean {
        return this.mInitilized;
    }

    public getOwner(): any {
        return this._owner;
    }

    public setOwner(value: any) {
        this._owner = value;
    }

    public initialize(value: any = null): void {
        if (!this.initilized) {
            this.myData = value;
            this.onInitialize();
            this.mInitilized = true;
            this.onInitializeComplete();
        }
    }

    public onDispose(): void {
        if (this.initilized) {
            this.myData = null;
            this._owner = null;
            this.mInitilized = false;
        }
    }

    // IAnimatedObject Interface
    public onFrame(): void {
    }

    public onClear(): void {
    }

    protected onInitialize(): void {
    }

    protected onInitializeComplete(): void {
    }
}
