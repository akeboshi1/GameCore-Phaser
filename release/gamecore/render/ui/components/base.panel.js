var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
import { Export } from "webworker-rpc";
import { BaseBatchPanel } from "./base.batch.panel";
export class BasePanel extends BaseBatchPanel {
  constructor(scene, render) {
    super(scene, render);
  }
  hide(boo = false) {
    this.onHide();
    if (!boo)
      this.render.uiManager.hideBasePanel(this.key);
    if (this.soundGroup && this.soundGroup.close)
      this.playSound(this.soundGroup.close);
    if (!this.mTweening && this.mTweenBoo) {
      this.showTween(false);
    } else {
      this.destroy();
    }
  }
  onHide() {
  }
}
__decorateClass([
  Export()
], BasePanel.prototype, "hide", 1);
__decorateClass([
  Export()
], BasePanel.prototype, "onHide", 1);
