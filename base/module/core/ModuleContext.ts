import {IModuleContext} from "../interfaces/IModuleContext";
import {IMediator} from "../interfaces/IMediator";

export class ModuleContext implements IModuleContext {
    protected m_ModuleView: Phaser.Sprite;
    protected m_Mediator: IMediator;
    protected m_ModuleParam: any;

    constructor(view: Phaser.Sprite) {
        this.m_ModuleView = view;
    }

    public start(): void {
        this.registerMediator();
        if ( this.m_Mediator ) {
            this.m_Mediator.setViewComponent(this.m_ModuleView);
            this.m_Mediator.setParam( this.m_ModuleParam );
            this.m_Mediator.preRegister();
        }
    }

    protected registerMediator(): void {}

    public breakOff(): void {
        this.m_Mediator.preBreakOff();
    }

    public dispose(): void {
        this.m_Mediator.preRemove();
        this.m_Mediator.setViewComponent( null );
    }

    public recover(): void {
        this.m_Mediator.preRecover();
    }

    public setParam(param: any): void {
        this.m_ModuleParam = param;
    }

    public update() {
        if (this.m_Mediator) {
            this.m_Mediator.update();
        }
    }

    public getView(): Phaser.Sprite {
        return this.m_ModuleView;
    }
}