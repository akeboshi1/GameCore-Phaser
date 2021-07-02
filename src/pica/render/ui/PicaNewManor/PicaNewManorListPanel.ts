import { Button, ClickEvent, GameGridTable } from "apowophaserui";
import { Handler, i18n, UIHelper } from "utils";
import { op_client } from "pixelpai_proto";
import { UITools } from "picaRender";
import { BackTextButton, PicaCommonSearchInput } from "../Components";
import { PicaNewManorListItem } from "./PicaNewManorItem";
import { UIAtlasName } from "picaRes";
import { ThreeSliceButton } from "gamecoreRender";
export class PicaRoomNavigationPanel extends Phaser.GameObjects.Container {
    private mGameGrid: GameGridTable;
    private mBackButton: BackTextButton;
    private inputLabel: PicaCommonSearchInput;
    private searchBtn: Button;
    private refreshBtn: ThreeSliceButton;
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    private datas: any[];
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.create();
    }
    create() {
        this.mBackButton = UITools.createBackButton(this.scene, this.dpr, this.onCloseHandler, this);
        this.mBackButton.setText(i18n.t("manor.title"));
        this.mBackButton.x = -this.width * 0.5 + this.mBackButton.width * 0.5;
        this.mBackButton.y = -this.height * 0.5 + 40 * this.dpr;
        this.inputLabel = new PicaCommonSearchInput(this.scene, 146 * this.dpr, 26 * this.dpr, UIAtlasName.friend_new, "friend_add_search_bg", this.dpr, {
            type: "text",
            placeholder: i18n.t("friendlist.friendplaceholder"),
            color: "#ffffff",
            text: "",
            fontSize: 13 * this.dpr + "px",
            width: 110 * this.dpr,
            height: 26 * this.dpr,
            maxLength: 10
        });
        this.inputLabel.on("textchange", this.onTextChangeHandler, this);
        this.searchBtn = new Button(this.scene, UIAtlasName.friend_new, "friend_list_search");
        this.searchBtn.on(ClickEvent.Tap, this.onSearchHandler, this);
        this.searchBtn.setInteractiveSize(20 * this.dpr, 40 * this.dpr);
        this.refreshBtn = new ThreeSliceButton(this.scene, 62 * this.dpr, 25 * this.dpr, UIAtlasName.uicommon, UIHelper.threeYellowSmall, UIHelper.threeYellowSmall, i18n.t("manor.nextlist"));
        this.refreshBtn.setTextOffset(10 * this.dpr, 0);
        this.refreshBtn.setTextStyle(UIHelper.brownishStyle(this.dpr));
        this.refreshBtn.setFontStyle("bold");
        this.refreshBtn.x = this.width * 0.5 - this.width * 0.5 - 10 * this.dpr;
        this.refreshBtn.y = this.mBackButton.y;
        this.refreshBtn.on(ClickEvent.Tap, this.onRefreshBtnHandler, this);
        const refreshImg = this.scene.make.image({ key: UIAtlasName.manor_new, frame: "manor_refresh_icon" });
        refreshImg.x = -this.refreshBtn.width * 0.5 + 10 * this.dpr;
        this.refreshBtn.add(refreshImg);
        this.createOptionLabels();
        const tableConfig = {
            x: 0,
            y: 82 * this.dpr,
            table: {
                width: this.width,
                height: this.height - 5 * this.dpr,
                columns: 1,
                cellWidth: this.width,
                cellHeight: 75 * this.dpr,
                reuseCellContainer: true,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PicaNewManorListItem(this.scene, this.dpr);
                }
                cellContainer.setRoomData(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", this.onGridTableHandler, this);
        this.add(this.mGameGrid);
    }

    public refreshMask() {
        this.mGameGrid.resetMask();
    }
    public setHandler(handler: Handler) {
        this.sendHandler = handler;
    }
    public setManorDatas(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ROOM_LIST) {
        if (this.datas.length === 0) {
            this.mGameGrid.setItems(content.rooms);
        } else {
            let item = this.mGameGrid.items;
            item = item.concat(content.rooms);
            this.mGameGrid.gridTable.setItems(item);
        }
        this.datas.push(content);
    }

    // "manor": {
    //     "title": "庄园",
    //     "ownertitle": "我的庄园",
    //     "manorname": "庄园名称：",
    //     "applystatus": "申请状态",
    //     "peoplenum": "人数",
    //     "nextlist": "换一批",
    //     "createtitle": "创建庄园",
    //     "declaration": "庄园宣言",
    //     "manorkey": "庄园钥匙",
    //     "manorvisit": "庄园邀请",
    //     "manorinfo": "庄园信息",
    //     "manormember": "庄园成员",
    //     "reservedpag": "预留页签",
    //     "createtime": "建立时间",
    //     "goinmanor": "进入庄园",
    //     "leavemanor": "搬离庄园",
    //     "dissolvemanor": "解散庄园",
    //     "inputlabel": "请输入玩家ID/庄园名称"
    // },

    private createOptionLabels() {
        const optionCon = this.scene.make.container(undefined, false);
        const texts = [i18n.t("manor.manorname"), i18n.t("manor.peoplenum"), i18n.t("manor.applystatus")];
    }

    private onGridTableHandler(item: PicaNewManorListItem) {
        if (this.sendHandler) this.sendHandler.runWith(["enter", item.roomData.roomId]);
    }
    private onTextChangeHandler() {
        const text = this.inputLabel.text;
        // this.sendHandler.runWith(["searchfriend", text]);
    }
    private onSearchHandler() {
        const text = this.inputLabel.text;
        this.sendHandler.runWith(["searchfriend", text]);
    }
    private onRefreshBtnHandler() {

    }
    private onCloseHandler() {

    }

}

class PicaCreateManorPanel extends Phaser.GameObjects.Container {

}
