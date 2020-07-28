import { Font } from "../../utils/font";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { Handler } from "../../Handler/Handler";
import { DynamicImage } from "../components/dynamic.image";
import { NineSlicePatch } from "../../../lib/rexui/lib/ui/ui-components";
import { UIAtlasKey } from "../ui.atals.name";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
import { i18n } from "../../i18n";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";

export class PicBusinessRankingPanel extends Phaser.GameObjects.Container {
    private titleText: Phaser.GameObjects.Text;
    private gameScroll: GameScroller;
    private dpr: number;
    private key: string;
    private key2: string;
    private zoom: number;
    private backHandler: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, key2: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }

    public setHistoryeData() {
        const arr = new Array(10);
        this.gameScroll.addItems(arr);
    }

    public setHandler(back: Handler) {
        this.backHandler = back;
    }

    public resetMask() {
        this.gameScroll.refreshMask();
    }

    protected create() {
        const posy = -this.height * 0.5;
        const posx = -this.width * 0.5;
        const mfont = `bold ${13 * this.dpr}px ${Font.BOLD_FONT}`;
        const titleText = this.scene.make.text({ x: posx + 30 * this.dpr, y: posy + 6 * this.dpr, text: i18n.t("business_street.ranking_list"), style: { font: mfont, bold: true, color: "#FFC51A" } }).setOrigin(0, 0.5);
        titleText.setStroke("#553100", 2 * this.dpr);
        this.add(titleText);
        this.titleText = titleText;
        const titleLine = this.scene.make.image({ x: 0, y: titleText.y + 10 * this.dpr, key: this.key2, frame: "title" });
        this.add(titleLine);
        const scrollwidth = this.width;
        const scrollHeight = this.height - 80 * this.dpr;
        const scrollY = posy + 33 * this.dpr + scrollHeight * 0.5;
        this.gameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 0,
            width: scrollwidth,
            height: scrollHeight,
            zoom: this.scale,
            align: 2,
            orientation: 1,
            valuechangeCallback: (value) => {
                this.onScrollValueChange(value);
            },
            celldownCallBack: (gameobject) => {
                this.onScrollClickHandler();
            }
        });

        const backBtn = new NineSliceButton(this.scene, 0, this.height * 0.5 - 15 * this.dpr, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "red_btn", i18n.t("business_street.back"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(backBtn);
        backBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#ffffff" });
        backBtn.on(CoreUI.MouseEvent.Tap, this.onBackHandler, this);
    }

    private onScrollValueChange(value: number) {

    }

    private onScrollClickHandler() {

    }

    private onBackHandler() {
        if (this.backHandler) this.backHandler.run();
    }
}

class PicRankingItem extends Phaser.GameObjects.Container {
    public storeData: any;
    private key: string;
    private key2: string;
    private dpr: number;
    private titleText: Phaser.GameObjects.Text;
    private storeName: Phaser.GameObjects.Text;
    private storeIcon: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, key2: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.setSize(width, height);
        const posx = -this.width * 0.5;
        const posy = -this.height * 0.5;
        const bg = this.scene.make.image({ key: this.key2, frame: "ranking_bg_b_s" });
        this.add(bg);
        this.titleText = this.scene.make.text({ x: posx, y: posy, text: "Restaurant", style: { color: "#ffffff", fontSize: 10 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.storeIcon = this.scene.make.image({ key: this.key2, frame: "" });
        this.add(this.storeIcon);
        this.storeName = this.scene.make.text({ x: 0, y: posy + 10 * dpr, text: "Restaurant", style: { color: "#FFE11A", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.storeName);
    }

    public setStoreData(data) {

    }

}
