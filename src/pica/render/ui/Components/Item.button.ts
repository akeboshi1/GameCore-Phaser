import { ButtonEventDispatcher, DynamicImage } from "../../../../render/ui/components";
import { ClickEvent } from "apowophaserui";
import { UIAtlasName } from "picaRes";
import { IPos, UIHelper, Url } from "utils";
import { PicaItemTipsPanel } from "picaRender";
import { ICountablePackageItem } from "picaStructure";
export class ItemButton extends ButtonEventDispatcher {
    public itemData: ICountablePackageItem;
    protected dpr: number;
    protected zoom: number;
    protected itemIcon: DynamicImage;
    protected bg: Phaser.GameObjects.Image;
    protected selectbg: Phaser.GameObjects.Image;
    protected countTex: Phaser.GameObjects.Text;
    protected starImg: Phaser.GameObjects.Image;
    protected bgFrame: string = "bag_icon_common_bg";
    protected selectFrame: string = "bag_icon_select_bg";
    protected rarityFrame: string = "bag_icon_rare_bg";
    protected key: string;
    constructor(scene: Phaser.Scene, key: string, bg: string, dpr: number, zoom: number, enable: boolean) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.bgFrame = bg;
        this.key = key;
        this.bg = scene.make.image({ key, frame: bg });
        this.selectbg = scene.make.image({ key: UIAtlasName.uicommon, frame: this.selectFrame });
        this.setSize(this.selectbg.width, this.selectbg.height);
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.itemIcon.scale = this.dpr / this.zoom;
        this.countTex = this.scene.make.text({ text: "", style: UIHelper.blackStyle(dpr) })
            .setOrigin(1)
            .setPosition(this.width * 0.5 - 5 * dpr, this.height * 0.5 - 4 * dpr);
        this.starImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "bag_star_small_1" }).setOrigin(0);
        this.starImg.x = -this.width * 0.5 + 6 * dpr;
        this.starImg.y = -this.height * 0.5 + 6 * dpr;
        this.starImg.visible = false;
        this.add([this.selectbg, this.bg, this.itemIcon, this.starImg, this.countTex]);
        this.selectbg.visible = false;
        this.enable = enable;
        this.on(ClickEvent.Tap, this.onTabClickHandler, this);
    }

    public setStateFrames(bg: string, rarity: string) {
        this.bgFrame = bg;
        this.rarityFrame = rarity;
    }

    public setBGTexture(key: string, frame: string) {
        this.bg.setTexture(key, frame);
    }

    public setIconTexture(key: string, frame: string) {
        this.itemIcon.setTexture(key, frame);
    }

    public setItemData(itemData: ICountablePackageItem | any, alldisplay: boolean = false) {
        this.itemData = itemData;
        this.select = false;
        this.itemIcon.visible = false;
        this.starImg.visible = false;
        if (!itemData) {
            this.countTex.visible = false;
            this.bg.setTexture(this.key, this.bgFrame);
            return;
        }
        if (itemData.rarity === 5) {
            this.bg.setTexture(this.key, this.rarityFrame);
        } else {
            this.bg.setTexture(this.key, this.bgFrame);
        }
        const url = Url.getOsdRes(itemData.texturePath);
        this.itemIcon.load(url, this, () => {
            this.itemIcon.visible = true;
        });

        if (!alldisplay) {
            if (itemData.count > 1) {
                this.countTex.visible = true;
                this.countTex.setText(itemData.count.toString());
            } else {
                this.countTex.visible = false;
            }
        } else {
            this.countTex.visible = true;
            this.countTex.setText(itemData.count.toString());
        }
        if (itemData.grade > 0) {
            this.starImg.visible = true;
            const starFrame = "bag_star_small_" + itemData.grade;
            this.starImg.setFrame(starFrame);
        } else this.starImg.visible = false;
    }
    public set select(value) {
        this.selectbg.visible = value;
    }
    public set BGVisible(value) {
        this.bg.visible = value;
    }
    public set countTextColor(color: string) {
        this.countTex.style.color = color;
    }
    public set countTextOffset(pos: IPos) {
        this.countTex.setPosition(pos.x, pos.y);
    }

    public showTips() {
        this.onTabClickHandler();
    }
    protected onTabClickHandler() {
        if (!this.itemData) return;
        PicaItemTipsPanel.Inst.showTips(this, this.itemData);
    }
}
