import "phaser-ce";
import {IModule} from "../interfaces/IModule";
import {Const} from "../../../const/Const";
import {IModuleContext} from "../interfaces/IModuleContext";

export class Module implements IModule {
    protected m_Name: string;
    protected m_Status: number;

    protected m_View: any;
    protected m_ModuleParam: any;
    protected m_Context: IModuleContext;

    public setParam(param: any) {
        this.m_ModuleParam = param;
    }

    public get context(): IModuleContext {
        return this.m_Context;
    }

    public get view(): any {
        return this.m_View;
    }

    public startUp() {
        this.m_Status = Const.ModuleEnum.MODULE_STATUS_RUN;
        this.onStartUp();
        if ( this.m_Context ) {
            this.m_Context.setParam( this.m_ModuleParam );
            this.m_Context.start();
        }
    }

    protected onStartUp() {}

    public recover() {
        if ( this.m_Status === Const.ModuleEnum.MODULE_STATUS_RUN ) return;
        if ( this.m_Context ) this.m_Context.recover();
        this.onRecover();
        this.m_Status = Const.ModuleEnum.MODULE_STATUS_RUN;
    }

    protected onRecover(): void {}

    public stop() {
        if ( this.m_Status === Const.ModuleEnum.MODULE_STATUS_STOP ) return;
        if ( this.m_Context ) this.m_Context.breakOff();
        this.onStop();
        this.m_Status = Const.ModuleEnum.MODULE_STATUS_STOP;
    }

    protected onStop(): void {}

    public set name( value: string ) {
        this.m_Name = value;
    }

    public get name(): string {
        return this.m_Name;
    }

    public onDispose() {
        if ( this.m_Context ) this.m_Context.dispose();
        this.m_Context = null;
    }

}