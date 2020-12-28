import { ButtonEventDispatcher, DynamicImage } from "../../../../render/ui/components";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { BBCodeText, ClickEvent } from "apowophaserui";
import { UIAtlasName } from "picaRes";
import { UIHelper, Url } from "utils";
import { PicaItemTipsPanel } from "picaRender";
export class ItemButton extends ButtonEventDispatcher {
    public itemData: op_client.ICountablePackageItem;
    protected dpr: number;
    protected zoom: number;
    private bg: Phaser.GameObjects.Image;
    private selectbg: Phaser.GameObjects.Image;
    private itemIcon: DynamicImage;
    private countTex: Phaser.GameObjects.Text;
    private starImg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number, enable: boolean) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.bg = scene.make.image({ key: UIAtlasName.uicommon, frame: "bag_icon_common_bg" });
        this.selectbg = scene.make.image({ key: UIAtlasName.uicommon, frame: "bag_icon_common_bg" });
        this.setSize(this.bg.width, this.bg.height);
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.itemIcon.scale = this.dpr / this.zoom;
        this.countTex = this.scene.make.text({ text: "", style: UIHelper.blackStyle(dpr) })
            .setOrigin(1).setPadding(2 * dpr, 2 * dpr, 2 * dpr, 2 * dpr)
            .setPosition(this.width * 0.5 - dpr, this.height * 0.5);
        this.starImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "bag_star_small_1" }).setOrigin(0);
        this.starImg.x = -this.width * 0.5 + 2 * dpr;
        this.starImg.y = -this.height * 0.5 + 2 * dpr;
        this.add([this.bg, this.itemIcon, this.starImg, this.countTex]);
        this.enable = enable;
        this.on(ClickEvent.Tap, this.onTabClickHandler, this);
    }

    public setItemData(itemData: op_client.ICountablePackageItem) {
        this.itemData = itemData;
        this.isSelect = false;
        this.itemIcon.visible = false;
        this.starImg.visible = false;
        if (!itemData) {
            this.countTex.visible = false;
            return;
        }
        const bgFrame = itemData.rarity === 5 ? "bag_icon_rare_bg" : "bag_icon_common_bg";
        this.bg.setFrame(bgFrame);
        const url = Url.getOsdRes(itemData.display.texturePath);
        this.itemIcon.load(url, this, () => {
            this.itemIcon.visible = true;
        });
        if (itemData.count > 1) {
            this.countTex.visible = true;
            this.countTex.setText(itemData.count.toString());
        } else {
            this.countTex.visible = false;
        }
        if (itemData.grade > 0) {
            this.starImg.visible = true;
            const starFrame = "bag_star_small_" + itemData.grade;
            this.starImg.setFrame(starFrame);
        } else this.starImg.visible = false;
    }
    public set isSelect(value) {
        this.selectbg.visible = value;
    }
    protected onTabClickHandler() {
        PicaItemTipsPanel.Inst.showTips(this, this.itemData);
    }
}
