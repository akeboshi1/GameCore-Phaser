import {MouseManager} from "../../../render/input/mouse.manager";
import {IPosition45Obj, Logger, LogicPos, Position45} from "utils";
import {Render} from "../../../render/render";
import {NodeType} from "../../../render/managers/display.manager";
import {MessageType} from "structure";
import {DragonbonesDisplay, FramesDisplay} from "gamecoreRender";

export class MouseManagerDecorate extends MouseManager {
    private downGameObject: boolean = false;
    private downPointerPos: LogicPos;
    private downDisplayPos: LogicPos;
    private downDisplay: DragonbonesDisplay | FramesDisplay | null = null;
    private roomSize: IPosition45Obj;

    constructor(protected render: Render) {
        super(render);

    }

    destroy() {

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

        this.render.mainPeer.getCurrentRoomMiniSize().then((size) => {
            this.roomSize = size;
        });
    }

    protected async onPointerDownHandler(pointer: Phaser.Input.Pointer): Promise<void> {
        if (this.downGameObject) return;

        this.downDisplay = null;
        this.downPointerPos = new LogicPos(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio);
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.scene.input.off("pointerup", this.onPointerUpHandler, this);
        this.scene.input.on("pointerup", this.onPointerUpHandler, this);
    }

    protected async onPointerUpHandler(pointer: Phaser.Input.Pointer): Promise<void> {
        const selectedID = await this.render.mainPeer.getDecorateSelectedElementID();
        const selectedDisplay = this.render.displayManager.getDisplay(selectedID);
        if (selectedDisplay && selectedDisplay === this.downDisplay) {
            const worldPos = new LogicPos(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio);
            const freePos = new LogicPos(worldPos.x + this.downDisplayPos.x - this.downPointerPos.x,
                worldPos.y + this.downDisplayPos.y - this.downPointerPos.y);
            const gridPos = Position45.transformTo90(Position45.transformTo45(freePos, this.roomSize), this.roomSize);
            const gridDelta = new LogicPos(gridPos.x - this.downDisplayPos.x, gridPos.y - this.downDisplayPos.y);
            this.render.mainPeer.decorateMoveElement(selectedID, gridDelta);
        } else if (Math.abs(pointer.downX - pointer.x) < 5 * this.zoom && Math.abs(pointer.downY - pointer.y) < 5 * this.zoom) {
            // select
            if (this.downDisplay) this.render.mainPeer.decorateSelectElement(this.downDisplay.id);
        }

        this.clearDownData();
    }

    protected async onPointerMoveHandler(pointer: Phaser.Input.Pointer): Promise<void> {
        const worldPos = new LogicPos(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio);
        const selectedID = await this.render.mainPeer.getDecorateSelectedElementID();
        const selectedDisplay = this.render.displayManager.getDisplay(selectedID);
        if (selectedDisplay && selectedDisplay === this.downDisplay) {
            // move game object
            const freePos = new LogicPos(worldPos.x + this.downDisplayPos.x - this.downPointerPos.x,
                worldPos.y + this.downDisplayPos.y - this.downPointerPos.y);
            const gridPos = Position45.transformTo90(Position45.transformTo45(freePos, this.roomSize), this.roomSize);
            selectedDisplay.setPosition(gridPos.x, gridPos.y);
            this.render.mainPeer.updateDecorateElementReference(selectedID, gridPos.x, gridPos.y);
        } else if (Math.abs(pointer.downX - pointer.x) < 5 * this.zoom && Math.abs(pointer.downY - pointer.y) < 5 * this.zoom) {
            // select
        } else {
            // move camera
            this.downDisplay = null;
            this.render.camerasManager.offsetScroll(
                pointer.prevPosition.x - pointer.position.x,
                pointer.prevPosition.y - pointer.position.y
            );
        }
        this.render.emitter.emit(MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_POSITION);
    }

    protected onPointeroutHandler() {
        this.clearDownData();
    }

    protected async onGameObjectDownHandler(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        if (!gameObject) return;

        this.downGameObject = true;
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.scene.input.off("pointerup", this.onPointerUpHandler, this);
        this.scene.input.on("pointerup", this.onPointerUpHandler, this);
        const id = gameObject.getData("id");
        if (id) {
            const display = this.render.displayManager.getDisplay(id);
            if (display && display.nodeType === NodeType.ElementNodeType && !await this.render.mainPeer.isElementLocked(id)) {
                this.downDisplay = display;
                this.downPointerPos = new LogicPos(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio);
                this.downDisplayPos = new LogicPos(display.x, display.y);
            }
        }
    }

    private clearDownData() {
        this.downGameObject = false;
        this.downDisplay = null;
        this.downPointerPos = new LogicPos();
        this.downDisplayPos = new LogicPos();
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.scene.input.off("pointerup", this.onPointerUpHandler, this);
    }

    private addListener() {
        if (!this.scene) {
            return;
        }
        this.scene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.scene.input.on("gameobjectdown", this.onGameObjectDownHandler, this);
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
