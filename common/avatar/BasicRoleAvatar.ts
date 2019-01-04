
import {IAnimatedObject} from "../../base/IAnimatedObject";
import {IEntityComponent} from "../../base/IEntityComponent";
import {BasicSceneEntity} from "../../base/BasicSceneEntity";
import {IDisposeObject} from "../../base/IDisposeObject";

export class BasicRoleAvatar extends Phaser.Group implements IAnimatedObject, IEntityComponent, IDisposeObject {
    public owner: BasicSceneEntity;
    protected data: any = null;
    private mInitilized: boolean = false;
    public constructor(game: Phaser.Game) {
        super(game);
    }

    public get initilized(): boolean { return this.mInitilized; }
    public initialize(data: any = null): void {
        if (!this.mInitilized) {
            this.data = data;
            this.onInitialize();
            this.mInitilized = true;
            this.onInitializeComplete();
        }
    }

    protected onInitialize(): void {
    }

    protected onInitializeComplete(): void {
    }

    public onClear(): void {
    }

    public onDispose(): void {
        this.data = null;
        this.mInitilized = false;
    }

    public onFrame(deltaTime: number): void {
    }

    public onTick(deltaTime: number): void { }
}
