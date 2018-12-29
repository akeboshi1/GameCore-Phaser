import {ModuleContext} from "../../base/module/core/ModuleContext";
import {ShortcutMenuMediator} from "./ShortcutMenuMediator";

export class ShortcutMenuContext extends ModuleContext {
    protected registerMediator(): void {
        this.m_Mediator = new ShortcutMenuMediator();
        super.registerMediator();
    }
}