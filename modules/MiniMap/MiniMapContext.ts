import {ModuleContext} from "../../base/module/core/ModuleContext";
import {MiniMapMediator} from "./MiniMapMediator";

export class MiniMapContext extends ModuleContext {
  protected registerMediator(): void {
    this.m_Mediator = new MiniMapMediator();
    super.registerMediator();
  }
}
