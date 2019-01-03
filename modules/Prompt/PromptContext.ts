import {AlertMediator} from "./AlertMediator";
import {IMediator} from "../../base/module/interfaces/IMediator";
import {PromptView} from "./view/PromptView";
import {IModuleContext} from "../../base/module/interfaces/IModuleContext";
import {PromptMediator} from "./PromptMediator";

export class PromptContext implements IModuleContext {
    protected m_ModuleView: PromptView;
    protected m_Mediator: IMediator;
    protected m_AlertMediator: IMediator;
    protected m_ModuleParam: any;

    constructor(view: PromptView) {
        this.m_ModuleView = view;
    }

    public get moduleView(): PromptView {
        return this.m_ModuleView as PromptView;
    }

    public start(): void {
        this.registerMediator();
        if (this.m_Mediator) {
            this.m_Mediator.setViewComponent(this.moduleView);
            this.m_Mediator.setParam(this.m_ModuleParam);
            this.m_Mediator.preRegister();
        }
        if (this.m_AlertMediator) {
            this.m_AlertMediator.setViewComponent(this.moduleView.alertView);
            this.m_AlertMediator.setParam(this.m_ModuleParam);
            this.m_AlertMediator.preRegister();
        }
    }

    public breakOff(): void {
        this.m_AlertMediator.preBreakOff();
    }

    public dispose(): void {
        this.m_AlertMediator.preRemove();
        this.m_AlertMediator.setViewComponent(null);
    }

    public recover(): void {
        this.m_AlertMediator.preRecover();
    }

    public setParam(param: any): void {
        this.m_ModuleParam = param;
    }

    protected registerMediator(): void {
        this.m_Mediator = new PromptMediator();
        this.m_AlertMediator = new AlertMediator();
    }
}