import { GameGridTable, GameScroller } from "apowophaserui";
import { AlignmentType, AxisType, ConstraintType, DynamicImage, GridLayoutGroup } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { op_client } from "pixelpai_proto";
export class PicaTownNavigationPanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    private mGameScroll: GameScroller;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.create();
    }
    create() {
        this.mGameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height - 10 * this.dpr,
            zoom: this.scale,
            dpr: this.dpr,
            align: 2,
            orientation: 0,
            space: 10 * this.dpr,
            selfevent: true,
            cellupCallBack: (gameobject) => {
                this.onPointerUpHandler(gameobject);
            }
        });
        this.add(this.mGameScroll);

    }

    public refreshMask() {
    }
    public setHandler(handler: Handler) {
        this.sendHandler = handler;
    }
    public setPartyDataList(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST
    }

    destroy() {
        super.destroy();
    }
    private onPointerUpHandler(gameobject) {
        if (!(gameobject instanceof NavigationTownListItem)) {
            const extend = gameobject.extend ? false : true;
            gameobject.setExtend(extend, true);
        }
    }
    private onSendHandler(data: any) {// op_client.IEditModeRoom
        if (this.sendHandler) this.sendHandler.runWith(["partylist", data]);
    }
}

class NavigationTownListItem extends Phaser.GameObjects.Container {
    public dpr: number;
    public topCon: Phaser.GameObjects.Container;
    private titleTex: Phaser.GameObjects.Text;
    private arrow: Phaser.GameObjects.Image;
    private mExtend: GridLayoutGroup;
    private send: Handler;
    private mIsExtend: boolean;
    constructor(scene: Phaser.Scene, dpr: number, title: string, style: any) {
        super(scene);
        this.dpr = dpr;
        this.setSize(274 * dpr, 40 * dpr);
        this.topCon = this.scene.make.container(undefined, false);
        this.topCon.setSize(274 * dpr, 40 * dpr);
        const bg = this.scene.make.image({ key: UIAtlasName.map, frame: "map_town_list_bg" });
        bg.displayWidth = this.width;
        this.titleTex = this.scene.make.text({ text: title, style }).setOrigin(0, 0.5);
        this.titleTex.x = -this.width * 0.5 + 5 * dpr;
        this.arrow = this.scene.make.image({ key: UIAtlasName.map, frame: "map_list_arrow_fold" });
        this.arrow.x = this.width * 0.5 - 15 * dpr;
        this.topCon.add([bg, this.titleTex, this.arrow]);
        this.mExtend = new GridLayoutGroup(this.scene, 0, 0, {
            cellSize: new Phaser.Math.Vector2(this.width, 110 * this.dpr),
            space: new Phaser.Math.Vector2(10 * this.dpr, 21 * this.dpr),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 2,
            alignmentType: AlignmentType.UpperCenter
        });
        this.add(this.mExtend);
    }
    public setListData(datas: any[]) {

    }

    public setExtend(isExtend: boolean, haveCallBack: boolean = true) {
        if (isExtend) {
            this.openExtend();
            if (haveCallBack)
                if (this.send) this.send.runWith(["extend", { extend: true, item: this }]);
        } else {
            this.closeExtend();
            if (haveCallBack) {
                if (this.send)
                    this.send.runWith(["extend", { extend: false, item: this }]);
            }
        }
    }

    get extend() {
        return this.mIsExtend;
    }

    private openExtend() {
        this.mExtend.visible = true;
        this.height = this.topCon.height + this.mExtend.height;
        this.topCon.y = -this.height * 0.5 + this.topCon.height * 0.5;
        this.mExtend.y = this.topCon.y + this.topCon.height * 0.5 + this.mExtend.height * 0.5;
        this.mIsExtend = true;
        this.arrow.setFrame("map_list_arrow_unfold");
    }

    private closeExtend() {
        if (this.mExtend) this.mExtend.visible = false;
        this.height = this.topCon.height;
        this.topCon.y = 0;
        this.mIsExtend = false;
        this.arrow.setFrame("map_list_arrow_fold");
    }
}

class TownMapItem extends Phaser.GameObjects.Container {
    private dpr: number;
    private imge: DynamicImage;
    private namebg: Phaser.GameObjects.Image;
    private nameTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.setSize(135 * dpr, 57 * dpr);
        this.dpr = dpr;
        this.imge = new DynamicImage(this.scene, 0, 0);
        this.namebg = this.scene.make.image({ key: UIAtlasName.map, frame: "map_list_entrance_name" }).setOrigin(1, 0.5);
        this.namebg.x = this.width * 0.5 - 2 * dpr;
        this.namebg.y = this.height * 0.5 - this.namebg.height * 0.5 - 2 * dpr;
        this.nameTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 10) }).setOrigin(1, 0.5);
        this.nameTex.x = this.namebg.x;
        this.nameTex.y = this.namebg.y;
        this.add([this.imge, this.namebg, this.nameTex]);
    }
}

