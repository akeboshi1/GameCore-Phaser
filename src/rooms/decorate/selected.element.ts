import {FramesDisplay} from "../display/frames.display";
import {DragonbonesDisplay} from "../display/dragonbones.display";
import {DecorateManager} from "../../ui/decorate/decorate.manager";
import { IRoomService } from "../room";
import { ISprite, Sprite } from "../element/sprite";
import { FramesModel } from "../display/frames.model";
import { MessageType } from "../../const/MessageType";
import { Pos } from "../../utils/pos";
import { Logger } from "../../utils/log";
import { DecorateRoomService } from "../decorate.room";

export class SelectedElement {
    private readonly scene: Phaser.Scene;
    private readonly roomService: DecorateRoomService;
    private mDisplay: FramesDisplay | DragonbonesDisplay;
    private mDecorateManager: DecorateManager;
    private mRootSprite: ISprite;
    private mSprite: ISprite;
    private mSelecting: boolean = false;
    constructor(scene: Phaser.Scene, roomService: DecorateRoomService) {
        this.scene = scene;
        this.roomService = roomService;
        this.mDecorateManager = new DecorateManager(scene, roomService);
        this.mDecorateManager.on("moveElement", this.onMoveElementHandler, this);
        this.mDecorateManager.on("cancel", this.onCancelHandler, this);
    }

    setElement(display: FramesDisplay | DragonbonesDisplay) {
        if (this.mDisplay) {
            this.mDisplay.hideRefernceArea();
            this.mDecorateManager.remove();
        }
        this.mDisplay = display;
        display.showRefernceArea();
        this.mDecorateManager.setElement(display);
        this.mDisplay = display;
        this.roomService.world.emitter.emit(MessageType.EDIT_PACKAGE_COLLAPSE);
    }

    setSprite(sprite: ISprite, root?: ISprite) {
        // this.mDisplay = new FramesDisplay(this.scene, this.roomService);
        const displayInfo = sprite.displayInfo;
        if (!displayInfo) {
            return;
        }
        if (root) {
            this.mRootSprite = new Sprite(sprite.toSprite(), sprite.nodeType);
        } else {
            this.mRootSprite = null;
        }
        this.mSprite = sprite;
        this.mDisplay = new FramesDisplay(this.scene, this.roomService);
        const pos = sprite.pos;
        this.mDisplay.x = pos.x;
        this.mDisplay.y = pos.y;
        this.mDisplay.once("initialized", () => {
            this.mDisplay.showRefernceArea();
            this.mDisplay.setDirection(sprite.direction);
            this.mDecorateManager.setElement(this.mDisplay);
            this.roomService.addToSurface(this.mDisplay);
        });
        this.mDisplay.load(<FramesModel> sprite.displayInfo);
        this.mSelecting = true;
        this.roomService.world.emitter.emit(MessageType.EDIT_PACKAGE_COLLAPSE);
        this.roomService.world.emitter.emit(MessageType.SELECTED_DECORATE_ELEMENT);
    }

    turnElement() {
        if (!this.mDisplay) {
            return;
        }
        const sprite = this.sprite;
        sprite.turn();
        if (this.mDisplay) this.mDisplay.play(sprite.currentAnimation);
        // this.mDisplay.play(sprite.currentAnimationName);
        // this.mDisplay.setDirection(sprite.direction);
        this.checkCanPut();
    }

    remove() {
        this.mDecorateManager.remove();
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        if (this.mRootSprite) {
            this.mRootSprite = null;
        }
        this.roomService.world.emitter.emit(MessageType.EDIT_PACKAGE_EXPANED);
        this.roomService.world.emitter.emit(MessageType.CANCEL_DECORATE_ELEMENT);
    }

    update(time: number, delta: number) {
        if (this.mDisplay) {
            this.mDecorateManager.updatePos(this.mDisplay.x, this.mDisplay.y);
        }
    }

    setDisplayPos(x: number, y: number) {
        if (!this.mDisplay) {
            return;
        }
        this.mDisplay.x = x;
        this.mDisplay.y = y;
        this.mDecorateManager.updatePos(x, y);
        this.mSprite.setPosition(x, y);

        this.checkCanPut();
        // this.mLayerManager.depthSurfaceDirty = true;
    }

    private onMoveElementHandler(pos: Pos) {
        if (!pos) {
            return;
        }
        this.setDisplayPos(pos.x, pos.y);
    }

    private onCancelHandler() {
        this.remove();
    }

    private checkCanPut() {
        if (!this.roomService || !this.mSprite || !this.mDisplay) {
            return;
        }
        if (this.roomService.canPut(this.mSprite)) {
            this.mDisplay.alpha = 1;
        } else {
            this.mDisplay.alpha = 0.6;
        }
    }

    get display(): FramesDisplay | DragonbonesDisplay {
        return this.mDisplay;
    }

    get sprite(): ISprite {
        return this.mSprite;
    }

    get root(): ISprite {
        return this.mRootSprite;
    }

    set selecting(val: boolean) {
        this.mSelecting = val;
    }

    get selecting(): boolean {
        return this.mSelecting;
    }
}
