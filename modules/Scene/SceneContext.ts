import {SceneMediator} from "./SceneMediator";
import {ModuleContext} from "../../base/module/core/ModuleContext";

export class SceneContext extends ModuleContext {
    protected registerMediator(): void {
        this.m_Mediator = new SceneMediator();
        super.registerMediator();
    }
}