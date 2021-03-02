import {MotionBase, MotionType} from "./motion.base";
import {Render} from "../render";
import {NodeType} from "gamecoreRender";
import {LogicPos} from "utils";
import {MessageType} from "structure";

export class MotionDecorate extends MotionBase {

    private selectedID: number = -1;
    private downPointerPos: LogicPos;
    private downDisplayPos: LogicPos;

    constructor(protected render: Render) {
        super(render);

        this.type = MotionType.Decorate;
    }

    public async onPointerDownHandler(pointer: Phaser.Input.Pointer): Promise<void> {

    }

    protected async onPointerUpHandler(pointer: Phaser.Input.Pointer): Promise<void> {

    }

    protected async onPointerMoveHandler(pointer: Phaser.Input.Pointer): Promise<void> {
        const display = this.render.displayManager.getDisplay(this.selectedID);
        if (!display) {
            this.clearDownData();
            return;
        }

        const worldPos = new LogicPos(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio);
        display.setPosition(worldPos.x + this.downDisplayPos.x - this.downPointerPos.x,
            worldPos.y + this.downDisplayPos.y - this.downPointerPos.y);
        this.render.emitter.emit(MessageType.UPDATE_SELECTED_DECORATE_ELEMENT_POSITION);
    }

    protected onPointeroutHandler() {
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
                    this.selectedID = id;
                    this.downPointerPos = new LogicPos(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio);
                    this.downDisplayPos = new LogicPos(display.x, display.y);
                    this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
                    this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
                    this.render.mainPeer.decorateSelectElement(id);
                }
            }
        }
    }

    private clearDownData() {
        this.selectedID = -1;
        this.downPointerPos = new LogicPos();
        this.downDisplayPos = new LogicPos();
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
    }
}
