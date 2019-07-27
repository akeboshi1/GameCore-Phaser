import { ModuleContext } from "../../base/module/core/ModuleContext";
import { RankMediator } from "./RankMediator";

export class RankContext extends ModuleContext {
  protected registerMediator () {
    this.m_Mediator = new RankMediator();
  }
}