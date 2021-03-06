import { Render } from "../render";
import { FramesDisplay } from "../display/frames/frames.display";
import { MessageType } from "structure";
import { UiUtils } from "utils";
import { op_def } from "pixelpai_proto";
import { SoundField } from "apowophaserui";

export enum MouseEvent {
    RightMouseDown = 1,
    RightMouseUp = 2,
    LeftMouseDown = 3,
    LeftMouseUp = 4,
    WheelDown = 5,
    WheelUp = 6,
    RightMouseHolding = 7,
    LeftMouseHolding = 8,
    Tap = 9
}

export class MouseManager {
    protected running = false;
    protected zoom: number;
    // ===============================
    protected scene: Phaser.Scene;
    private mGameObject: Phaser.GameObjects.GameObject;
    private mDownDelay: number = 1000;
    private mDownTime: any;
    private readonly delay = 500;
    private debounce: any;
    private mClickID: number;
    // 500ms之内无法快速点击
    private mClickDelay: number = 500;
    private mClickTime: number = 0;

    constructor(protected render: Render) {
        this.zoom = this.render.scaleRatio || UiUtils.baseDpr;
    }

    get clickID(): number {
        return this.mClickID;
    }

    public changeScene(scene: Phaser.Scene) {
        this.pause();
        this.mGameObject = null;
        this.scene = scene;
        if (!this.scene) return;
        scene.input.on("gameobjectdown", this.onGameObjectDownHandler, this);
        scene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.resume();
    }

    public resize(width: number, height: number) {
        this.zoom = this.render.scaleRatio || UiUtils.baseDpr;
    }

    public pause(): void {
        this.running = false;
    }

    public resume(): void {
        this.running = true;
    }

    public onUpdate(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject): void {
        const now = Date.now();
        this.mClickTime = now;
        if (this.running === false || pointer === undefined) {
            return;
        }
        const events: number[] = [];
        if (pointer.leftButtonDown()) {
            events.push(MouseEvent.LeftMouseDown);
        } else if (pointer.leftButtonReleased()) {
            events.push(MouseEvent.LeftMouseUp);
        }
        if (pointer.middleButtonDown()) {
            events.push(MouseEvent.WheelDown);
        } else if (pointer.middleButtonReleased()) {
            events.push(MouseEvent.WheelUp);
        }
        if (pointer.rightButtonDown()) {
            events.push(MouseEvent.RightMouseDown);
        } else if (pointer.rightButtonReleased()) {
            events.push(MouseEvent.RightMouseUp);
        }
        let id = 0;
        let com = null;
        if (gameobject) {
            id = gameobject.getData("id");
            if (id) {
                com = this.render.displayManager.getDisplay(id);
            }
        }

        if (!pointer.isDown) {
            const diffX = Math.abs(pointer.downX - pointer.upX);
            const diffY = Math.abs(pointer.downY - pointer.upY);
            if (diffX > 10 || diffY > 10) return;
            if (!gameobject || !gameobject.parentContainer) return;
            if (!com || !(com instanceof FramesDisplay)) return;
            if (com.nodeType !== op_def.NodeType.ElementNodeType) return;
            if (!com.hasInteractive) return;

            com.scaleTween();
        }
        if (events.length === 0) return;

        this.sendMouseEvent(events, id, { x: pointer.worldX / this.zoom, y: pointer.worldY / this.zoom });
    }

    /**
     * 设置鼠标事件开关
     */
    public set enable(value: boolean) {
        if (this.scene) {
            this.scene.input.mouse.enabled = value;
        }
    }

    public get enable(): boolean {
        if (this.scene) {
            return this.scene.input.mouse.enabled;
        }
        return false;
    }

    public destroy() {
        this.running = false;
        if (this.scene) {
            this.scene.input.off("gameobjectdown", this.onGameObjectDownHandler, this);
            this.scene.input.off("pointerdown", this.onPointerDownHandler, this);
            this.scene.input.off("pointerup", this.onPointerUp, this);
        }
        this.scene = null;
        this.mGameObject = null;
        if (this.debounce) {
            clearTimeout(this.debounce);
        }
        if (this.mDownTime) {
            clearTimeout(this.mDownTime);
        }
        this.mClickID = 0;
        this.pause();
    }

    protected onGameObjectDownHandler(pointer, gameObject) {
        const id = gameObject.getData("id");
        const display = this.render.displayManager.getDisplay(id);
        const soundKey = "sound/click.mp3";
        // todo 后续音效逻辑
        if (display.displayInfo && display.displayInfo.sound) {
            // soundKey = "sound/mine.mp3";
        } else {
            this.render.soundManager.playSound({
                soundKey,
                scope:SoundField.Effect
            });
        }
        if (this.render.guideManager.canInteractive(id)) return;
        this.mGameObject = gameObject;
        if (display.nodeType === op_def.NodeType.ElementNodeType) this.render.renderEmitter("FurnitureEvent", id);
        // 重置hold时间
        clearTimeout(this.mDownTime);
        this.mDownTime = setTimeout(this.holdHandler.bind(this), this.mDownDelay, pointer, gameObject);
    }

    protected checkClickTime(): boolean {
        const now = Date.now();
        if (now - this.mClickTime < this.mClickDelay) {
            // this.render.showTipsAlert(i18n.t("noticeTips.quickclick"));
            return false;
        }
        this.mClickTime = now;
        return true;
    }

    protected onGameObjectUpHandler(pointer, gameObject) {
        this.onUpdate(pointer, gameObject);
    }

    protected onPointerDownHandler(pointer, gameobject) {
        if (!this.checkClickTime()) return;
        if (this.render.guideManager.canInteractive()) return;
        if (this.debounce) {
            this.mGameObject = null;
            return;
        }
        this.debounce = setTimeout(() => {
            this.debounce = null;
        }, this.delay);
        this.scene.input.off("pointerup", this.onPointerUp, this);
        this.scene.input.on("pointerup", this.onPointerUp, this);
        if (this.render) {
            if (this.render.emitter) {
                this.render.emitter.emit(MessageType.SCENE_BACKGROUND_CLICK, pointer);
            }
        }
        this.onUpdate(pointer, this.mGameObject);
    }

    protected onPointerUp(pointer) {
        clearTimeout(this.mDownTime);
        this.onUpdate(pointer, this.mGameObject);
        this.mGameObject = null;
    }

    private holdHandler(pointer, gameobject) {
        clearTimeout(this.mDownTime);
        if (Math.abs(pointer.downX - pointer.x) > 5 * this.zoom || Math.abs(pointer.downY - pointer.y) > 5 * this.zoom) {
            return;
        }

        let id = 0;
        let com = null;
        if (gameobject && gameobject.parentContainer) {
            id = gameobject.parentContainer.getData("id");
            // TODO 提供个接口
            com = gameobject.parentContainer.parentContainer || gameobject.parentContainer;
            this.sendMouseEvent([MouseEvent.LeftMouseHolding], id, {
                x: pointer.worldX / this.zoom,
                y: pointer.worldY / this.zoom
            });
        }
    }

    private sendMouseEvent(mouseEvent: MouseEvent[], id, point3f: { x: number, y: number, z?: number }) {
        this.mClickID = id;
        this.render.mainPeer.sendMouseEvent(id, mouseEvent, point3f);
    }

}
