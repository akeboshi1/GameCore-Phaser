import { GameGridTable, GameScroller } from "apowophaserui";
import { AlignmentType, AxisType, ConstraintType, DynamicImage, GridLayoutGroup } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, Logger, Tool, UIHelper, Url } from "utils";
import { op_client } from "pixelpai_proto";
import { PicaRoomListItem } from "./PicaRoomListItem";
export class PicaMyNavigationPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    private mGameScroll: GameScroller;
    private curRoomItem: NavigationRoomListItem;
    private roomsItems: NavigationRoomListItem[] = [];
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
        this.add(this.mGameScroll);

    }

    public refreshMask() {
        this.mGameScroll.refreshMask();
    }
    public setHandler(handler: Handler) {
        this.sendHandler = handler;
    }
    public setRoomDatas(content: any) {
        for (const item of this.roomsItems) {
            item.visible = false;
        }
        for (let i = 0; i < 2; i++) {
            let item: NavigationRoomListItem;
            if (i < this.roomsItems.length) {
                item = this.roomsItems[i];
            } else {
                item = new NavigationRoomListItem(this.scene, this.dpr, "活动");
                item.setHandler(new Handler(this, this.onTownItemHandler));
                this.mGameScroll.addItem(item);
                this.roomsItems.push(item);
            }
            item.visible = true;
            item.setListData(undefined);
        }
        this.mGameScroll.Sort();
    }

    private onPointerUpHandler(gameobject) {
        const extend = gameobject.extend ? false : true;
        const pointer = this.scene.input.activePointer;
        if (!gameobject.checkExtendRect(pointer)) {
            gameobject.setExtend(extend, true);
        }
    }
    private onSendHandler(data: any) {// op_client.IEditModeRoom
        if (this.sendHandler) this.sendHandler.runWith(["partylist", data]);
    }

    private onTownItemHandler(tag: string, data: any) {
        if (tag === "extend") {
            const extend = data.extend;
            const item = data.item;
            this.onExtendsHandler(extend, item);
        } else if (tag === "go") {
            Logger.getInstance().error(data);
        }
    }

    private onExtendsHandler(isExtend: boolean, item: NavigationRoomListItem) {
        if (this.curRoomItem) {
            this.curRoomItem.setExtend(false, false);
        }
        if (isExtend) {
            this.curRoomItem = item;
        } else
            this.curRoomItem = null;
        this.mGameScroll.Sort(true);
    }
}

class NavigationRoomListItem extends Phaser.GameObjects.Container {
    public dpr: number;
    public topCon: Phaser.GameObjects.Container;
    private titleTex: Phaser.GameObjects.Text;
    private arrow: Phaser.GameObjects.Image;
    private mExtend: GridLayoutGroup;
    private send: Handler;
    private mIsExtend: boolean;
    private townItems: PicaRoomListItem[] = [];
    constructor(scene: Phaser.Scene, dpr: number, title: string) {
        super(scene);
        this.dpr = dpr;
        this.setSize(274 * dpr, 40 * dpr);
        this.topCon = this.scene.make.container(undefined, false);
        this.topCon.setSize(274 * dpr, 40 * dpr);
        // const bg = this.scene.make.image({ key: UIAtlasName.map, frame: "map_town_list_bg" });
        // bg.displayWidth = this.width;
        const background = this.scene.make.graphics(undefined, false);
        background.clear();
        background.fillStyle(0xffffff, 0.4);
        background.fillRoundedRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height, 5 * dpr);
        this.titleTex = this.scene.make.text({ text: title, style: UIHelper.whiteStyle(dpr) }).setOrigin(0, 0.5);
        this.titleTex.x = -this.width * 0.5 + 5 * dpr;
        this.arrow = this.scene.make.image({ key: UIAtlasName.map, frame: "map_list_arrow_fold" });
        this.arrow.x = this.width * 0.5 - 15 * dpr;
        this.topCon.add([background, this.titleTex, this.arrow]);
        this.mExtend = new GridLayoutGroup(this.scene, 0, 0, {
            cellSize: new Phaser.Math.Vector2(this.width * dpr, 68 * this.dpr),
            space: new Phaser.Math.Vector2(5 * this.dpr, 5 * this.dpr),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 1,
            alignmentType: AlignmentType.UpperLeft
        });
        this.add(this.topCon);
        this.add(this.mExtend);
    }
    public setListData(datas: any[]) {
        for (const item of this.townItems) {
            item.visible = false;
        }
        for (let i = 0; i < 20; i++) {
            let item: PicaRoomListItem;
            if (i < this.townItems.length) {
                item = this.townItems[i];
            } else {
                item = new PicaRoomListItem(this.scene, UIAtlasName.map, this.dpr);
                item.name = i + "";
                this.mExtend.add(item);
                this.townItems.push(item);
            }
            item.visible = true;
            item.setRoomData(undefined);
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
                    if (this.send) this.send.runWith(["go", "############: " + obj.name]);
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
        this.height = this.topCon.height + this.mExtend.height + 0 * this.dpr;
        this.topCon.y = -this.height * 0.5 + this.topCon.height * 0.5;
        this.mExtend.y = this.topCon.y + this.topCon.height * 0.5 + this.mExtend.height * 0.5 + 5 * this.dpr;
        this.mIsExtend = true;
        this.arrow.setFrame("map_list_arrow_unfold");
        this.titleTex.setColor("#FFF449");
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
