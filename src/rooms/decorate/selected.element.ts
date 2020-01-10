import {FramesDisplay} from "../display/frames.display";
import {DragonbonesDisplay} from "../display/dragonbones.display";
import {DecorateManager} from "../../ui/decorate/decorate.manager";
import { IRoomService } from "../room";
import { ISprite } from "../element/sprite";
import { IFramesModel, FramesModel } from "../display/frames.model";
import { MessageType } from "../../const/MessageType";
import { DragonbonesModel } from "../display/dragonbones.model";

export class SelectedElement {
    private readonly scene: Phaser.Scene;
    private readonly roomService: IRoomService;
    private mDisplay: FramesDisplay | DragonbonesDisplay;
    private mDecorateManager: DecorateManager;
    private mSprite: ISprite;
    constructor(scene: Phaser.Scene, roomService: IRoomService) {
        this.scene = scene;
        this.roomService = roomService;
        this.mDecorateManager = new DecorateManager(scene, roomService);
    }

    setElement(display: FramesDisplay | DragonbonesDisplay) {
        if (this.mDisplay) {
            this.mDisplay.hideRefernceArea();
            this.mDisplay.showNickname("");
            this.mDecorateManager.remove();
        }
        this.mDisplay = display;
        display.showRefernceArea();
        this.mDecorateManager.setElement(display);
        this.mDisplay = display;
        this.roomService.world.emitter.emit(MessageType.EDIT_PACKAGE_COLLAPSE);
    }

    setSprite(sprite: ISprite) {
        // this.mDisplay = new FramesDisplay(this.scene, this.roomService);
        const displayInfo = sprite.displayInfo;
        if (!displayInfo) {
            return;
        }
        this.mSprite = sprite;
        this.mDisplay = new FramesDisplay(this.scene, this.roomService);
        const pos = sprite.pos;
        this.mDisplay.x = pos.x;
        this.mDisplay.y = pos.y;
        this.mDisplay.once("initialized", () => {
            this.mDisplay.showRefernceArea();
            this.mDecorateManager.setElement(this.mDisplay);
            this.roomService.addToSurface(this.mDisplay);
            this.mDisplay.disableInteractive();

        });
        this.mDisplay.load(<FramesModel> sprite.displayInfo);
    }

    turnElement() {

    }

    remove() {
        this.mDecorateManager.remove();
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        this.roomService.world.emitter.emit(MessageType.EDIT_PACKAGE_EXPANED);
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

        // this.mLayerManager.depthSurfaceDirty = true;
    }

    get display(): FramesDisplay | DragonbonesDisplay {
        return this.mDisplay;
    }

    get sprite(): ISprite {
        return this.mSprite;
    }
}
