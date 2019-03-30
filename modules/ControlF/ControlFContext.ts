import {ModuleContext} from "../../base/module/core/ModuleContext";
import {ControlFMediator} from "./ControlFMediator";

export class ControlFContext extends ModuleContext {
    protected registerMediator(): void {
        this.m_Mediator = new ControlFMediator();
        super.registerMediator();
    }
}