import { ModuleContext } from "../../base/module/core/ModuleContext";
import { UserMenuMediator } from "./UserMenuMediator";

export class UserMenuContext extends ModuleContext {
    protected registerMediator(): void {
        this.m_Mediator = new UserMenuMediator();
        super.registerMediator();
    }
}