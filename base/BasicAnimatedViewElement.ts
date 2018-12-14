import {BasicViewElement} from "./BasicViewElement";
import {IAnimatedObject} from "./IAnimatedObject";
import {ITickedObject} from "./ITickedObject";
import Globals from "../Globals";
import {MessageType} from "../common/const/MessageType";
import {Tick} from "../common/tick/Tick";

export class BasicAnimatedViewElement extends BasicViewElement implements IAnimatedObject, ITickedObject {
  public watchStageResize = false;

  private mStageSizeDirty = false;

  private mRegisterForUpdates = true;
  private mInitialRegisterForUpdates = true;
  private mIsRegisteredForUpdates = false;
  private mTick: Tick;

  public get registerForUpdates(): boolean {
    return this.mRegisterForUpdates;
  }

  public set registerForUpdates(value: boolean) {
    this.mRegisterForUpdates = value;

    if (this.mRegisterForUpdates && !this.mIsRegisteredForUpdates) {
      // Need to register.
      this.mIsRegisteredForUpdates = true;
      this.mTick = new Tick(30);
      this.mTick.setCallBack(this.onTick, this);
      this.mTick.setRenderCallBack(this.onFrame, this);
      this.mTick.start();
    } else if (!this.mRegisterForUpdates && this.mIsRegisteredForUpdates) {
      // Need to unregister.
      this.mIsRegisteredForUpdates = false;
      this.mTick.onDispose();
      this.mTick = null;
    }
  }

  // IAnimatedObject Interface
  public onFrame(deltaTime: Number): void {
    if (this.mStageSizeDirty) {
      this.onStageResize();
      this.mStageSizeDirty = false;
    }
  }

  public onTick(deltaTime: Number): void {
  }

  protected onAddToStage(): void {
    this.mInitialRegisterForUpdates = this.mRegisterForUpdates;
    this.registerForUpdates = this.mRegisterForUpdates;

    if (this.watchStageResize) {
      Globals.MessageCenter.on(MessageType.CLIENT_RESIZE, this.stageResizeHandler, this);
    }
  }

  protected onRemoveFromStage(): void {
    this.registerForUpdates = false;
    this.mRegisterForUpdates = this.mInitialRegisterForUpdates;

    if (this.watchStageResize) {
      Globals.MessageCenter.cancel(MessageType.CLIENT_RESIZE, this.stageResizeHandler, this);
    }
  }

  protected requestStageResize(): void {
    this.mStageSizeDirty = true;
  }

  protected onStageResize(): void {
  }

  private stageResizeHandler(): void {
    this.requestStageResize();
  }
}
