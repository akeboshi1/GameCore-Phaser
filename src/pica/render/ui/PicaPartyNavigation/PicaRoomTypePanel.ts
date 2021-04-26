import { GameScroller, NineSliceButton } from "apowophaserui";
import { DynamicImage } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, UIHelper, Url } from "utils";

export class PicaRoomTypePanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private mGameScroll: GameScroller;
    private background: Phaser.GameObjects.Graphics;
    private titlebg: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private confirmBtn: NineSliceButton;
    private sendHandler: Handler;
    private typeItems: RoomTypeItem[];
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }
    create() {
        this.background = this.scene.make.graphics(undefined, false);
        this.background.fillStyle(0x202022, 1);
        this.background.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
        this.titlebg = this.scene.make.image({ key: UIAtlasName.multiple_rooms, frame: "multiple_rooms_select_title" });
        this.titleTex = this.scene.make.text({ text: i18n.t("party.roomtypetitle"), style: UIHelper.colorStyle("#986500", 16 * this.dpr) });
        this.titlebg.y = -200 * this.dpr;
        this.titleTex.y = this.titlebg.y;
        this.confirmBtn = new NineSliceButton(this.scene, 0, 200 * this.dpr, 191 * this.dpr, 55 * this.dpr, UIAtlasName.uicommon, "yellow_btn_normal", i18n.t("common.confirm"), this.dpr, this.zoom, UIHelper.button(this.dpr));
        this.mGameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 0,
            width: this.width,
            height: 140 * this.dpr,
            zoom: this.zoom,
            dpr: this.dpr,
            align: 2,
            orientation: 0,
            space: 6 * this.dpr,
            selfevent: true,
            cellupCallBack: (gameobject) => {
                this.onPointerUpHandler(gameobject);
            },
            valuechangeCallback: (value) => {

            }
        });
        this.add([this.background, this.titlebg, this.titleTex, this.mGameScroll, this.confirmBtn]);

    }
    public refreshMask() {
        this.mGameScroll.refreshMask();
    }
    public setHandler(handler: Handler) {
        this.sendHandler = handler;
    }
    public setRoomTypeDatas(datas: any[]) {
        datas.unshift(undefined);
        datas.push(undefined);
        for (let i = 0; i < datas.length; i++) {
            let item: RoomTypeItem;
            const data = datas[i];
            let itemWidth = 180 * this.dpr;
            const itemHieght = 140 * this.dpr;
            if (!data) {
                itemWidth = 96 * this.dpr;
            }
            if (i < this.typeItems.length) {
                item = this.typeItems[i];
            } else {
                item = new RoomTypeItem(this.scene, itemWidth, itemHieght, this.dpr);
                this.mGameScroll.addItem(item);
                this.typeItems.push(item);
            }
            item.visible = true;
            item.setTypeData(datas[i]);
            this.onPointerUpHandler(item);
        }
        this.mGameScroll.Sort();
    }

    private onPointerUpHandler(gameobject) {
        if (this.sendHandler && gameobject.typeData) this.sendHandler.runWith(gameobject.typeData);
    }
}
class RoomTypeItem extends Phaser.GameObjects.Container {
    public typeData: any;
    private dpr: number;
    private dyimg: DynamicImage;
    private selected: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.dyimg = new DynamicImage(scene, 0, 0);
        this.selected = this.scene.make.image({ key: UIAtlasName.multiple_rooms, frame: "multiple_rooms_unselected" });
        this.selected.x = width * 0.5;
        this.selected.y = -height * 0.5;
        this.add([this.dyimg, this.selected]);
    }
    public setTypeData(data: any) {
        if (!data) {
            this.dyimg.visible = false;
            this.selected.visible = false;
            return;
        }
        this.dyimg.visible = true;
        this.selected.visible = true;
        this.typeData = data;
        const url = Url.getOsdRes(data.texturePath + `_s_${this.dpr}x` + ".png");
        this.dyimg.load(url);
    }

    public set select(value) {
        this.selected.setFrame(value ? "multiple_rooms_selected" : "multiple_rooms_unselected");
    }
}
