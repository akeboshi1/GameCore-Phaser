import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { i18n } from "../../i18n";
import { DynamicImage } from "../components/dynamic.image";
import { Handler } from "../../Handler/Handler";
import { Url } from "../../utils/resUtil";
import { AlertView } from "../components/alert.view";
import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText } from "apowophaserui";
export class PicElevatorPanel extends BasePanel {
    private key = "order_ui";
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private closeBtn: Button;
    private mGameGrid: GameGridTable;
    private content: Phaser.GameObjects.Container;
    private alertView: AlertView;
    // private itemsPanel: ItemsConsumeFunPanel;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.5);
        this.mBackground.fillRoundedRect(-this.x, -this.y, w, h);
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
        this.mGameGrid.resetMask();
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    }

    public show(param?: any) {
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

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off("pointerup", this.OnClosePanel, this);
    }

    preload() {
        this.addAtlas(this.key, "order/order.png", "order/order.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }
    init() {
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.mBackground.on("pointerup", this.OnClosePanel, this);
        this.add(this.mBackground);
        const conWdith = 295 * this.dpr;
        const conHeight = 405 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add(this.content);
        this.bg = new NineSlicePatch(this.scene, 0, 0, conWdith, conHeight, UIAtlasKey.commonKey, "bg", {
            left: 30 * this.dpr,
            top: 30 * this.dpr,
            bottom: 30 * this.dpr,
            right: 30 * this.dpr,
        });
        this.content.add(this.bg);
        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close", "close");
        this.closeBtn.setPosition(this.bg.width * 0.5 - this.dpr * 5, -this.bg.height * 0.5 + this.dpr * 5);
        this.content.add(this.closeBtn);
        const tableConfig = {
            x: 0,
            y: 0,
            table: {
                width: conWdith - 20 * this.dpr,
                height: conHeight - 30 * this.dpr,
                columns: 1,
                cellWidth: conWdith - 20 * this.dpr,
                cellHeight: 81 * this.dpr,
                reuseCellContainer: true,
                zoom: this.scale
            },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new ElevatorItem(this.scene, this.key, this.dpr);
                    cellContainer.setHandler(new Handler(this, this.onSendHandler));
                }
                cellContainer.setFloorData();
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", (cell) => {
            this.onSelectItemHandler();
        });
        this.content.add(this.mGameGrid);
        this.resize();
        super.init();
        this.setElevtorDataList();
    }

    public setElevtorDataList() {
        this.mGameGrid.setItems(new Array(60));
    }

    destroy() {
        super.destroy();
    }

    private OnClosePanel() {
        this.emit("hide");
    }

    private onSendHandler() {

    }
    private onSelectItemHandler() {

    }
}

class ElevatorItem extends Phaser.GameObjects.Container {
    private floorData: op_client.IPKT_Quest;
    private key: string;
    private dpr: number;
    private bg: DynamicImage;
    private namebg: NineSlicePatch;
    private nameTex: Phaser.GameObjects.Text;
    private levelbg: Phaser.GameObjects.Image;
    private levelTex: Phaser.GameObjects.Text;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.bg = new DynamicImage(scene, 0, 0);
        this.add(this.bg);
        this.setSize(268 * dpr, 81 * dpr);
        this.namebg = new NineSlicePatch(this.scene, 0, 0, 82 * dpr, 22 * dpr, UIAtlasKey.common2Key, "floor_title_bg", {
            left: 15 * this.dpr,
            top: 0 * this.dpr,
            right: 15 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.namebg.x = this.width * 0.5 - this.namebg.width * 0.5 - 10 * dpr;
        this.namebg.y = -this.height * 0.5 + this.namebg.height * 0.5 + 10 * dpr;
        this.add(this.namebg);
        this.nameTex = this.scene.make.text({
            x: this.namebg.x, y: this.namebg.y + 2 * this.dpr, text: "",
            style: { color: "#22E2FF", fontFamily: Font.DEFULT_FONT, bold: true, fontSize: 12 * this.dpr }
        }).setOrigin(0.5);
        this.add(this.nameTex);
        this.levelbg = this.scene.make.image({ key: UIAtlasKey.common2Key, frame: "floor_number_unlock" });
        this.levelbg.x = -this.width * 0.5 + this.levelbg.width * 0.5 + 5 * dpr;
        this.levelbg.y = this.height * 0.5 - this.levelbg.height * 0.5 + 5 * dpr;
        this.add(this.levelbg);
        this.levelTex = this.scene.make.text({
            x: this.levelbg.x, y: this.levelbg.y + 2 * this.dpr, text: "",
            style: { color: "#FAD555", fontFamily: Font.NUMBER, bold: true, fontSize: 17 * this.dpr }
        }).setOrigin(0.5); // .setStroke("#FAD555", 2);
        this.add(this.levelTex);
        this.setFloorData();
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    public setFloorData() {
        // this.floorData = data;
        const bool = true;
        if (bool) {
            this.levelbg.setFrame("floor_number_unlock");
            this.levelTex.setColor("#FAD555");
            this.nameTex.setColor("#22E2FF");
        } else {
            this.levelbg.setFrame("floor_number_lock");
            this.levelTex.setColor("#BDBDBD");
            this.nameTex.setColor("#DDDDDD");
        }
        this.levelTex.text = "1f";
        this.nameTex.text = "希尔顿酒店";
    }

    private onSendHandler() {
        if (this.sendHandler) this.sendHandler.run();
    }

}
