import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client, op_gameconfig } from "pixelpai_proto";
import { BasePanel } from "../components/BasePanel";
import { NinePatch } from "../components/nine.patch";
import { NinePatchButton } from "../components/ninepatch.button";
import { Url } from "../../utils/resUtil";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { Handler } from "../../Handler/Handler";
import { DetailDisplay } from "../Market/DetailDisplay";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/Scroller";
export class ComposePanel extends BasePanel {
    private key: string = "compose";
    private content: Phaser.GameObjects.Container;
    private world: WorldService;
    private mDetailDisplay: DetailDisplay;
    private mDetailBubble: DetailBubble;
    private materialCon: Phaser.GameObjects.Container;
    private materialGameScroll: GameScroller;
    private materialItemsCon: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.world = world;
    }

    resize(width: number, height: number) {
        super.resize(width, height);
        this.setSize(width, height);
    }

    show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.setInteractive();
        this.addListen();
    }

    addListen() {
        if (!this.mInitialized) return;
    }

    removeListen() {
        if (!this.mInitialized) return;
    }

    preload() {
        this.addAtlas(this.key, "compose/compose.png", "compose/compose.json");
        super.preload();
    }

    init() {
        const width = this.screenWidth;
        const height = this.screenHeight;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(width, height);
        this.add(this.content);
        const bg = this.scene.make.image({ key: this.key, frame: "main_bg" });
        this.content.add(bg);
        this.mDetailDisplay = new DetailDisplay(this.scene);
        this.mDetailDisplay.y = -30 * this.dpr;
        this.content.add(this.mDetailDisplay);
        this.mDetailBubble = new DetailBubble(this.scene, this.dpr);
        this.mDetailBubble.x = -width * 0.5;
        this.mDetailBubble.y = height * 0.5 - 60 * this.dpr;
        this.content.add(this.mDetailBubble);
        const composeBtn = new NinePatchButton(this.scene, width * 0.5 - 60 * this.dpr, height * 0.5 - 60 * this.dpr, 106 * this.dpr, 40 * this.dpr, this.key, "yellow_btn", "制作", {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });
        this.content.add(composeBtn);
        const materialConWdith = 360 * this.dpr, materialConHeight = 92 * this.dpr;
        this.materialCon = this.scene.make.container(undefined, false).setSize(materialConWdith, materialConHeight);
        this.content.add(this.materialCon);
        this.materialCon.setPosition(0, height * 0.5 - 50 * this.dpr);
        const materialbg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "sourcelist_bg" });
        const materialTitle = this.scene.make.text({
            x: 0,
            y: -materialConHeight * 0.5 + 8 * this.dpr,
            text: "合成所需材料",
            style: {
                color: "#ffffff",
                fontSize: 10 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                wordWrap: {
                    width: 90 * this.dpr,
                    useAdvancedWrap: true
                }
            }
        }, false);
        const materialLine = this.scene.make.image({ x: -10 * this.dpr, y: materialTitle.y, key: this.key, frame: "sourcelist_title_1" });
        const materialLine2 = this.scene.make.image({ x: 10 * this.dpr, y: materialTitle.y, key: this.key, frame: "sourcelist_title_1" });
        this.materialCon.add([materialbg, materialTitle, materialLine, materialLine2]);
        this.materialItemsCon = this.scene.make.container(undefined, false);
        this.materialItemsCon.setPosition(0, height * 0.5 - 40 * this.dpr);
        const zoom = this.scale;
        // this.materialGameScroll = new GameScroller(this.scene, this.materialItemsCon, {
        //     x: this.materialItemsCon.x - materialConWdith / 2,
        //     y: this.materialItemsCon.y - this.materialItemsCon.height / 2,
        //     clickX: width / 2,
        //     clickY: this.materialItemsCon.y - 20 * zoom,
        //     width: bottomWidth + 10 * this.dpr * zoom,
        //     height: this.mCategeoriesCon.height,
        //     value: -1,
        //     scrollMode: 1,
        //     bounds: [
        //         - bottomWidth / 2,
        //         bottomWidth / 2
        //     ],
        //     valuechangeCallback: (newValue) => {
        //         this.refreshPos(newValue);
        //     },
        //     cellupCallBack: (gameobject) => {
        //         this.onSelectSubCategoryHandler(gameobject);
        //     }
        // });
        this.resize(width, height);
        super.init();
    }

    destroy() {
        super.destroy();
    }

}

