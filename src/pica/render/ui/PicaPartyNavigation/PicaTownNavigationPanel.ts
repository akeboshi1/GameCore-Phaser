import { BBCodeText, GameScroller } from "apowophaserui";
import { AlignmentType, AxisType, ConstraintType, DynamicImage, GridLayoutGroup } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { Font, Handler, i18n, Tool, UIHelper, Url } from "utils";
import { IScene } from "../../../structure";
export class PicaTownNavigationPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    private mGameScroll: GameScroller;
    private curTownItem: NavigationTownListItem;
    private townItems: NavigationTownListItem[] = [];
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
            zoom: this.zoom,
            dpr: this.dpr,
            align: 2,
            orientation: 0,
            space: 6 * this.dpr,
            selfevent: true,
            cellupCallBack: (gameobject) => {
                this.onPointerUpHandler(gameobject);
            }
        });
        this.add([this.mGameScroll]);

    }

    public show() {
        this.visible = true;
    }

    public hide() {
        for (const item of this.townItems) {
            item.visible = false;
            item.setExtend(false, false);
        }
        this.curTownItem = undefined;
        this.visible = false;
    }

    public refreshMask() {
        this.mGameScroll.refreshMask();
    }
    public setHandler(handler: Handler) {
        this.sendHandler = handler;
    }
    public setTownDatas(datas: any[], optionType: number) {
        let firstItem: NavigationTownListItem;
        for (let i = 0; i < datas.length; i++) {
            let item: NavigationTownListItem;
            const temp = datas[i];
            if (optionType === 2) {
                temp.tooqing = true;
                temp.name = i18n.t("partynav.tooqingtips");
            } else {
                temp.tooqing = false;
            }
            if (i < this.townItems.length) {
                item = this.townItems[i];
            } else {
                item = new NavigationTownListItem(this.scene, this.dpr, "活动");
                item.setHandler(new Handler(this, this.onTownItemHandler));
                this.mGameScroll.addItem(item);
                this.townItems.push(item);
            }
            item.visible = true;
            item.setGroupData(temp);
            firstItem = firstItem || item;
            this.onPointerUpHandler(item);
        }
        this.mGameScroll.Sort();
        // this.onPointerUpHandler(firstItem);
    }

    private onPointerUpHandler(gameobject) {
        const extend = gameobject.extend ? false : true;
        const pointer = this.scene.input.activePointer;
        if (!gameobject.checkExtendRect(pointer)) {
            gameobject.setExtend(extend, true);
        }
    }

    private onTownItemHandler(tag: string, data: any) {
        if (tag === "extend") {
            const extend = data.extend;
            const item = data.item;
            this.onExtendsHandler(extend, item);
        } else if (tag === "go") {
            if (this.sendHandler) this.sendHandler.runWith(["enter", data.id + ""]);
        }
    }

    private onExtendsHandler(isExtend: boolean, item: NavigationTownListItem) {
        // if (this.curTownItem) {
        //     this.curTownItem.setExtend(false, false);
        // }
        if (isExtend) {
            this.curTownItem = item;
        } else
            this.curTownItem = undefined;
        this.mGameScroll.Sort(true);
    }
}
class NavigationTownListItem extends Phaser.GameObjects.Container {
    public dpr: number;
    public topCon: Phaser.GameObjects.Container;
    private topHeight: number;
    private contentTex: BBCodeText;
    private titleTex: Phaser.GameObjects.Text;
    private arrow: Phaser.GameObjects.Image;
    private mExtend: GridLayoutGroup;
    private send: Handler;
    private mIsExtend: boolean;
    private townItems: TownMapItem[] = [];
    private extendStatus: number = 0;// 0:无状态，1：一直关闭，2：一直展开
    constructor(scene: Phaser.Scene, dpr: number, title: string) {
        super(scene);
        this.dpr = dpr;
        this.topHeight = 40 * dpr;
        this.setSize(274 * dpr, this.topHeight);
        this.topCon = this.scene.make.container(undefined, false);
        this.topCon.setSize(274 * dpr, this.topHeight);
        const background = this.scene.make.graphics(undefined, false);
        background.clear();
        background.fillStyle(0xffffff, 0.4);
        background.fillRoundedRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height, 5 * dpr);
        this.titleTex = this.scene.make.text({ text: title, style: UIHelper.whiteStyle(dpr) }).setOrigin(0, 0.5);
        this.titleTex.x = -this.width * 0.5 + 5 * dpr;
        this.arrow = this.scene.make.image({ key: UIAtlasName.map, frame: "map_list_arrow_fold" });
        this.arrow.x = this.width * 0.5 - 15 * dpr;
        this.topCon.add([background, this.titleTex, this.arrow]);
        this.contentTex = new BBCodeText(scene, 0, 0, "", {
            fontSize: 14 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
            color: "#ffffff",
            lineSpacing: 5 * dpr,
            wrap: {
                mode: "char",
                width: 271 * dpr
            }
        }).setOrigin(0.5);
        this.contentTex["visible"] = false;
        this.mExtend = new GridLayoutGroup(this.scene, this.width, 0, {
            cellSize: new Phaser.Math.Vector2(135 * dpr, 57 * this.dpr),
            space: new Phaser.Math.Vector2(5 * this.dpr, 5 * this.dpr),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 2,
            alignmentType: AlignmentType.UpperLeft
        });
        this.add([this.topCon, this.contentTex]);
        this.add(this.mExtend);
    }

    public setGroupData(obj: any) {
        if (obj.tooqing) {
            this.contentTex["visible"] = true;
            this.topCon.visible = false;
            this.contentTex.text = obj.name;
            this.topCon.setSize(this.width, this.contentTex.height);
            this.extendStatus = 2;
        } else {
            this.contentTex["visible"] = false;
            this.topCon.visible = true;
            this.titleTex.text = obj.name;
            this.topCon.setSize(this.width, this.topHeight);
            this.extendStatus = 0;
        }
        const datas: any[] = obj.datas;
        this.setListData(datas);
    }
    public setListData(datas: any[]) {
        for (const item of this.townItems) {
            item.visible = false;
        }
        for (let i = 0; i < datas.length; i++) {
            let item: TownMapItem;
            if (i < this.townItems.length) {
                item = this.townItems[i];
            } else {
                item = new TownMapItem(this.scene, this.dpr);
                item.name = i + "";
                this.mExtend.add(item);
                this.townItems.push(item);
            }
            item.visible = true;
            item.setTownData(datas[i]);
        }

        this.mExtend.Layout();
        this.closeExtend();
    }
    public checkExtendRect(pointer: any) {
        if (!this.mExtend.visible) return false;
        const isCheck = Tool.checkPointerContains(this.mExtend, pointer);
        if (isCheck) {
            const list = this.mExtend.list;
            for (const obj of list) {
                if (Tool.checkPointerContains(obj, pointer)) {
                    if (this.send) this.send.runWith(["go", (<TownMapItem>obj).roomData]);
                }
            }
        }
        return isCheck;
    }
    public setHandler(send: Handler) {
        this.send = send;
    }

    public setExtend(isExtend: boolean, haveCallBack: boolean = true) {
        if (isExtend) {
            this.openExtend();
            if (haveCallBack)
                if (this.send) this.send.runWith(["extend", { extend: true, item: this }]);
        } else if (this.extendStatus !== 2) {
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
        this.height = this.topCon.height + this.mExtend.height + 0 * this.dpr;
        this.topCon.y = -this.height * 0.5 + this.topCon.height * 0.5;
        this.mExtend.y = this.topCon.y + this.topCon.height * 0.5 + this.mExtend.height * 0.5 + 5 * this.dpr;
        this.mIsExtend = true;
        this.arrow.setFrame("map_list_arrow_unfold");
        this.titleTex.setColor("#FFF449");
        this.contentTex.y = this.topCon.y;
    }

    private closeExtend() {
        if (this.mExtend) this.mExtend.visible = false;
        this.height = this.topCon.height;
        this.topCon.y = 0;
        this.mIsExtend = false;
        this.arrow.setFrame("map_list_arrow_fold");
        this.titleTex.setColor("#ffffff");
    }
}
class TownMapItem extends Phaser.GameObjects.Container {
    public roomData: IScene;
    private dpr: number;
    private imge: DynamicImage;
    private namebg: Phaser.GameObjects.Image;
    private nameTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.setSize(135 * dpr, 57 * dpr);
        this.dpr = dpr;
        this.imge = new DynamicImage(this.scene, 0, 0);
        this.imge.setTexture("town_entrance_1");
        this.namebg = this.scene.make.image({ key: UIAtlasName.map, frame: "map_list_entrance_name" }).setOrigin(1, 0.5);
        this.namebg.x = this.width * 0.5 - 2 * dpr;
        this.namebg.y = this.height * 0.5 - this.namebg.height * 0.5 - 2 * dpr;
        this.nameTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 10) }).setOrigin(0.5);
        this.nameTex.x = this.namebg.x - this.namebg.width * 0.5;
        this.nameTex.y = this.namebg.y;
        this.add([this.imge, this.namebg, this.nameTex]);
    }

    public setTownData(data: IScene) {
        this.roomData = data;
        if (data.texturePath && data.texturePath !== "") {
            const url = Url.getOsdRes(`${data.texturePath}_${this.dpr}x.png`);
            this.imge.load(url);
        }

        this.nameTex.text = data.roomName;
    }
}
