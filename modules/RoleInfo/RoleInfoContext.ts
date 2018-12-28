import {ModuleContext} from "../../base/module/core/ModuleContext";
import {RoleInfoMediator} from "./RoleInfoMediator";

export class RoleInfoContext extends ModuleContext {
    protected registerMediator(): void {
        this.m_Mediator = new RoleInfoMediator();
        super.registerMediator();
    }
}