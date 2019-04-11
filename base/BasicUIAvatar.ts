import {IAnimatedObject} from "./IAnimatedObject";
import {IEntityComponent} from "./IEntityComponent";
import {IDisposeObject} from "./object/interfaces/IDisposeObject";
import {IRecycleObject} from "./object/interfaces/IRecycleObject";
import {IObjectPool} from "./pool/interfaces/IObjectPool";

export class BasicUIAvatar extends Phaser.Sprite implements IAnimatedObject, IEntityComponent, IDisposeObject {

  protected mLoaderAvatar: IRecycleObject;

  public constructor(game: Phaser.Game) {
    super(game, 0, 0);
    this.onInitialize();
  }

  private _owner: any;

  public getOwner(): any {
    return this._owner;
  }

  public setOwner(value: any) {
    this._owner = value;
  }

  protected get avatarPool(): IObjectPool {
      return null;
  }

  public onDispose(): void {
    if (this.mLoaderAvatar) {
        this.avatarPool.free(this.mLoaderAvatar);
    }
    this.mLoaderAvatar = null;
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

  public onRecycle(): void {
  }
}
