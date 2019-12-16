import {Panel} from "../components/panel";
import {NinePatch} from "../components/nine.patch";
import {Background, Border, Url} from "../../utils/resUtil";
import {Size} from "../../utils/size";
import {WorldService} from "../../game/world.service";

export class ElementStoragePanel extends Panel {
    private mWorld: WorldService;
    private mBackground: NinePatch;
    private mBorder: NinePatch;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
    }

    resize(oriention?: number) {
        const size: Size = this.mWorld.getSize();
        this.x = size.width >> 1;
        this.y = size.height - 200;
    }

    protected preload() {
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.image(Background.getName(), Background.getPNG());
        this.scene.load.atlas("element_storage", Url.getRes("ui/element_storage/element_storage_atlas.png"), Url.getRes("ui/element_storage/element_storage_atlas.json"));
        super.preload();
    }

    protected init() {
        if (!this.scene) {
            return;
        }

        this.mBackground = new NinePatch(this.scene, 0, 0, 683 >> 1, 901 >> 1, Background.getName(), null, Background.getConfig());
        this.mBorder = new NinePatch(this.scene, 7, 19, 655 >> 1, 847 >> 1, Border.getName(), null, Border.getConfig());
        this.add([this.mBackground, this.mBorder]);
        super.init();
        this.resize();
    }
}
