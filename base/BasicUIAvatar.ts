import {IAnimatedObject} from "./IAnimatedObject";
import {IEntityComponent} from "./IEntityComponent";
import {IDisposeObject} from "./object/interfaces/IDisposeObject";
import {IRecycleObject} from "./object/interfaces/IRecycleObject";
import {IObjectPool} from "./pool/interfaces/IObjectPool";

export class BasicUIAvatar extends Phaser.Sprite implements IAnimatedObject, IEntityComponent, IDisposeObject, IRecycleObject {

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
    this.onClear();
  }

  // IAnimatedObject Interface
  public onFrame(): void {

  }

  public onClear(): void {
    this.avatarPool.free(this.mLoaderAvatar);
    this.mLoaderAvatar = null;
  }

  protected onInitialize(): void {
  }

  protected onInitializeComplete(): void {
  }

  public onRecycle(): void {
  }
}
