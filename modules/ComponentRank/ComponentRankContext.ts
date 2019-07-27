import { ModuleContext } from "../../base/module/core/ModuleContext";
import { ComponentRankMediator } from "./ComponentRankMediator";

export class ComponentRankContext extends ModuleContext {
  protected registerMediator () {
    this.m_Mediator = new ComponentRankMediator();
  }
}