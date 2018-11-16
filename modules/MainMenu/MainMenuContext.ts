import {ModuleContext} from "../../base/module/core/ModuleContext";
import {MainMenuMediator} from "./MainMenuMediator";

export class MainMenuContext extends ModuleContext {
    protected registerMediator(): void {
        this.m_Mediator = new MainMenuMediator();
        super.registerMediator();
    }
}