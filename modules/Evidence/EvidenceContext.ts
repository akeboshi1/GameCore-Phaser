import {ModuleContext} from "../../base/module/core/ModuleContext";
import {EvidenceMediator} from "./EvidenceMediator";

export class EvidenceContext extends ModuleContext {
    protected registerMediator(): void {
        this.m_Mediator = new EvidenceMediator();
        super.registerMediator();
    }
}