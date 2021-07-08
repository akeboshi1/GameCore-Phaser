var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Export } from "webworker-rpc";
import { BaseBatchPanel } from "./base.batch.panel";
var BasePanel = /** @class */ (function (_super) {
    __extends_1(BasePanel, _super);
    function BasePanel(scene, render) {
        return _super.call(this, scene, render) || this;
    }
    BasePanel.prototype.hide = function (boo) {
        if (boo === void 0) { boo = false; }
        this.onHide();
        if (!boo)
            this.render.uiManager.hideBasePanel(this.key);
        if (this.soundGroup && this.soundGroup.close)
            this.playSound(this.soundGroup.close);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(false);
        }
        else {
            this.destroy();
        }
    };
    BasePanel.prototype.onHide = function () {
    };
    __decorate([
        Export()
    ], BasePanel.prototype, "hide", null);
    __decorate([
        Export()
    ], BasePanel.prototype, "onHide", null);
    return BasePanel;
}(BaseBatchPanel));
export { BasePanel };
//# sourceMappingURL=base.panel.js.map