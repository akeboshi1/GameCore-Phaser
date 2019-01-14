import {IAnimatedObject} from "./IAnimatedObject";
import {IEntityComponent} from "./IEntityComponent";
import {IDisposeObject} from "./IDisposeObject";

export class BasicAvatar extends Phaser.Plugin.Isometric.IsoSprite implements IAnimatedObject, IEntityComponent, IDisposeObject {
    public owner: any;
    protected myData: any = null;
    private mInitilized = false;

    public constructor(game: Phaser.Game) {
        super(game, 0, 0, 0);
    }

    public get initilized(): boolean {
        return this.mInitilized;
    }

    public initialize(value: any = null): void {
        if (!this.mInitilized) {
            this.myData = value;
            this.onInitialize();
            this.mInitilized = true;
            this.onInitializeComplete();
        }
    }

    public setData(value: any) {
      this.myData = value;
    }

    public onDispose(): void {
        this.myData = null;
    }

    // IAnimatedObject Interface
    public onFrame(deltaTime: number): void {

    }
    
    protected onInitialize(): void {
    }

    protected onInitializeComplete(): void {
    }

    public onClear(): void {
    }
}
