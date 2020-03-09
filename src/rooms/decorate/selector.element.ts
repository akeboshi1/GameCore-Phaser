import { Element, IElement } from "../element/element";
import { DecorateManager } from "../../ui/decorate/decorate.manager";
import { Pos } from "../../utils/pos";
import { DecorateRoomService } from "../decorate.room";
import { MessageType } from "../../const/MessageType";
import { ISprite, Sprite } from "../element/sprite";

export class SelectorElement {
    private mScene: Phaser.Scene;
    private mDecorateManager: DecorateManager;
    private mSelecting: boolean;
    private mSourceData: SourceSprite;
    constructor(private roomService: DecorateRoomService, private mElement: IElement) {
        this.mScene = roomService.scene;
        this.mDecorateManager = new DecorateManager(this.mScene, roomService);
        this.mDecorateManager.setElement(mElement);
        const display = mElement.getDisplay();
        display.showRefernceArea();
        this.mSelecting = true;

        this.mDecorateManager.on("moveElement", this.onMoveElementHandler, this);

        this.roomService.world.emitter.emit(MessageType.EDIT_PACKAGE_COLLAPSE);
        this.roomService.world.emitter.emit(MessageType.SELECTED_DECORATE_ELEMENT);
    }

    turnElement() {
        if (!this.mElement) {
            return;
        }
        this.mElement.turn();
        this.checkCanPut();
    }

    setDisplayPos(pos: Pos) {
        if (!this.mElement) {
            return;
        }
        this.mElement.setPosition(pos);
        this.checkCanPut();
    }

    update(time: number, delta: number) {
        if (this.mElement) {
            const pos = this.mElement.getPosition();
            this.mDecorateManager.updatePos(pos.x, pos.y);
        }
    }

    clone() {
        if (!this.mElement) {
            return;
        }
        const sprite = this.mElement.model;
        const pos = sprite.pos;
        this.mSourceData = {
            x: pos.x,
            y: pos.y,
            z: pos.z,
            direction: sprite.direction
        };
    }

    recover() {
        if (!this.mElement) {
            return;
        }
        if (this.mSourceData) {
            this.mElement.setAlpha(1);
            this.mElement.setPosition(new Pos(this.mSourceData.x, this.mSourceData.y));
            this.mElement.setDirection(this.mSourceData.direction);
        }
    }

    destroy() {
        if (this.mDecorateManager) {
            this.mDecorateManager.destroy();
        }
        if (this.mElement) {
            const display = this.mElement.getDisplay();
            if (display) {
                display.hideRefernceArea();
            }
        }
        this.mSourceData = undefined;
        this.roomService.world.emitter.emit(MessageType.EDIT_PACKAGE_EXPANED);
        this.roomService.world.emitter.emit(MessageType.CANCEL_DECORATE_ELEMENT);
    }

    private checkCanPut() {
        if (!this.roomService || !this.mElement) {
            return;
        }
        const sprite = this.mElement.model;
        if (this.roomService.canPut(this.mElement.getPosition(), sprite.currentCollisionArea, sprite.currentCollisionPoint)) {
            this.element.setAlpha(1);
        } else {
            this.element.setAlpha(0.6);
        }
    }

    private onMoveElementHandler(pos: Pos) {
        if (!pos) {
            return;
        }
        this.setDisplayPos(pos);
    }

    set selecting(val: boolean) {
        this.mSelecting = val;
    }

    get selecting(): boolean {
        return this.mSelecting;
    }

    get element(): IElement {
        return this.mElement;
    }

    get root(): SourceSprite {
        return this.mSourceData;
    }
}

interface SourceSprite {
    x?: number;
    y?: number;
    z?: number;
    direction: number;
}
