import { BBCodeText, GameScroller, NineSlicePatch } from "apowophaserui";
import { ImageBBCodeValue, ImageValue } from "gamecoreRender";
import { UIAtlasKey } from "picaRes";
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { Font, Handler, i18n } from "utils";
export class PicaMyRoomNavigationPanel extends Phaser.GameObjects.Container {
    private gameScroll: GameScroller;
    private key: string;
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.key = key;
        this.dpr = dpr;
        this.zoom = zoom;
        this.create();
    }
    create() {
        this.gameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 10 * this.dpr,
            width: this.width,
            height: this.height,
            zoom: this.zoom,
            align: 2,
            orientation: 0,
            dpr: this.dpr,
            space: 10 * this.dpr,
            padding: { top: 10 * this.dpr },
            cellupCallBack: (gameobject) => {
                this.onGameScrollHandler(gameobject);
            }
        });

        this.add(this.gameScroll);
    }

    public clear() {
        this.gameScroll.clearItems(true);
    }

    public refreshMask() {
        this.gameScroll.refreshMask();
    }
    public setHandler(handler: Handler) {
        this.sendHandler = handler;
    }
    public setRoomDataList(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY) {
        this.gameScroll.clearItems(true);
        this.setMyRoomDatas(content.selfRooms, new Handler(this, () => {
            this.setHistoryDatas(content.historyRooms);
        }));
    }

    private setMyRoomDatas(datas: op_client.IEditModeRoom[], compl?: Handler) {
        const titleimg: ImageValue = new ImageValue(this.scene, 78 * this.dpr, 15 * this.dpr, this.key, "my_house", this.dpr, {
            color: "#FFC51A", fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT
        });
        titleimg.setStroke("#744803", 2 * this.dpr);
        titleimg.x = -this.width * 0.5 + 20 * this.dpr;
        titleimg.setFrameValue(i18n.t("room_list.my_room"), this.key, "my_house");
        this.gameScroll.addItem(titleimg);
        this.createRoomItemByFrame(datas, "my_home_bg", "#744803", compl);
    }

    private createRoomItemByFrame(datas: op_client.IEditModeRoom[], bg: string = "list_bg", color: string = "#333333", compl?: Handler) {
        const frameCount = 5;
        let indexed = 0;
        const framefun = () => {
            const temps = datas.slice(indexed, indexed + frameCount);
            for (const data of temps) {
                const item = new RoomListItem(this.scene, this.key, this.dpr, bg, color);
                item.setRoomData(data);
                this.gameScroll.addItem(item);
            }
            this.gameScroll.Sort(true);
            indexed += frameCount;
            if (indexed < datas.length) {
                setTimeout(() => {
                    framefun();
                }, 20);
            } else {
                if (compl) compl.run();
            }
        };
        framefun();
    }

    private setHistoryDatas(datas: op_client.IEditModeRoom[]) {
        const titleimg: ImageValue = new ImageValue(this.scene, 78 * this.dpr, 30 * this.dpr, this.key, "footprint", this.dpr, {
            color: "#FFC51A", fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT
        });
        titleimg.setStroke("#744803", 2 * this.dpr);
        titleimg.x = -this.width * 0.5 + 20 * this.dpr;
        titleimg.setFrameValue(i18n.t("room_list.my_history"), this.key, "footprint");
        this.gameScroll.addItem(titleimg);
        this.createRoomItemByFrame(datas);
    }
    private onGameScrollHandler(item: RoomListItem) {
        if (item && item.roomData)
            this.onSendHandler(item.roomData);
    }

    private onSendHandler(data: op_client.IEditModeRoom) {
        if (this.sendHandler) this.sendHandler.runWith(data.roomId);
    }
}

class RoomListItem extends Phaser.GameObjects.Container {
    public roomData: op_client.IEditModeRoom;
    private key: string;
    private dpr: number;
    private bg: NineSlicePatch;
    private roomName: BBCodeText;
    private roomOwnerName: ImageBBCodeValue;
    private playerCount: ImageBBCodeValue;
    constructor(scene: Phaser.Scene, key: string, dpr: number, bg: string = "list_bg", titlecolor = "#333333") {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.bg = new NineSlicePatch(this.scene, 0, 0, 254 * dpr, 40 * dpr, this.key, bg, {
            left: 12 * this.dpr,
            top: 0 * this.dpr,
            right: 12 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.add(this.bg);
        this.setSize(this.bg.width, this.bg.height);
        this.roomName = new BBCodeText(this.scene, -this.width * 0.5 + 10 * dpr, -this.height * 0.5 + 5 * dpr, "", {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 12 * dpr,
            color: titlecolor
        });
        this.roomName.setOrigin(0);
        this.add(this.roomName);
        this.roomOwnerName = new ImageBBCodeValue(scene, 50 * dpr, 20 * dpr, key, "user", dpr, {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 11 * dpr,
            color: "#333333"
        });
        this.roomOwnerName.x = this.roomName.x + this.roomOwnerName.width * 0.5;
        this.roomOwnerName.y = this.roomName.y + 25 * dpr;
        this.add(this.roomOwnerName);
        this.playerCount = new ImageBBCodeValue(scene, 30 * dpr, 20 * dpr, UIAtlasKey.commonKey, "home_persons", dpr, {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 12 * dpr,
            color: "#333333"
        });
        this.playerCount.x = this.width * 0.5 - 35 * dpr;
        this.add(this.playerCount);
    }
    public setRoomData(data: op_client.IEditModeRoom) {
        this.roomData = data;
        this.roomName.text = `[b]${data.name}[/b]`;
        this.playerCount.setText(`[b]${data.playerCount}[/b]`);
        this.roomOwnerName.setText(data.ownerName);
    }
}
