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
import { ClickEvent } from "apowophaserui";
import { ToggleButton } from "./toggle.button";
var CheckBoxToggle = /** @class */ (function (_super) {
    __extends_1(CheckBoxToggle, _super);
    function CheckBoxToggle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckBoxToggle.prototype.EventStateChange = function (state) {
        switch (state) {
            case ClickEvent.Up:
                this.changeNormal();
                break;
            case ClickEvent.Down:
                this.changeDown();
                break;
            case ClickEvent.Tap:
                this.isOn = !this.isOn;
                break;
            case ClickEvent.Out:
                if (this.isOn) {
                    this.changeDown();
                }
                else {
                    this.changeNormal();
                }
                break;
        }
    };
    return CheckBoxToggle;
}(ToggleButton));
export { CheckBoxToggle };
//# sourceMappingURL=checkbox.toggle.js.map