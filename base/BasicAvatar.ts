import {IAnimatedObject} from "./IAnimatedObject";
import {IEntityComponent} from "./IEntityComponent";
import {IDisposeObject} from "./object/interfaces/IDisposeObject";
import {IRecycleObject} from "./object/interfaces/IRecycleObject";
import {IObjectPool} from "./pool/interfaces/IObjectPool";
import Globals from "../Globals";
import {DisplayLoaderAvatar} from "../common/avatar/DisplayLoaderAvatar";

export class BasicAvatar extends Phaser.Plugin.Isometric.IsoSprite implements IAnimatedObject, IEntityComponent, IDisposeObject, IRecycleObject {

  protected myData: any = null;
  private mInitilized = false;
  protected mLoaderAvatar: DisplayLoaderAvatar;

  public constructor(game: Phaser.Game) {
    super(game, 0, 0, 0);
  }

  private _owner: any;

  public getOwner(): any {
    return this._owner;
  }

  public setOwner(value: any) {
    this._owner = value;
  }

  public get initilized(): boolean {
    return this.mInitilized;
  }

  public initialize(value: any = null): void {
    if (!this.initilized) {
      this.myData = value;
      this.onInitialize();
      this.mInitilized = true;
      this.onInitializeComplete();
    }
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
    if (this.mLoaderAvatar && this.mLoaderAvatar.parent) {
        this.mLoaderAvatar.parent.removeChild(this.mLoaderAvatar);
    }
    this.avatarPool.free(this.mLoaderAvatar);
    this.mLoaderAvatar = null;
    this.mInitilized = false;
  }

  protected onInitialize(): void {
  }

  protected onInitializeComplete(): void {
  }

  public onRecycle(): void {
  }
}
