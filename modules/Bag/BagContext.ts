import {ModuleContext} from "../../base/module/core/ModuleContext";
import {BagMediator} from "./BagMediator";

export class BagContext extends ModuleContext {
    protected registerMediator(): void {
        this.m_Mediator = new BagMediator();
        super.registerMediator();
    }
}