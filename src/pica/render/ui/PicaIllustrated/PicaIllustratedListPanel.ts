import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText } from "apowophaserui";
import { AlignmentType, AxisType, ButtonEventDispatcher, ConstraintType, DynamicImage, GridLayoutGroup } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, TimeUtils, UIHelper, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
export class PicaIllustratedListPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private gridLayout: GridLayoutGroup;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
    }
    resize(width?: number, height?: number) {
        const w = width || this.width;
        const h = height || this.height;
        this.setSize(w, h);
    }

    setHandler(send: Handler) {
        this.send = send;
    }

    init() {

        const conWidth = 305 * this.dpr, conHeight = 330 * this.dpr;
        this.gridLayout = new GridLayoutGroup(this.scene, conWidth, conHeight, {
            cellSize: new Phaser.Math.Vector2(304 * this.dpr, 96 * this.dpr),
            space: new Phaser.Math.Vector2(0, 21 * this.dpr),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 1,
            alignmentType: AlignmentType.UpperCenter
        });
        this.add(this.gridLayout);
        this.resize();
    }

    public setListData() {
        const datas = this.getListData();
        for (const data of datas) {
            const item = new IllustratedItem(this.scene, 304 * this.dpr, 96 * this.dpr, this.dpr, this.zoom);
            item.setDisplayData(data);
            this.gridLayout.add(item);
        }
        this.gridLayout.Layout();
    }

    private getListData() {
        const send = new Handler(this, this.onSelectItemHandler);
        const temp1: IllustratedItemData = {
            bg: "illustrate_furniture_bg",
            left: "illustrate_furniture_picture",
            textImg: "illustrate_furniture_title",
            text: i18n.t("illustrate.furin"),
            textColor: "#0C6DA3",
            send,
            tag: "gallary"
        };
        const temp2: IllustratedItemData = {
            bg: "illustrate_dress_bg",
            left: "illustrate_dress_picture",
            textImg: "illustrate_dress_title",
            text: i18n.t("illustrate.avatar"),
            textColor: "#AC202E",
            send,
            tag: "avatar"
        };
        const temp3: IllustratedItemData = {
            bg: "illustrate_make_bg",
            left: "illustrate_make_picture",
            textImg: "illustrate_make_title",
            text: i18n.t("illustrate.make"),
            textColor: "#3027A1",
            send,
            tag: "make"
        };
        const datas = [temp1, temp3];
        return datas;
    }

    private onSelectItemHandler(tag: string) {
        if (this.send) this.send.runWith([tag]);
    }
}

class IllustratedItem extends ButtonEventDispatcher {
    private bg: Phaser.GameObjects.Image;
    private leftImg: Phaser.GameObjects.Image;
    private textImg: Phaser.GameObjects.Image;
    private textTex: Phaser.GameObjects.Text;
    private zoom: number;
    private tag: string;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.bg = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_furniture_bg" });
        this.leftImg = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_furniture_picture" });
        this.textImg = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_furniture_title" });
        this.textTex = this.scene.make.text({ style: UIHelper.colorStyle("#0C6DA3", 12 * dpr) }).setOrigin(0.5);
        this.leftImg.x = -this.leftImg.width * 0.5;
        this.leftImg.y = 9 * dpr;
        this.textImg.x = this.width * 0.25;
        this.textImg.y = -this.textImg.height * 0.5;
        this.textTex.x = this.textImg.x;
        this.textTex.y = this.textImg.y + this.textImg.height * 0.5 + 13 * dpr;
        this.add([this.bg, this.leftImg, this.textImg, this.textTex]);
        this.on(ClickEvent.Tap, this.onClickHandler, this);
        this.enable = true;
    }

    public setDisplayData(data: IllustratedItemData) {
        this.bg.setFrame(data.bg);
        this.leftImg.setFrame(data.left);
        this.textImg.setFrame(data.textImg);
        this.textTex.text = data.text;
        this.textTex.setColor(data.textColor);
        this.tag = data.tag;
        this.send = data.send;
    }

    private onClickHandler() {
        if (this.send) this.send.runWith(this.tag);
    }
}

interface IllustratedItemData {
    bg: string;
    left: string;
    textImg: string;
    text: string;
    textColor: string;
    tag: string;
    send: Handler;
}