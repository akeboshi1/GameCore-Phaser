import {Panel} from "../components/panel";
import {NinePatch} from "../components/nine.patch";
import {Background, Border, Url} from "../../utils/resUtil";
import {Size} from "../../utils/size";
import {WorldService} from "../../game/world.service";
import InputText from "../../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import { NinePatchButton } from "../components/ninepatch.button";
import { CheckboxGroup } from "../components/checkbox.group";

export class ElementStoragePanel extends Panel {
    private mSearchInput: InputText;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    resize(oriention?: number) {
        const size: Size = this.mWorld.getSize();
        this.x = size.width - (this.width) - 10;
        this.y = size.height - this.height >> 1;
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

        const background = new NinePatch(this.scene, 0, 0, this.width, this.height, Background.getName(), null, Background.getConfig());
        const border = new NinePatch(this.scene, 7, 19, 655 >> 1, 847 >> 1, Border.getName(), null, Border.getConfig());
        background.x += background.width >> 1;
        background.y += background.height >> 1;

        border.x += border.width >> 1;
        border.y += border.height >> 1;

        // TODO 多语言配置
        this.mSearchInput = new InputText(this.scene, 40 + 105, 40,  210, 26,  {
            type: "input",
            fontSize: "14px",
            color: "#808080",
            placeholder: "输入关键词进行搜索"
        });

        const button = new NinePatchButton(this.scene, 0, 0, 60, 30, "button", "全部",  {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        });

        const button2 = new NinePatchButton(this.scene, 0, 100, 60, 30, "button", "全部2",  {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        });

        new CheckboxGroup().appendItemAll([button, button2]);

        this.add([background, border, this.mSearchInput, button, button2]);
        super.init();
        this.resize();
    }
}
