import {Panel} from "../components/panel";
import {NinePatch} from "../components/nine.patch";
import {Background, Border, Url} from "../../utils/resUtil";
import {Size} from "../../utils/size";
import {WorldService} from "../../game/world.service";

export class ElementStoragePanel extends Panel {
    private mBackground: NinePatch;
    private mBorder: NinePatch;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    resize(oriention?: number) {
        const size: Size = this.mWorld.getSize();
        this.x = size.width - this.width - 20;
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
        this.setSize(683 >> 1, 901 >> 1);

        this.mBackground = new NinePatch(this.scene, 0, 0, this.width, this.height, Background.getName(), null, Background.getConfig());
        this.mBorder = new NinePatch(this.scene, 7, 19, 655 >> 1, 847 >> 1, Border.getName(), null, Border.getConfig());
        this.mBackground.x -= this.mBackground.width >> 1;
        this.mBackground.y -= this.mBackground.height >> 1;

        this.mBorder.x -= this.mBorder.width >> 1;
        this.mBorder.y -= this.mBorder.height >> 1;
        this.add([this.mBackground, this.mBorder]);
        super.init();
        this.resize();
    }
}
