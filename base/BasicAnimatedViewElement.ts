import {BasicViewElement} from "./BasicViewElement";
import {IAnimatedObject} from "./IAnimatedObject";
import {ITickedObject} from "./ITickedObject";
import Globals from "../Globals";
import {MessageType} from "../const/MessageType";

export class BasicAnimatedViewElement extends BasicViewElement implements IAnimatedObject, ITickedObject {
    public watchStageResize: boolean = false;

    private mStageSizeDirty: boolean = false;

    private mRegisterForUpdates: boolean = true;
    private mInitialRegisterForUpdates: boolean = true;
    private mIsRegisteredForUpdates: boolean = false;

    public get registerForUpdates(): boolean {
        return this.mRegisterForUpdates;
    }

    public set registerForUpdates(value: boolean) {
        this.mRegisterForUpdates = value;

        if (this.mRegisterForUpdates && !this.mIsRegisteredForUpdates) {
            // Need to register.
            this.mIsRegisteredForUpdates = true;
            Globals.TickManager.addTick(this.onTick, this);
            Globals.TickManager.addFrame(this.onFrame, this);
        }
        else if (!this.mRegisterForUpdates && this.mIsRegisteredForUpdates) {
            // Need to unregister.
            this.mIsRegisteredForUpdates = false;
            Globals.TickManager.removeTick(this.onTick, this);
            Globals.TickManager.removeFrame(this.onFrame, this);
        }
    }

    //IAnimatedObject Interface
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
            Globals.MessageCenter.addListener(MessageType.CLIENT_RESIZE, this.stageResizeHandler, this);
        }
    }

    protected onRemoveFromStage(): void {
        this.registerForUpdates = false;
        this.mRegisterForUpdates = this.mInitialRegisterForUpdates;

        if (this.watchStageResize) {
            Globals.MessageCenter.removeListener(MessageType.CLIENT_RESIZE, this.stageResizeHandler, this);
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
