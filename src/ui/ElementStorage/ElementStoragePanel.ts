import {Panel} from "../components/panel";
import {NinePatch} from "../components/nine.patch";
import {Background, Border, Url} from "../../utils/resUtil";

export class ElementStoragePanel extends Panel {
    private mBackground: NinePatch;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    protected preload() {
        this.scene.load.atlas("element_storage", Url.getRes("ui/element_storage/element_storage_atlas.png"), Url.getRes("ui/element_storage/element_storage_atlas.json"));
        super.preload();
    }

    protected init() {
        if (this.scene) {
            return;
        }

        this.mBackground = new NinePatch(this.scene, 0, 0, 983, 901, Background.getName(), null, Background.getConfig());
        this.add(this.mBackground);
        super.init();
    }
}
