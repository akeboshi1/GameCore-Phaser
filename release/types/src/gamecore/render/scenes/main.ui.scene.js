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
import { BaseLayer } from "baseRender";
import { Font, SceneName } from "structure";
import { RoomScene } from "./room.scene";
var MainUIScene = /** @class */ (function (_super) {
    __extends_1(MainUIScene, _super);
    // private sizeTF: Phaser.GameObjects.Text;
    function MainUIScene() {
        var _this = _super.call(this, { key: SceneName.MAINUI_SCENE }) || this;
        _this.timeOutID = 0;
        _this.timeOutCancelMap = {};
        _this.timeOutCallerList = [];
        _this.timeOutTimeMap = {};
        return _this;
    }
    MainUIScene.prototype.init = function (data) {
        _super.prototype.init.call(this, data);
        if (this.render) {
            this.render.uiManager.setScene(null);
        }
    };
    MainUIScene.prototype.create = function () {
        var width = this.cameras.main.width;
        this.fps = this.add.text(width - 6 * this.render.devicePixelRatio, 10, "", { color: "#00FF00", });
        this.fps.setStroke("#000000", 1);
        this.fps.setFontFamily(Font.DEFULT_FONT);
        this.fps.setFontSize(13 * this.render.devicePixelRatio);
        this.fps.setDepth(1000);
        this.fps.setOrigin(1, 0);
        // this.sizeTF = this.add.text(10, 50, "", { style: { color: "#64dd17" }, wordWrap: { width: 800, useAdvancedWrap: true } });
        // this.sizeTF.setFontSize(20 * this.render.devicePixelRatio);
        // this.sizeTF.setFontFamily(Font.DEFULT_FONT);
        // this.sizeTF.setStroke("#0", 3);
        // if (world.game.device.os.desktop) {
        // } else {
        //   if (world.inputManager) {
        //     world.inputManager.setScene(this);
        //   }
        // }
        this.render.uiManager.setScene(this);
        this.render.initUI();
        // this.checkSize(this.mRoom.world.getSize());
        // this.mRoom.world.game.scale.on("orientationchange", this.checkOriention, this);
        // this.scale.on("resize", this.checkSize, this);
        // set layers
        this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_UI, 1);
        this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_DIALOG, 2);
        this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_TOOLTIPS, 3);
        this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_MASK, 4);
        _super.prototype.create.call(this);
        // this.render.guideManager.init();
    };
    MainUIScene.prototype.setTimeout = function (caller, time) {
        var begin = Date.now();
        this.timeOutCallerList[++this.timeOutID] = caller;
        this.timeOutTimeMap[this.timeOutID] = { now: begin, delay: time };
        return this.timeOutID;
    };
    MainUIScene.prototype.clearTimeout = function (id) {
        this.timeOutCancelMap[id] = true;
    };
    MainUIScene.prototype.updateFPS = function () {
        if (this.fps)
            this.fps.setText(this.game.loop.actualFps.toFixed());
    };
    // public update(time: number, delta: number) {
    //   this.fps.setText(this.game.loop.actualFps.toFixed());
    //   // const orientation: string = this.mRoom.world.getSize().width > this.mRoom.world.getSize().height ? "LANDSCAPE" : "PORTRAIT";
    //   // this.sizeTF.text = "width:" + this.mRoom.world.getSize().width +
    //   //   "\n" + "height:" + this.mRoom.world.getSize().height + `\npixelRatio: ${window.devicePixelRatio} \nscene Scale: ${this.mRoom.world.scaleRatio} \nuiscale：${Math.round(this.mRoom.world.scaleRatio)}`;
    // }
    MainUIScene.prototype.getKey = function () {
        return this.sys.config.key;
    };
    // preload() {
    //   this.loadRaomVideos();
    //   super.preload();
    // }
    MainUIScene.prototype.onPointerDownHandler = function (pointer, currentlyOver) {
        this.render.emitter.emit("pointerScene", SceneName.MAINUI_SCENE, currentlyOver);
    };
    MainUIScene.prototype.loadVideos = function () {
        // const folder = "roam_effect";
        // const video = ["roamone", "roamtenrepead", "roamreward", "roambefore"];
        // for (const res of video) {
        //   const url = Url.getNormalUIRes(`${folder}/${res}.mp4`);
        //   this.load.video(res, url, undefined, true, true);
        // }
    };
    // private checkOriention(orientation) {
    //   this.sizeTF.text = "width:" + this.mRoom.world.getSize().width + "\n" + "height:" + this.mRoom.world.getSize().height + "\n" + "orientation:" + orientation + "\n" + "orientationChange:" + orientation;
    // }
    MainUIScene.prototype.checkSize = function (size) {
        var width = size.width;
        var height = size.height;
        var world = this.render;
        // const gameSize = world.getSize();
        // this.sizeTF.text = `CSS size: ${world.getConfig().width} ${world.getConfig().height}
        // Game size: ${gameSize.width.toFixed(2)} ${gameSize.height.toFixed(2)}
        // deviceRatio: ${window.devicePixelRatio}
        // scene ratio: ${world.scaleRatio}
        // ui ratio: ${world.uiRatio}
        // ui scale: ${world.uiScale.toFixed(5)}
        // `;
        //  this.sizeTF.text = "width:" + size.width + ";height:" + size.height;
    };
    MainUIScene.LAYER_UI = "uiLayer";
    MainUIScene.LAYER_DIALOG = "dialogLayer";
    MainUIScene.LAYER_TOOLTIPS = "toolTipsLayer";
    MainUIScene.LAYER_MASK = "maskLayer";
    return MainUIScene;
}(RoomScene));
export { MainUIScene };
//# sourceMappingURL=main.ui.scene.js.map