class DetailBubble extends Phaser.GameObjects.Container {
    private mDetailBubble: Phaser.GameObjects.Graphics;
    private mItemName: Phaser.GameObjects.Text;
    private mDesText: Phaser.GameObjects.Text;
    private dpr: number;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number = 1) {
        super(scene);
        this.dpr = dpr;
        this.mDetailBubble = this.scene.make.graphics(undefined, false);
        const bubbleW = 100 * dpr * zoom;
        const bubbleH = 96 * dpr * zoom;
        this.mDetailBubble = this.scene.make.graphics(undefined, false);
        this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
        this.mDetailBubble.fillRoundedRect(0, 0, bubbleW, bubbleH);
        this.mItemName = this.scene.make.text({
            x: 7 * this.dpr,
            y: 9 * this.dpr,
            text: "道具名称道具名称",
            style: {
                fontSize: 12 * this.dpr * zoom,
                fontFamily: Font.DEFULT_FONT,
                color: "#FFFF00",
                align: "center"
            }
        });
        this.mDesText = this.scene.make.text({
            x: 8 * dpr,
            y: 66 * dpr,
            style: {
                color: "#32347b",
                fontSize: 10 * dpr * zoom,
                fontFamily: Font.DEFULT_FONT,
                wordWrap: {
                    width: 90 * dpr,
                    useAdvancedWrap: true
                }
            }
        }, false);
        this.add([this.mDetailBubble, this.mItemName, this.mDesText]);
        this.setSize(bubbleW, bubbleH);
    }
    setProp(prop: op_client.ICountablePackageItem): this {
        this.mItemName.setText(prop.shortName || prop.name);
        let posY = 9 * this.dpr;
        const offsetY = 21 * this.dpr;
        if (prop.des) {
            posY += offsetY;
            this.mDesText.setText(prop.des);
            this.mDesText.y = posY;
        } else {
            this.mDesText.setText("");
        }
        this.resize();
        return this;
    }

    private resize(w?: number, h?: number) {
        if (w === undefined) w = this.width;
        const bubbleH = this.mDesText.height + 60 * this.dpr;
        if (w === this.width && bubbleH === this.height) {
            return;
        }
        this.mDetailBubble.clear();
        this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
        this.mDetailBubble.fillRoundedRect(0, 0, w, bubbleH);

        this.setSize(w, bubbleH);
        // this.mDetailBubbleContainer.y = this.height - this.y - this.mDetailBubbleContainer.height - 6 * this.dpr;
    }
}

class ComposeItem extends Phaser.GameObjects.Container {
    private readonly dpr: number;
    private readonly key: string;
    private minecarBtn: Button;
    private teximg: Phaser.GameObjects.Image;
    private clickHandler: Handler;
    private popData: any;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        const minecarbg = this.scene.make.image({ key: this.key, frame: "minebag_bg" });
        this.minecarBtn = new Button(this.scene, this.key, "minecar", "minecar");
        this.minecarBtn.setPosition(-12 * dpr, -this.minecarBtn.height * 0.5);
        this.teximg = this.scene.make.image({ key: this.key, frame: "text_minebag" });
        this.teximg.setPosition(this.minecarBtn.x, 2 * dpr);
        this.add([minecarbg, this.minecarBtn, this.teximg]);
        this.minecarBtn.on("Tap", this.onClickHandler, this);
        this.setSize(minecarbg.width, minecarbg.height);
    }
    public setClickHandler(handler: Handler) {
        this.clickHandler = handler;
    }
    public setPopData(data: any) {
        this.popData = data;
    }
    private onClickHandler() {
        if (this.clickHandler) this.clickHandler.runWith(this.popData);
    }
}
class ComposeMaterialItem extends Phaser.GameObjects.Container {
    private readonly dpr: number;
    private readonly key: string;
    private minecarBtn: Button;
    private teximg: Phaser.GameObjects.Image;
    private clickHandler: Handler;
    private popData: any;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        const minecarbg = this.scene.make.image({ key: this.key, frame: "minebag_bg" });
        this.minecarBtn = new Button(this.scene, this.key, "minecar", "minecar");
        this.minecarBtn.setPosition(-12 * dpr, -this.minecarBtn.height * 0.5);
        this.teximg = this.scene.make.image({ key: this.key, frame: "text_minebag" });
        this.teximg.setPosition(this.minecarBtn.x, 2 * dpr);
        this.add([minecarbg, this.minecarBtn, this.teximg]);
        this.minecarBtn.on("Tap", this.onClickHandler, this);
        this.setSize(minecarbg.width, minecarbg.height);
    }
    public setClickHandler(handler: Handler) {
        this.clickHandler = handler;
    }
    public setPopData(data: any) {
        this.popData = data;
    }
    private onClickHandler() {
        if (this.clickHandler) this.clickHandler.runWith(this.popData);
    }
}
