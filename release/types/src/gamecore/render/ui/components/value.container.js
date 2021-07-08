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
import { Button, ClickEvent } from "apowophaserui";
import { Font } from "structure";
var ValueContainer = /** @class */ (function (_super) {
    __extends_1(ValueContainer, _super);
    function ValueContainer(scene, key, leftIcon, dpr) {
        if (dpr === void 0) { dpr = 1; }
        var _this = _super.call(this, scene) || this;
        _this.init(key, leftIcon, dpr);
        return _this;
    }
    ValueContainer.prototype.setText = function (val) {
        this.mText.setText(val);
    };
    ValueContainer.prototype.setHandler = function (send) {
        this.sendHandler = send;
    };
    ValueContainer.prototype.init = function (key, leftIcon, dpr) {
        var bg = this.scene.make.image({
            key: key,
            frame: "home_progress_bottom"
        }, false);
        bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mLeft = this.scene.make.image({
            key: key,
            frame: leftIcon,
        }, false);
        this.mLeft.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mText = this.scene.make.text({
            text: "0",
            style: {
                fontSize: 14 * dpr + "px",
                fontFamily: Font.NUMBER,
                fixedWidth: bg.width,
                fixedHeight: bg.height
            }
        }, false).setOrigin(0.5);
        this.mText.setStroke("#000000", 1 * dpr);
        this.mText.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mAddBtn = new Button(this.scene, key, "add_btn", "add_btn");
        this.setSize(bg.width, bg.height);
        this.mLeft.x = -bg.width * 0.5 + 5 * dpr;
        this.mLeft.y = bg.y + bg.height * 0.5 - this.mLeft.height * 0.5;
        this.mAddBtn.x = this.width * this.originX - this.mAddBtn.width * this.originX - 5 * dpr;
        this.mText.x = 4 * dpr;
        this.add([bg, this.mLeft, this.mText, this.mAddBtn]);
        this.mAddBtn.on(ClickEvent.Tap, this.onAddHandler, this);
    };
    ValueContainer.prototype.onAddHandler = function () {
        if (this.sendHandler)
            this.sendHandler.run();
    };
    return ValueContainer;
}(Phaser.GameObjects.Container));
export { ValueContainer };
//# sourceMappingURL=value.container.js.map