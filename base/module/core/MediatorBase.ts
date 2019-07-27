import {IMediator} from "../interfaces/IMediator";
import Globals from "../../../Globals";
import {MessageType} from "../../../common/const/MessageType";
import {IResizeObject} from "../../IResizeObject";

export class MediatorBase implements IMediator {
    protected m_Param: any;
    protected viewComponent: any;
    public get param(): any {
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

    public update(param: any): void {
        console.log(param);
    }

    public onUpdate() { }

    protected stageResizeHandler(): void {
        if (this.viewComponent === undefined) {
            return;
        }
        if ((this.viewComponent as IResizeObject).onResize !== undefined) (<IResizeObject>this.viewComponent).onResize();
    }

    public setViewComponent(viewComponent: any): void {
        this.viewComponent = viewComponent;
    }

}
