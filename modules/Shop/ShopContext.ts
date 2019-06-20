import { ModuleContext } from "../../base/module/core/ModuleContext";
import { ShopMediator } from "./ShopMediator";

export class ShopContext extends ModuleContext {
  registerMediator() {
    this.m_Mediator = new ShopMediator();
    super.registerMediator();
  }
}