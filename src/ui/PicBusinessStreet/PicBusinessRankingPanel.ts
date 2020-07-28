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
import { Logger } from "../../utils/log";

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

    public setRankingData() {
        const item0 = this.scene.make.container(undefined, false);
        item0.setSize(65 * this.dpr, 185 * this.dpr);
        this.gameScroll.addItem(item0);
        for (let i = 0; i < 10; i++) {
            const item = new PicRankingItem(this.scene, 0, 0, 133 * this.dpr, 185 * this.dpr, this.key, this.key2, this.dpr, this.zoom);
            this.gameScroll.addItem(item);
        }
        const item1 = this.scene.make.container(undefined, false);
        item1.setSize(65 * this.dpr, 185 * this.dpr);
        this.gameScroll.addItem(item1);
        this.gameScroll.Sort();
        this.gameScroll.refreshMask();
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
        const mfont = `bold ${20 * this.dpr}px ${Font.BOLD_FONT}`;
        const titleText = this.scene.make.text({ x: 0, y: posy + 20 * this.dpr, text: i18n.t("business_street.ranking_list"), style: { font: mfont, bold: true, color: "#FFC51A" } }).setOrigin(0.5);
        titleText.setStroke("#553100", 2 * this.dpr);
        this.add(titleText);
        this.titleText = titleText;
        const titleLine = this.scene.make.image({ x: 0, y: titleText.y + titleText.height * 0.5 + 10 * this.dpr, key: this.key2, frame: "title" });
        this.add(titleLine);
        const scrollwidth = this.width - 28 * this.dpr;
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
            space: 20 * this.dpr,
            valuechangeCallback: (value) => {
                this.onScrollValueChange(value);
            },
            celldownCallBack: (gameobject) => {
                this.onScrollClickHandler();
            }
        });
        this.add(this.gameScroll);
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
    private bg: Phaser.GameObjects.Image;
    private storebg: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, key2: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.setSize(width, height);
        const posx = -this.width * 0.5;
        const posy = -this.height * 0.5;
        this.bg = this.scene.make.image({ key: this.key2, frame: "ranking_res_bg_s" });
        this.add(this.bg);
        this.titleText = this.scene.make.text({ x: posx, y: posy, text: "Restaurant", style: { color: "##0555AF", fontSize: 14 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.add(this.titleText);
        this.storebg = this.scene.make.image({ key: this.key2, frame: "store_name_bg_s" });
        this.storebg.y = this.titleText.y + 10 * dpr;
        this.add(this.storebg);
        this.storeName = this.scene.make.text({ x: 0, y: this.storebg.y, text: "Restaurant", style: { color: "#0", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.add(this.storeName);
        this.storeIcon = this.scene.make.image({ key: this.key2, frame: "ranking_res_s" });
        this.storeIcon.y = -posy - this.storeIcon.height * 0.5 - 5 * dpr;
        this.add(this.storeIcon);
        this.switchImage(1);
    }

    public setStoreData(data) {

    }
    /**
     * @param type  1  小图片 2  大图片
     */
    public switchImage(type: number) {
        const imgname = "ranking_res";
        let bgres, titleFont, storebgres, storefont, storeiconres, ratio;
        const smallWidth = this.scene.textures.getFrame(this.key2, imgname + "_bg_s").realWidth;
        if (type === 1) {
            bgres = imgname + "_bg_s";
            titleFont = 12 * this.dpr;
            storebgres = "store_name_bg_s";
            storefont = 8 * this.dpr;
            storeiconres = imgname + "_s";
        } else {
            bgres = imgname + "_bg_m";
            titleFont = 14 * this.dpr;
            storebgres = "store_name_bg_m";
            storefont = 12 * this.dpr;
            storeiconres = imgname + "_m";
        }
        const curWidth = this.scene.textures.getFrame(this.key2, bgres).realWidth;
        ratio = curWidth / smallWidth;

        this.bg.setFrame(bgres);
        this.titleText.setFontSize(titleFont);
        this.storebg.setFrame(storebgres);
        this.storeName.setFontSize(storefont);
        this.storeIcon.setFrame(storeiconres);
        this.setSize(this.bg.width, this.bg.height);
        this.titleText.y = -this.height * 0.5 + this.titleText.height * 0.5 + 10 * this.dpr * ratio;
        this.storebg.y = this.titleText.y + this.titleText.height * 0.5 + 10 * this.dpr * ratio;
        this.storeName.y = this.storebg.y;
        this.storeIcon.y = this.height * 0.5 - this.storeIcon.height * 0.5 - 10 * this.dpr * ratio;
    }

}
