import { FramesDisplay } from "../display/frames.display";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { DynamicImage } from "../../ui/components/dynamic.image";
import { LayerManager } from "../layer/layer.manager";
import { Url } from "../../utils/resUtil";
import { Logger } from "../../utils/log";
import { ISprite } from "../element/sprite";

export class SelectedElement {
    private mDisplay: FramesDisplay | DragonbonesDisplay;
    private mEffecte: DynamicImage;
    private mSelecting: boolean;
    private mSprite: ISprite;
    private mDisplayHeight: number = 0;
    constructor(private mScene: Phaser.Scene, private mLayerManager: LayerManager) {
        this.mEffecte = new DynamicImage(this.mScene, 0, 0);
        this.mEffecte.load(Url.getRes("ui/editor/selectFlag.png"));
    }

    setElement(display: FramesDisplay | DragonbonesDisplay) {
        if (this.mDisplay) {
            this.mDisplay.hideRefernceArea();
            this.mDisplay.showNickname("");
            this.mSprite = undefined;
        }
        this.mDisplay = display;
        display.showRefernceArea();
        this.mDisplayHeight = this.mDisplay.spriteHeight;
        const ele = display.element;
        if (ele) {
            ele.showNickname();
            this.mSprite = ele.model;
        }
        this.mLayerManager.addToSceneToUI(this.mEffecte);
        this.mSelecting = true;
        this.update();
    }

    remove() {
        this.mSelecting = false;
        if (!this.mEffecte) {
            return;
        }
        if (this.mEffecte.parentContainer) {
            this.mEffecte.parentContainer.remove(this.mEffecte);
        }
        if (!this.mDisplay) {
            return;
        }
        if (this.mDisplay.parentContainer) {
            this.mDisplay.hideRefernceArea();
            this.mDisplay.showNickname("");
        }
        this.mDisplay = null;
        this.mSprite = undefined;
    }

    update() {
        if (!this.mDisplay) {
            return;
        }
        const baseLoc = this.mDisplay.baseLoc;
        this.mEffecte.x = this.mDisplay.x + baseLoc.x;
        this.mEffecte.y = this.mDisplay.y + baseLoc.y - (this.mDisplayHeight >> 1);
    }

    setDisplayPos(x: number, y: number) {
        if (!this.mDisplay) {
            return;
        }
        this.mDisplay.x = x;
        this.mDisplay.y = y;
        if (this.mSprite) {
            const pos = this.mSprite.pos;
            if (pos) {
                pos.x = x;
                pos.y = y;
            }
        }
    }

    destroy() {
        if (!this.mEffecte) {
            return;
        }
        this.remove();
        this.mEffecte.destroy();
        this.mEffecte = null;
    }

    get display(): FramesDisplay | DragonbonesDisplay {
        return this.mDisplay;
    }

    set selecting(val: boolean) {
        this.mSelecting = val;
    }

    /**
     * 鼠标按下选中物件, 松开取消选择
     */
    get selecting(): boolean {
        return this.mSelecting;
    }

    get sprite() {
        return this.mSprite;
    }
}
