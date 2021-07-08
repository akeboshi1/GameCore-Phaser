import { FramesDisplay } from "../display/frames/frames.display";
import { MessageType } from "structure";
import { NodeType } from "../managers/display.manager";
import { UiUtils } from "utils";
export var MouseEvent;
(function (MouseEvent) {
    MouseEvent[MouseEvent["RightMouseDown"] = 1] = "RightMouseDown";
    MouseEvent[MouseEvent["RightMouseUp"] = 2] = "RightMouseUp";
    MouseEvent[MouseEvent["LeftMouseDown"] = 3] = "LeftMouseDown";
    MouseEvent[MouseEvent["LeftMouseUp"] = 4] = "LeftMouseUp";
    MouseEvent[MouseEvent["WheelDown"] = 5] = "WheelDown";
    MouseEvent[MouseEvent["WheelUp"] = 6] = "WheelUp";
    MouseEvent[MouseEvent["RightMouseHolding"] = 7] = "RightMouseHolding";
    MouseEvent[MouseEvent["LeftMouseHolding"] = 8] = "LeftMouseHolding";
    MouseEvent[MouseEvent["Tap"] = 9] = "Tap";
})(MouseEvent || (MouseEvent = {}));
var MouseManager = /** @class */ (function () {
    function MouseManager(render) {
        this.render = render;
        this.running = false;
        this.mDownDelay = 1000;
        this.delay = 500;
        // 500ms之内无法快速点击
        this.mClickDelay = 500;
        this.mClickTime = 0;
        this.zoom = this.render.scaleRatio || UiUtils.baseDpr;
    }
    Object.defineProperty(MouseManager.prototype, "clickID", {
        get: function () {
            return this.mClickID;
        },
        enumerable: true,
        configurable: true
    });
    MouseManager.prototype.changeScene = function (scene) {
        this.pause();
        this.mGameObject = null;
        this.scene = scene;
        if (!this.scene)
            return;
        scene.input.on("gameobjectdown", this.onGameObjectDownHandler, this);
        scene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.resume();
    };
    MouseManager.prototype.resize = function (width, height) {
        this.zoom = this.render.scaleRatio || UiUtils.baseDpr;
    };
    MouseManager.prototype.pause = function () {
        this.running = false;
    };
    MouseManager.prototype.resume = function () {
        this.running = true;
    };
    MouseManager.prototype.onUpdate = function (pointer, gameobject) {
        var now = Date.now();
        this.mClickTime = now;
        if (this.running === false || pointer === undefined) {
            return;
        }
        var events = [];
        if (pointer.leftButtonDown()) {
            events.push(MouseEvent.LeftMouseDown);
        }
        else if (pointer.leftButtonReleased()) {
            events.push(MouseEvent.LeftMouseUp);
        }
        if (pointer.middleButtonDown()) {
            events.push(MouseEvent.WheelDown);
        }
        else if (pointer.middleButtonReleased()) {
            events.push(MouseEvent.WheelUp);
        }
        if (pointer.rightButtonDown()) {
            events.push(MouseEvent.RightMouseDown);
        }
        else if (pointer.rightButtonReleased()) {
            events.push(MouseEvent.RightMouseUp);
        }
        var id = 0;
        var com = null;
        if (gameobject) {
            id = gameobject.getData("id");
            if (id) {
                com = this.render.displayManager.getDisplay(id);
            }
        }
        if (!pointer.isDown) {
            var diffX = Math.abs(pointer.downX - pointer.upX);
            var diffY = Math.abs(pointer.downY - pointer.upY);
            if (diffX > 10 || diffY > 10)
                return;
            if (!gameobject || !gameobject.parentContainer)
                return;
            if (!com || !(com instanceof FramesDisplay))
                return;
            if (com.nodeType !== NodeType.ElementNodeType)
                return;
            if (!com.hasInteractive)
                return;
            com.scaleTween();
        }
        if (events.length === 0)
            return;
        this.sendMouseEvent(events, id, { x: pointer.worldX / this.zoom, y: pointer.worldY / this.zoom });
    };
    Object.defineProperty(MouseManager.prototype, "enable", {
        get: function () {
            if (this.scene) {
                return this.scene.input.mouse.enabled;
            }
            return false;
        },
        /**
         * 设置鼠标事件开关
         */
        set: function (value) {
            if (this.scene) {
                this.scene.input.mouse.enabled = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    MouseManager.prototype.destroy = function () {
        this.running = false;
        if (this.scene) {
            this.scene.input.off("gameobjectdown", this.onGameObjectDownHandler, this);
            this.scene.input.off("pointerdown", this.onPointerDownHandler, this);
            this.scene.input.off("pointerup", this.onPointerUp, this);
        }
        this.scene = null;
        this.debounce = null;
        this.mGameObject = null;
        this.pause();
    };
    MouseManager.prototype.onGameObjectDownHandler = function (pointer, gameObject) {
        var id = gameObject.getData("id");
        var display = this.render.displayManager.getDisplay(id);
        var soundKey = "sound/click.mp3";
        // todo 后续音效逻辑
        if (display.displayInfo && display.displayInfo.sound) {
            // soundKey = "sound/mine.mp3";
        }
        else {
            this.render.soundManager.playSound({
                soundKey: soundKey
            });
        }
        if (this.render.guideManager.canInteractive(id))
            return;
        this.mGameObject = gameObject;
        if (display.nodeType === NodeType.ElementNodeType)
            this.render.renderEmitter("FurnitureEvent", id);
        // 重置hold时间
        clearTimeout(this.mDownTime);
        this.mDownTime = setTimeout(this.holdHandler.bind(this), this.mDownDelay, pointer, gameObject);
    };
    MouseManager.prototype.checkClickTime = function () {
        var now = Date.now();
        if (now - this.mClickTime < this.mClickDelay) {
            // this.render.showTipsAlert(i18n.t("noticeTips.quickclick"));
            return false;
        }
        this.mClickTime = now;
        return true;
    };
    MouseManager.prototype.onGameObjectUpHandler = function (pointer, gameObject) {
        this.onUpdate(pointer, gameObject);
    };
    MouseManager.prototype.onPointerDownHandler = function (pointer, gameobject) {
        var _this = this;
        if (!this.checkClickTime())
            return;
        if (this.render.guideManager.canInteractive())
            return;
        if (this.debounce) {
            this.mGameObject = null;
            return;
        }
        this.debounce = setTimeout(function () {
            _this.debounce = null;
        }, this.delay);
        this.scene.input.off("pointerup", this.onPointerUp, this);
        this.scene.input.on("pointerup", this.onPointerUp, this);
        if (this.render) {
            if (this.render.emitter) {
                this.render.emitter.emit(MessageType.SCENE_BACKGROUND_CLICK, pointer);
            }
        }
        this.onUpdate(pointer, this.mGameObject);
    };
    MouseManager.prototype.onPointerUp = function (pointer) {
        clearTimeout(this.mDownTime);
        this.onUpdate(pointer, this.mGameObject);
        this.mGameObject = null;
    };
    MouseManager.prototype.holdHandler = function (pointer, gameobject) {
        clearTimeout(this.mDownTime);
        if (Math.abs(pointer.downX - pointer.x) > 5 * this.zoom || Math.abs(pointer.downY - pointer.y) > 5 * this.zoom) {
            return;
        }
        var id = 0;
        var com = null;
        if (gameobject && gameobject.parentContainer) {
            id = gameobject.parentContainer.getData("id");
            // TODO 提供个接口
            com = gameobject.parentContainer.parentContainer || gameobject.parentContainer;
            this.sendMouseEvent([MouseEvent.LeftMouseHolding], id, {
                x: pointer.worldX / this.zoom,
                y: pointer.worldY / this.zoom
            });
        }
    };
    MouseManager.prototype.sendMouseEvent = function (mouseEvent, id, point3f) {
        this.mClickID = id;
        this.render.mainPeer.sendMouseEvent(id, mouseEvent, point3f);
    };
    return MouseManager;
}());
export { MouseManager };
//# sourceMappingURL=mouse.manager.js.map