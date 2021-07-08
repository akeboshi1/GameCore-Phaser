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
var CheckboxGroup = /** @class */ (function (_super) {
    __extends_1(CheckboxGroup, _super);
    function CheckboxGroup() {
        var _this = _super.call(this) || this;
        _this.mList = [];
        return _this;
    }
    CheckboxGroup.prototype.appendItem = function (item) {
        this.mList.push(item);
        item.on(ClickEvent.Tap, this.onGameObjectUpHandler, this);
        return this;
    };
    CheckboxGroup.prototype.appendItemAll = function (items) {
        this.mList = this.mList.concat(items);
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            item.on(ClickEvent.Tap, this.onGameObjectUpHandler, this);
        }
        return this;
    };
    CheckboxGroup.prototype.removeItem = function (item) {
        this.mList = this.mList.filter(function (button) { return button !== item; });
        item.removeAllListeners();
        return this;
    };
    CheckboxGroup.prototype.selectIndex = function (index) {
        if (index < 0) {
            index = 0;
        }
        if (index >= this.mList.length) {
            index = this.mList.length - 1;
        }
        if (this.mList.length > 0) {
            this.select(this.mList[index]);
        }
        return this;
    };
    CheckboxGroup.prototype.select = function (item) {
        if (this.mSelectedButton === item) {
            return;
        }
        if (this.mSelectedButton) {
            this.mSelectedButton.selected = false;
        }
        item.changeDown();
        this.mSelectedButton = item;
        this.emit(ClickEvent.Selected, item);
    };
    CheckboxGroup.prototype.reset = function () {
        var _this = this;
        if (this.mList) {
            this.mList.forEach(function (item) {
                _this.removeItem(item);
            });
        }
    };
    CheckboxGroup.prototype.destroy = function () {
        var _this = this;
        if (this.mList) {
            this.mList.forEach(function (item) {
                _this.removeItem(item);
                item.destroy();
            });
        }
        _super.prototype.destroy.call(this);
    };
    CheckboxGroup.prototype.onGameObjectUpHandler = function (pointer, gameobject) {
        this.select(gameobject);
    };
    Object.defineProperty(CheckboxGroup.prototype, "selectedIndex", {
        get: function () {
            return this.mList.indexOf(this.mSelectedButton);
        },
        enumerable: true,
        configurable: true
    });
    return CheckboxGroup;
}(Phaser.Events.EventEmitter));
export { CheckboxGroup };
//# sourceMappingURL=checkbox.group.js.map