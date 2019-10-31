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
        this.mEffecte = new DynamicImage(this.mScene, 0, 0);
        this.mEffecte.load(Url.getRes("ui/editor/selectFlag.png"));
    }

    setElement(display: FramesDisplay | DragonbonesDisplay) {
        this.mDisplay = display;
        this.mLayerManager.addToSceneToUI(this.mEffecte);
        this.setPosition();
    }

    remove() {
        if (!this.mEffecte) {
            return;
        }
        if (this.mEffecte.parentContainer) {
            this.mEffecte.parentContainer.remove(this.mEffecte);
        }
        this.mDisplay = null;
    }

    setPosition() {
        if (!this.mDisplay) {
            return;
        }
        const baseLoc = this.mDisplay.baseLoc;
        this.mEffecte.x = this.mDisplay.x + baseLoc.x;
        this.mEffecte.y = this.mDisplay.y + baseLoc.y;
    }

    destroy() {
        if (!this.mEffecte) {
            return;
        }
        this.mEffecte.destroy();
    }
}
