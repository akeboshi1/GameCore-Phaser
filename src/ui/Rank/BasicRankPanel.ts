import { Panel } from "../components/panel";
import { op_client } from "pixelpai_proto";
import { Background, Border, Url } from "../../utils/resUtil";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import {NinePatch} from "../components/nine.patch";

export class BasicRankPanel extends Panel {
    protected mWorld: WorldService;
    protected mContentContainer: Phaser.GameObjects.Container;
    protected mTitleLabel: Phaser.GameObjects.Text;
    protected mTexts: Phaser.GameObjects.Text[] = [];
    protected mBackground: NinePatch;
    protected mData: any;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
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

        const locX = [12, 60, 238];
        for (let i = 1; i < 4; i++) {
            const text = this.scene.make.text({
                x: locX[i - 1],
                y: 27,
                text: texts[i].text,
                style: { font: Font.YAHEI_16_BOLD }
            }, false);
            text.setData("node", texts[i].node);
            text.setStroke("#000000", 2);
            this.mContentContainer.add(text);
            this.mTexts.push(text);
        }

        for (let i = 4; i < texts.length; i++) {
            const t = texts[i];
            const x = (i - 4) % 3;
            const y = Math.floor((i - 4) / 3) * 27;
            const text = this.scene.make.text({
                x: locX[x],
                y: 60 + y,
                text: t.text,
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
        this.scene.load.atlas("rank_atlas", Url.getRes("ui/rank/rank_atlas.png"), Url.getRes("ui/rank/rank_atlas.json"));
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        this.setSize(328, 361);

        // this.mBackground = new NinePatch(this.scene, {
        //     x: 0,
        //     y: 0,
        //     width: 328,
        //     height: 361,
        //     key: Background.getName(),
        //     columns: Background.getColumns(),
        //     rows: Background.getRows()
        // }).setOrigin(0, 0);
        // this.add(this.mBackground);

        this.mBackground = new NinePatch(this.scene, 0, 180, 328, 361, Background.getName(), null, Background.getConfig());
        this.mBackground.x = this.mBackground.width >> 1;
        this.mBackground.y = this.mBackground.height >> 1;
        this.add(this.mBackground);

        this.mContentContainer = this.scene.make.container({}, false);
        this.add(this.mContentContainer);

        const border = new NinePatch(this.scene, 8, 20, 315, 318, Border.getName(), null, Border.getConfig());
        border.x =  8 + (border.width >> 1);
        border.y = 20 + (border.height >> 1);
        this.mContentContainer.add(border);

        // const border = new NinePatch(this.scene, {
        //     x: 8,
        //     y: 20,
        //     width: 315,
        //     height: 318,
        //     key: Border.getName(),
        //     columns: Border.getColumns(),
        //     rows: Border.getRows()
        // }).setOrigin(0, 0);
        // this.mContentContainer.add(border);

        const titleIcon = this.scene.make.image({
            x: 20,
            y: -15,
            key: "rank_atlas",
            frame: "icon.png",
        }, false).setOrigin(0, 0);
        this.add(titleIcon);

        this.mTitleLabel = this.scene.make.text({
            x: 54,
            text: "排行榜",
            style: { font: Font.YAHEI_20_BOLD }
        })
            .setOrigin(0, 0.5)
            .setStroke("#000000", 2);
        this.add(this.mTitleLabel);
        super.init();

        const items = this.getData("data");
        if (items) this.addItem(items);

    }

    protected clearText() {
        for (const text of this.mTexts) {
            text.destroy();
        }
        this.mTexts.length = 0;
    }
}
