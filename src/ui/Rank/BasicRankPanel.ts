import { BasePanel } from "../components/BasePanel";
import { op_client } from "pixelpai_proto";
import { Background, Border, Url } from "../../utils/resUtil";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { NinePatch } from "../components/nine.patch";

export class BasicRankPanel extends BasePanel {
    protected mWorld: WorldService;
    protected mContentContainer: Phaser.GameObjects.Container;
    protected mTitleLabel: Phaser.GameObjects.Text;
    protected mTexts: Phaser.GameObjects.Text[] = [];
    protected mBackground: NinePatch;
    protected mData: any;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.mWorld = world;
    }

    public addItem(items: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        this.setData("data", items);
        if (!this.mInitialized) return;
        this.clearText();
        const texts = items.text;
        if (!texts || texts.length < 1) return;
        if (this.mTitleLabel) {
            this.mTitleLabel.setText(texts[0].text);
            this.mTitleLabel.setData("node", texts[0].node);
        }

        const locX = [-this.mWidth / 2 + 15, -this.mWidth / 2 + 63, -this.mWidth / 2 + 241];
        let tmpY: number = 0;
        for (let i = 1; i < 4; i++) {
            const text = this.scene.make.text({
                x: locX[i - 1],
                y: -this.mHeight / 2 + 22,
                text: texts ? texts[i].text : "123",
                style: { font: Font.YAHEI_16_BOLD }
            }, false);
            tmpY = text.y;
            text.setData("node", texts[i].node);
            text.setStroke("#000000", 2);
            this.mContentContainer.add(text);
            this.mTexts.push(text);
        }
        tmpY += 20;
        for (let i = 4; i < texts.length; i++) {
            const t = texts[i];
            const x = (i - 4) % 3;
            const y = Math.floor((i - 4) / 3) * 22; // Math.floor((i - 4) / 3) * (-this.mHeight / 2 + 42);
            const text = this.scene.make.text({
                x: locX[x],
                y: tmpY + y,
                text: t ? t.text : "123",
                style: { font: Font.YAHEI_14_BOLD }
            }, false);
            if (x === 0) {
                // todo center
            }
            text.setData("node", t.node);
            text.setStroke("#000000", 2);
            this.mContentContainer.add(text);
            this.mTexts.push(text);
        }
    }

    public tweenView(show: boolean) {
    }

    update(param: any) {
        this.addItem(param);
    }

    public destroy() {
        if (this.mBackground) this.mBackground.destroy();
        const len: number = this.mTexts.length;
        for (let i: number = 0; i < len; i++) {
            let text: Phaser.GameObjects.Text = this.mTexts[i];
            if (!text) continue;
            text.destroy(true);
            text = null;
        }
        if (this.mTitleLabel) this.mTitleLabel.destroy(true);
        if (this.mContentContainer) this.mContentContainer.destroy(true);
        this.mContentContainer = null;
        this.mTexts = [];
        this.mData = null;
        this.mBackground = null;
        this.mTitleLabel = null;
        this.mWorld = null;
        super.destroy();
    }

    protected preload() {
        this.scene.load.image(Background.getName(), Background.getPNG());
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.mScene.load.atlas("clsBtn", Url.getRes("ui/common/common_clsBtn.png"), Url.getRes("ui/common/common_clsBtn.json"));
        this.scene.load.atlas("rank_atlas", Url.getRes("ui/rank/rank_atlas.png"), Url.getRes("ui/rank/rank_atlas.json"));
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        this.mWidth = 328;
        this.mHeight = 361;
        this.setSize(this.mWidth, this.mHeight);
        this.mBackground = new NinePatch(this.scene, 0, 0, 328, 361, Background.getName(), null, Background.getConfig());
        this.add(this.mBackground);
        this.mContentContainer = this.scene.make.container({}, false);
        this.add(this.mContentContainer);
        const border = new NinePatch(this.scene, 0, 0, 315, 318, Border.getName(), null, Border.getConfig());
        this.mContentContainer.add(border);
        const titleIcon = this.scene.make.image({
            x: -this.mWidth / 2 + 20,
            y: -this.mHeight / 2 - 12,
            key: "rank_atlas",
            frame: "icon.png",
        }, false).setOrigin(0, 0);
        this.add(titleIcon);
        this.mTitleLabel = this.scene.make.text({
            x: -this.mWidth / 2 + 54,
            y: -this.mHeight / 2 - 10,
            text: "排行榜",
            style: { font: Font.YAHEI_20_BOLD }
        })
            .setOrigin(0, 0)
            .setStroke("#000000", 2);
        this.add(this.mTitleLabel);
        super.init();
    }

    protected clearText() {
        for (const text of this.mTexts) {
            text.destroy();
        }
        this.mTexts.length = 0;
    }
}
