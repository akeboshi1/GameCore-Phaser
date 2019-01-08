import {IMediator} from "../interfaces/IMediator";
import Globals from "../../../Globals";
import {MessageType} from "../../../common/const/MessageType";

export class MediatorBase implements IMediator {
    protected m_Param: any;
    protected viewComponent: any;
    public getParam(): void {
        return this.m_Param;
    }

    public setParam(param: any): void {
        this.m_Param = param;
    }

    public preBreakOff(): void {
        this.onBreakOff();
    }

    public onBreakOff(): void {
    }

    public preRecover(): void {
        this.onRecover();
    }

    public onRecover(): void {
    }

    public preRemove(): void {
        this.onRemove();
        Globals.MessageCenter.cancel(MessageType.CLIENT_RESIZE, this.stageResizeHandler, this);
    }

    public onRemove(): void {
    }

    public preRegister(): void {
        this.onRegister();
    }

    public onRegister(): void {
        Globals.MessageCenter.on(MessageType.CLIENT_RESIZE, this.stageResizeHandler, this);
    }

    protected stageResizeHandler(): void {
    }

    public setViewComponent(viewComponent: any): void {
        this.viewComponent = viewComponent;
    }

}