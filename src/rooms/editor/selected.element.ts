import {FramesDisplay} from "../display/frames.display";
import {DragonbonesDisplay} from "../display/dragonbones.display";
import {DynamicImage} from "../../ui/components/dynamic.image";
import {LayerManager} from "../layer/layer.manager";
import { Url } from "../../utils/resUtil";
import {Logger} from "../../utils/log";

export class SelectedElement {
    private mDisplay: FramesDisplay | DragonbonesDisplay;
    private mEffecte: DynamicImage;
    constructor(private mScene: Phaser.Scene, private mLayerManager: LayerManager) {
        Logger.getInstance().log("scene: ", this.mScene, this);
        this.mEffecte = new DynamicImage(this.mScene, 0, 0);
        this.mEffecte.load(Url.getRes("ui/editor/selectFlag.png"));
    }

    setElement(display: FramesDisplay | DragonbonesDisplay) {
        this.mDisplay = display;
        display.showRefernceArea();
        this.mLayerManager.addToSceneToUI(this.mEffecte);
        this.update();
    }

    remove() {
        if (!this.mEffecte) {
            return;
        }
        if (this.mEffecte.parentContainer) {
            this.mEffecte.parentContainer.remove(this.mEffecte);
        }
        this.mDisplay.hideRefernceArea();
        this.mDisplay = null;
    }

    update() {
        if (!this.mDisplay) {
            return;
        }
        const baseLoc = this.mDisplay.baseLoc;
        this.mEffecte.x = this.mDisplay.x + baseLoc.x;
        this.mEffecte.y = this.mDisplay.y + baseLoc.y;
    }

    setDisplayPos(x: number, y: number) {
        if (!this.mDisplay) {
            return;
        }
        this.mDisplay.x = x;
        this.mDisplay.y = y;
    }

    destroy() {
        if (!this.mEffecte) {
            return;
        }
        Logger.getInstance().log("destroy");
        this.remove();
        this.mEffecte.destroy();
    }

    get display(): FramesDisplay | DragonbonesDisplay {
        return this.mDisplay;
    }
}