// class TownListItem extends Phaser.GameObjects.Container {
//     public partyData: any;// op_client.IEditModeRoom
//     private key: string;
//     private dpr: number;
//     private bg: NineSlicePatch;
//     private partyName: BBCodeText;
//     private imagIcon: DynamicImage;
//     private hotImageValue: ImageBBCodeValue;
//     private partyOwnerName: ImageBBCodeValue;
//     private playerCount: ImageBBCodeValue;
//     constructor(scene: Phaser.Scene, key: string, dpr: number) {
//         super(scene);
//         this.key = key;
//         this.dpr = dpr;
//         this.bg = new NineSlicePatch(this.scene, 0, 0, 254 * dpr, 40 * dpr, this.key, "list_bg", {
//             left: 12 * this.dpr,
//             top: 0 * this.dpr,
//             right: 12 * this.dpr,
//             bottom: 0 * this.dpr
//         });
//         this.add(this.bg);
//         this.setSize(this.bg.width, this.bg.height);
//         this.imagIcon = new DynamicImage(scene, 0, 0);
//         this.imagIcon.setTexture(this.key, "party_icon_1");
//         this.imagIcon.x = -this.width * 0.5 + this.imagIcon.width * 0.5 + 8 * dpr;
//         this.imagIcon.y = -this.height * 0.5 + this.imagIcon.height * 0.5 + 5 * dpr;
//         this.add(this.imagIcon);
//         this.hotImageValue = new ImageBBCodeValue(scene, 30 * dpr, 10 * dpr, key, "hot", dpr, {
//             fontSize: 9 * dpr,
//             color: "#FFDD00",
//             fontFamily: Font.DEFULT_FONT,
//             stroke: "#666666",
//             strokeThickness: 2 * dpr,
//         });
//         this.hotImageValue.setOffset(-3 * dpr, 0);
//         this.hotImageValue.x = -this.width * 0.5 + this.hotImageValue.width * 0.5 + 8 * dpr;
//         this.hotImageValue.y = this.height * 0.5 - this.hotImageValue.height * 0.5 - 5 * dpr;
//         this.add(this.hotImageValue);
//         this.partyName = new BBCodeText(this.scene, -this.width * 0.5 + 45 * dpr, -this.height * 0.5 + 5 * dpr, "", {
//             fontFamily: Font.DEFULT_FONT,
//             fontSize: 12 * dpr,
//             color: "#333333"
//         });
//         this.partyName.setOrigin(0);
//         this.add(this.partyName);
//         this.partyOwnerName = new ImageBBCodeValue(scene, 50 * dpr, 20 * dpr, key, "user", dpr, {
//             fontFamily: Font.DEFULT_FONT,
//             fontSize: 11 * dpr,
//             color: "#333333"
//         });
//         this.partyOwnerName.x = this.partyName.x + this.partyOwnerName.width * 0.5;
//         this.partyOwnerName.y = this.partyName.y + 25 * dpr;
//         this.add(this.partyOwnerName);
//         this.playerCount = new ImageBBCodeValue(scene, 30 * dpr, 20 * dpr, UIAtlasKey.commonKey, "home_persons", dpr, {
//             fontFamily: Font.DEFULT_FONT,
//             fontSize: 12 * dpr,
//             color: "#333333"
//         });
//         this.playerCount.x = this.width * 0.5 - 35 * dpr;
//         this.add(this.playerCount);
//     }
//     public setPartyData(data: any) {// op_client.IEditModeRoom
//         this.partyData = data;
//         const texturepath = data.topic.display.texturePath;
//         const lastindex = texturepath.lastIndexOf("/");
//         const frame = texturepath.slice(lastindex + 1, texturepath.length);
//         const burl = texturepath.slice(0, lastindex + 1);
//         const url = Url.getOsdRes(burl + frame + `_s_${this.dpr}x` + ".png");
//         this.imagIcon.load(url);
//         this.hotImageValue.setText(this.getHotText(data.focus));
//         this.partyName.text = `[b]${data.name}[/b]`;
//         this.playerCount.setText(`[b]${data.playerCount}[/b]`);
//         this.partyOwnerName.setText(data.ownerName);
//     }
//     private getHotText(value) {
//         let text = value + "";
//         if (i18n.language === "en") {
//             if (text.length >= 4 && text.length < 7) {
//                 text = Math.floor(value / 100) / 10 + i18n.t("quantityunit.k");
//             } else if (text.length >= 7) {
//                 text = Math.floor(value / 100000) / 10 + i18n.t("quantityunit.m");
//             }
//         } else {
//             text = ChineseUnit.getChineseUnit(value, 1);
//         }

//         return `[stroke]${text} [/stroke]`;
//     }
// }
