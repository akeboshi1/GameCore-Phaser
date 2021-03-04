import {MouseManager} from "./mouse.manager";
import {LogicPos} from "utils";
import {Render} from "../render";
import {NodeType} from "../managers/display.manager";
import {MessageType} from "structure";

export class MouseManagerDecorate extends MouseManager {
    private selectedID: number = -1;
    private downPointerPos: LogicPos;
    private downDisplayPos: LogicPos;
    private downWithGO: boolean = false;

    constructor(protected render: Render) {
        super(render);

        this.render.emitter.on(MessageType.DECORATE_UNSELECT_ELEMENT, this.unselect, this);
    }

    destroy() {
        this.render.emitter.off(MessageType.DECORATE_UNSELECT_ELEMENT, this.unselect, this);
        this.removeListener();
        super.destroy();
    }

    onUpdate(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject) {
        // do nothing
    }

    public changeScene(scene: Phaser.Scene) {
        this.removeListener();
        super.changeScene(scene);
        this.removeListener();
        this.addListener();
    }

    protected async onPointerDownHandler(pointer: Phaser.Input.Pointer): Promise<void> {
        if (this.downWithGO) return;

        this.downWithGO = false;
        this.downPointerPos = new LogicPos(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio);
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
    }

    protected async onPointerUpHandler(pointer: Phaser.Input.Pointer): Promise<void> {

        this.clearDownData();
    }

    protected async onPointerMoveHandler(pointer: Phaser.Input.Pointer): Promise<void> {
        const worldPos = new LogicPos(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio);
        if (this.downWithGO) {
            // move game object
            const display = this.render.displayManager.getDisplay(this.selectedID);
            if (!display) {
                this.clearDownData();
                return;
            }

            display.setPosition(worldPos.x + this.downDisplayPos.x - this.downPointerPos.x,
                worldPos.y + this.downDisplayPos.y - this.downPointerPos.y);
        } else {
            // move camera
            this.render.camerasManager.offsetScroll(
                pointer.prevPosition.x - pointer.position.x,
                pointer.prevPosition.y - pointer.position.y
            );
        }
        this.render.emitter.emit(MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_POSITION);
    }

    protected onPointeroutHandler() {
        this.selectedID = -1;
        this.clearDownData();
    }

    protected onGameObjectUpHandler(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        const worldPos = new LogicPos(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio);
        const delta = new LogicPos(worldPos.x - this.downPointerPos.x, worldPos.y - this.downPointerPos.y);
        const id = gameObject.getData("id");
        if (!id || id !== this.selectedID) return;
        this.render.mainPeer.decorateMoveElement(id, delta);

        this.clearDownData();
    }

    protected onGameObjectDownHandler(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        if (gameObject) {
            const id = gameObject.getData("id");
            if (id) {
                const display = this.render.displayManager.getDisplay(id);
                if (display && display.nodeType === NodeType.ElementNodeType) {
                    this.downWithGO = true;
                    this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
                    this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
                    this.downPointerPos = new LogicPos(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio);
                    this.downDisplayPos = new LogicPos(display.x, display.y);
                    if (id !== this.selectedID) {
                        this.selectedID = id;
                        this.render.mainPeer.decorateSelectElement(id);
                    }
                }
            }
        }
    }

    private unselect() {
        this.selectedID = -1;
    }

    private clearDownData() {
        this.downWithGO = false;
        this.downPointerPos = new LogicPos();
        this.downDisplayPos = new LogicPos();
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
    }

    private addListener() {
        if (!this.scene) {
            return;
        }
        this.scene.input.on("pointerup", this.onPointerUpHandler, this);
        this.scene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.scene.input.on("gameobjectdown", this.onGameObjectDownHandler, this);
        this.scene.input.on("gameobjectup", this.onGameObjectUpHandler, this);
    }

    private removeListener() {
        if (!this.scene) {
            return;
        }
        this.scene.input.off("pointerup", this.onPointerUpHandler, this);
        this.scene.input.off("pointerdown", this.onPointerDownHandler, this);
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.scene.input.off("gameobjectdown", this.onGameObjectDownHandler, this);
        this.scene.input.off("gameobjectup", this.onGameObjectUpHandler, this);
    }
}
