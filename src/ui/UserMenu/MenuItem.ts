import { IPatchesConfig } from "../components/patches.config";
import { NinePatch, NineSliceButton } from "apowophaserui";
import { Border } from "../../utils/resUtil";

export class MenuItem extends NineSliceButton {
    protected mMenus: MenuItem[];
    protected mChild: Phaser.GameObjects.Container;
    protected mArrow: Phaser.GameObjects.Image;
    protected mBackground: NinePatch;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, text: string, config: IPatchesConfig) {
        super(scene, x, y, width, height, key, "", text, 1, 1, config);
    }

    public appendItem(menu: MenuItem) {
        if (!this.mChild) {
            this.mMenus = [];
            this.mChild = this.scene.make.container(undefined, false);
            // this.mChild.x = 42;
            this.mArrow = this.scene.make.image({
                x: this.width * this.originX - 3,
                key: "usermenu_arrow"
            });
            this.add(this.mArrow);
            this.mBackground = new NinePatch(this.scene, 0, 0, 0, 0, Border.getName(), null, undefined, undefined, Border.getConfig());
        }

        this.mChild.add(menu);
        this.mMenus.push(menu);

        this.mBackground.resize(74, this.mMenus.length * 32);
        this.mBackground.x = this.mBackground.width;
        this.mBackground.y = this.mBackground.height / 2 - 32 / 2;
        this.mChild.addAt(this.mBackground, 0);
        this.mChild.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mBackground.width, this.mBackground.height), Phaser.Geom.Rectangle.Contains);
    }

    public show() {
        this.add(this.mChild);
    }

    public destroy(fromScene?: boolean): void {
        if (this.mMenus) {
            const len: number = this.mMenus.length;
            for (let i: number = 0; i < len; i++) {
                let item: MenuItem = this.mMenus[i];
                if (!item) continue;
                item.destroy(true);
                item = null;
            }
            this.mMenus = [];
        }
        if (this.mBackground) {
            this.mBackground.destroy();
            this.mBackground = null;
        }
        if (this.mChild) {
            this.mChild.destroy(true);
            this.mChild = null;
        }
        if (this.mArrow) {
            this.mArrow.destroy(true);
            this.mArrow = null;
        }
        super.destroy();
    }

    get menus(): MenuItem[] {
        return this.mMenus || [];
    }
}
