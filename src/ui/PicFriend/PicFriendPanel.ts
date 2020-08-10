import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client } from "pixelpai_proto";
import { BBCodeText, Button, NineSlicePatch, Label } from "../../../lib/rexui/lib/ui/ui-components";
import { i18n } from "../../i18n";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import Text = Phaser.GameObjects.Text;
import Container = Phaser.GameObjects.Container;
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import { UIAtlasName, UIAtlasKey } from "../ui.atals.name";
import { Handler } from "../../Handler/Handler";
import { CheckBox } from "../../../lib/rexui/lib/ui/checkbox/CheckBox";
import { CheckboxGroup } from "../components/checkbox.group";
import { Logger } from "../../utils/log";
import { PicFriendEvent } from "./PicFriendEvent";
import { LabelInput } from "../components/label.input";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
export default class PicFriendPanel extends BasePanel {
    private key = "picfriendpanel";
    private bg: Phaser.GameObjects.Image;
    private closeBtn: Button;
    private content: Container;
    private friendContainer: MainContainer;
    private mBackGround: Phaser.GameObjects.Graphics;
    private mShowingSubContainer: SubFriendContainer;
    private mSubContanerMap: Map<FriendChannel, any>;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.mSubContanerMap = new Map();
        this.mSubContanerMap.set(FriendChannel.Blacklist, BlackContainer);
        this.mSubContanerMap.set(FriendChannel.Search, SearchContainer);
        this.mSubContanerMap.set(FriendChannel.AddFriend, SubFriendContainer);

    }

    resize(width: number, height: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(width, height);
        this.setSize(w, h);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x000000, 0.66);
        this.mBackGround.fillRect(0, 0, w, h);
        this.content.setPosition(w / 2, h / 2);
        this.friendContainer.resize();
        // this.searchContainer.resize();
        // this.blackContaienr.resize();
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
        this.friendContainer.setChannel(FriendChannel.Friends);
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on(CoreUI.MouseEvent.Tap, this.OnClosePanel, this);
        this.friendContainer.register();
        this.friendContainer.on("shwoAddFriend", this.onShowAddFriendHandler, this);
        this.friendContainer.on(PicFriendEvent.FETCH_FRIEND, this.onFetchFriendHandler, this);
        this.friendContainer.on(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, this.onReqFriendAttributesHandler, this);
        // this.searchContainer.register();
        // this.searchContainer.on("hide", this.onHideSearchHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off(CoreUI.MouseEvent.Tap, this.OnClosePanel, this);
        this.friendContainer.off("shwoAddFriend", this.onShowAddFriendHandler, this);
        this.friendContainer.off(PicFriendEvent.FETCH_FRIEND, this.onFetchFriendHandler, this);
        this.friendContainer.off(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, this.onReqFriendAttributesHandler, this);
        // this.searchContainer.off("hide", this.onHideSearchHandler, this);

        // this.searchContainer.unregister();
        this.friendContainer.unregister();
    }

    public setFriend(type: FriendChannel, data) {
        if (this.friendContainer) {
            this.friendContainer.showFriend(type, data);
        }
    }

    filterById(id: string) {
        if (this.friendContainer) {
            this.friendContainer.filterById(id);
        }
    }

    preload() {
        this.addAtlas(this.key, "friend_list/friend_list.png", "friend_list/friend_list.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }

    init() {
        const zoom = this.scale;
        const wid: number = this.scaleWidth;
        const hei: number = this.scaleHeight;
        this.mBackGround = this.scene.make.graphics(undefined, false);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x6AE2FF, 0.5);
        this.mBackGround.fillRect(0, 0, wid * zoom, hei * zoom);
        this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(0, 0, wid, hei), Phaser.Geom.Rectangle.Contains);
        this.bg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "phone" });
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(this.bg.width, this.bg.height);
        this.content.add(this.bg);

        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close");
        this.closeBtn.setPosition(this.content.width * 0.5 - this.dpr * 30, (-this.bg.height + this.closeBtn.height) * 0.5 + 25 * this.dpr);

        this.friendContainer = new MainContainer(this.scene, this.bg.width, this.bg.height, this.key, this.dpr);
        // this.searchContainer = new SearchContainer(this.scene, this.bg.width, this.bg.height, this.key, this.dpr);
        // this.blackContaienr = new
        this.content.add([this.friendContainer, this.closeBtn]);

        this.add([this.mBackGround, this.content]);

        this.resize(wid, hei);
        super.init();
    }

    destroy() {
        if (this.friendContainer) this.friendContainer.destroy();
        if (this.mShowingSubContainer) this.mShowingSubContainer.destroy();
        super.destroy();
    }

    private OnClosePanel() {
        this.emit("hide");
    }

    private onFetchFriendHandler(index: number) {
        this.emit(PicFriendEvent.FETCH_FRIEND, index);
    }

    private onReqFriendAttributesHandler(id: string) {
        this.emit(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, id);
    }

    private onShowAddFriendHandler(type: FriendChannel) {
        if (this.mShowingSubContainer) {
            this.mShowingSubContainer.destroy();
        }
        const classType = this.mSubContanerMap.get(type);
        if (!classType) return;
        this.mShowingSubContainer = new classType(this.scene, this.bg.width, this.bg.height, this.key, this.dpr);
        this.mShowingSubContainer.resize();
        this.mShowingSubContainer.register();
        this.mShowingSubContainer.on("hide", this.onHideSearchHandler, this);
        this.content.remove(this.friendContainer);
        this.content.add(this.mShowingSubContainer);
    }

    private onHideSearchHandler() {
        this.content.add(this.friendContainer);
        if (this.mShowingSubContainer) {
            this.mShowingSubContainer.unregister();
            this.mShowingSubContainer.destroy();
            this.mShowingSubContainer = null;
        }
        // this.content.remove(this.searchContainer);
    }
}

class FriendContainer extends Container {
    constructor(scene: Phaser.Scene, width: number, height: number, protected key: string, protected dpr: number) {
        super(scene, 0, 0);
        this.setSize(width, height);
    }

    protected createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number, createFun: Function, callback: Handler) {
        const tableConfig: GridTableConfig = {
            x,
            y,
            table: {
                width,
                height,
                columns: 1,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true
              },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = createFun(this.scene, cell);
                }
                cellContainer.setData({ item });
                cellContainer.setItemData(item);
                return cellContainer;
            },
        };
        // 830
        // 1140
        const grid = new GameGridTable(this.scene, tableConfig);
        grid.layout();
        grid.on("cellTap", (cell) => {
            if (cell) {
                callback.runWith(cell);
            }
        });
        this.add(grid);
        return grid;
    }

    protected sortByName(array: FriendData[]) {
        return array.sort((a: FriendData, b: FriendData) => {
            return a.nickname.localeCompare(b.nickname, i18n.language);
        });
    }
}

class MainContainer extends FriendContainer {
    private friendNum: Phaser.GameObjects.Text;
    private titleText: Phaser.GameObjects.Text;
    private onlineCheckBox: CheckBox;
    private topContent: Container;
    private channelGroup: CheckboxGroup;
    private searchBtn: Button;
    private addFriendBtn: Button;
    private friendTabel: GameGridTable;
    private showingFriends: FriendData[];
    private friendDatas: Map<FriendChannel, FriendData[]>;
    private searchInput: LabelInput;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene, width, height, key, dpr);
        this.friendDatas = new Map();
        this.draw();
    }

    public register() {
        this.searchInput.on("textchange", this.onTextChangeHandler, this);
        this.searchBtn.on(CoreUI.MouseEvent.Tap, this.onSeachHandler, this);
        this.onlineCheckBox.on(CoreUI.MouseEvent.Tap, this.onCheckoutOnlineHandler, this);
        this.addFriendBtn.on(CoreUI.MouseEvent.Tap, this.onShowAddFriendHandler, this);
    }

    public unregister() {
        this.searchInput.off("textchange", this.onTextChangeHandler, this);
        this.searchBtn.off(CoreUI.MouseEvent.Tap, this.onSeachHandler, this);
        this.onlineCheckBox.off(CoreUI.MouseEvent.Tap, this.onCheckoutOnlineHandler, this);
        this.addFriendBtn.off(CoreUI.MouseEvent.Tap, this.onShowAddFriendHandler, this);
    }

    public resize() {
        if (this.friendTabel) {
            this.friendTabel.resetMask();
        }
    }

    public setChannel(val: number) {
        if (this.channelGroup) {
            this.channelGroup.selectIndex(val);
        }
    }

    public showFriend(type: FriendChannel, data: any[]) {
        const result: FriendData[] = [];
        for (const firend of data) {
            result.push({ id: "0", nickname: firend.nickname || firend.followed_user.nickname});
        }
        this.sortByName(result);
        this.friendDatas.set(type, result);
        this.showingFriends = result;
        this.friendTabel.setItems(this.showingFriends);
        let title = "";
        let friendType = "";
        switch(type) {
            case FriendChannel.Friends:
                title = i18n.t("friendlist.title");
                friendType = i18n.t("friendlist.friends");
                break;
            case FriendChannel.Fans:
                title = i18n.t("friendlist.fans");
                friendType = i18n.t("friendlist.fans");
                break;
            case FriendChannel.Followes:
                title = i18n.t("friendlist.follow");
                friendType = i18n.t("friendlist.fans");
                break;
            case FriendChannel.Blacklist:
                title = i18n.t("friendlist.blacklist");
                break;
        }
        if (title) this.titleText.setText(title);
        this.friendNum.setText(`Number of ${friendType}: ${this.showingFriends.length}`);
    }

    public filterById(id: string) {
        if (!this.showingFriends) {
            return;
        }
        this.showingFriends.filter((friend: FriendData) => friend.id !== id);
    }

    protected draw() {
        let posY = -this.height * 0.5 + 17.33 * this.dpr;
        this.friendNum = this.scene.make.text({ x: 0, y: posY, text: "", style: { color: "#ffffff", fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.add(this.friendNum);
        posY = 49 * this.dpr - this.height * 0.5;
        const mfont = `bold ${16 * this.dpr}px ${Font.DEFULT_FONT}`;
        this.titleText = this.scene.make.text({ x: 0, y: posY, text: i18n.t("friendlist.title"), style: { font: mfont, bold: true, color: "#0" } }).setOrigin(0.5, 0);
        this.add(this.titleText);

        this.topContent = this.scene.make.container(undefined, false);
        this.add(this.topContent);
        const topbg = new NineSlicePatch(this.scene, 0, 0, 276 * this.dpr, 33 * this.dpr, this.key, "min_pic_bg", {
            left: 5 * this.dpr,
            top: 5 * this.dpr,
            right: 5 * this.dpr,
            bottom: 5 * this.dpr
        });
        this.topContent.setPosition(0, 73.67 * this.dpr + (topbg.height - this.height) * 0.5);
        this.onlineCheckBox = new CheckBox(this.scene, this.key, "online_unchecked", "online_checked");
        this.onlineCheckBox.setPosition(12 * this.dpr - topbg.width * 0.5, 0);
        const boxtitle = this.scene.make.text({ x: 6.67 * this.dpr + this.onlineCheckBox.width * 0.5, y: 0, text: i18n.t("friendlist.olinetitle"), style: { fontSize: 9.33 * this.dpr, bold: true, fontFamily: Font.DEFULT_FONT, color: "#0098D8" } }).setOrigin(0, 0.5);
        this.onlineCheckBox.add(boxtitle);
        // const line2 = this.scene.make.image({ x: 0, y: + 10 * this.dpr, key: this.key, frame: "splitters" });
        this.searchBtn = new Button(this.scene, this.key, "search");
        this.searchBtn.x = topbg.width * 0.5 - 39 * this.dpr - this.searchBtn.width * 0.5;
        this.addFriendBtn = new Button(this.scene, this.key, "add");
        this.addFriendBtn.x = topbg.width * 0.5 - 7.33 * this.dpr - this.addFriendBtn.width * 0.5;

        this.searchInput = new LabelInput(this.scene, {
            x: 0,
            y: 0,
            width: 160 * this.dpr,
            height: 30 * this.dpr,
            placeholder: i18n.t("friendlist.search_friends_notes"),
            fontSize: 14 * this.dpr + "px",
            color: "#666666",
        });
        this.topContent.add([topbg, this.onlineCheckBox, this.searchInput, this.searchBtn, this.addFriendBtn]);

        const friendsTab = new Button(this.scene, this.key, "friend_default", "friend_select", i18n.t("friendlist.friends"));
        friendsTab.y = this.height * 0.5 - 14 * this.dpr - friendsTab.height * 0.5;
        const fansTab = new Button(this.scene, this.key, "fans_default", "fans_select", i18n.t("friendlist.fans"));
        fansTab.y = friendsTab.y;
        const followsTab = new Button(this.scene, this.key, "follow_default", "follow_select", i18n.t("friendlist.follow"));
        followsTab.y = friendsTab.y;
        friendsTab.x = (-fansTab.width - friendsTab.width) * 0.5 - 0.67 * this.dpr;
        followsTab.x = (fansTab.width + followsTab.width) * 0.5 + 0.67 * this.dpr;
        this.add([friendsTab, fansTab, followsTab]);

        this.channelGroup = new CheckboxGroup();
        this.channelGroup.on("selected", this.onSelectChannelHandler, this);
        this.channelGroup.appendItemAll([friendsTab, fansTab, followsTab]);

        this.friendTabel = this.createGrideTable(0,this.topContent.y + this.topContent.height + 380 * this.dpr * 0.5 + 18 * this.dpr, 275 * this.dpr, 380 * this.dpr, 275 * this.dpr, 36 * this.dpr, (scene, cell) => {
            return new PicFriendItem(this.scene, 0, 0, this.key, this.dpr).on(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, this.onFtechPlayerHandler, this);
        }, new Handler(this, this.onSelectItemHandler));
    }

    private onFtechPlayerHandler(friend: FriendData) {
        this.emit(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, friend.id);
    }

    private onSelectChannelHandler(item) {
        const data = this.friendDatas.get(this.channelGroup.selectedIndex);
        if (!data) {
            this.emit(PicFriendEvent.FETCH_FRIEND, this.channelGroup.selectedIndex);
        } else {
            this.showFriend(this.channelGroup.selectedIndex, data);
        }
    }

    private onSelectItemHandler(item) {
        Logger.getInstance().log(item);
    }

    private onCheckoutOnlineHandler() {
        let result = this.showingFriends;
        if (this.onlineCheckBox.selected) {
            const tmp = this.showingFriends.slice(0);
            result = tmp.filter((friend: FriendData) => friend.online === true);
        }
        this.friendTabel.setItems(result);
    }

    private onShowAddFriendHandler() {
        this.emit("shwoAddFriend", FriendChannel.Search);
    }

    private onSeachHandler() {
        const text = this.searchInput.text;
        let result = this.showingFriends.slice(0);
        result = result.filter((friend: FriendData) => friend.nickname.indexOf(text) > -1);
        this.friendTabel.setItems(result);
    }

    private onTextChangeHandler() {
        this.onSeachHandler();
    }
}

class PicFriendItem extends Container {
    public itemData: any;
    protected nameText: Text;
    protected lvText: Text;
    protected addBtn: NineSliceButton;
    protected icon: Phaser.GameObjects.Image;
    protected dpr: number = 0;
    protected key: string;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        this.setSize(275 * dpr, 36 * dpr);
        this.dpr = dpr;
        this.key = key;
        this.draw();
    }

    public setItemData(data: FriendData, isOwner: boolean = false) {
        this.itemData = data;
        this.nameText.text = data.nickname;
        // this.lvText.text = data.user.level;
    }

    protected draw() {
        this.icon = this.scene.make.image({x: 7.44 * this.dpr - this.width * 0.5, key: this.key, frame: "offline_head"}).setOrigin(0, 0.5).setInteractive().on("pointerup", this.onHeadhandler, this);
        this.nameText = this.scene.make.text({ x: this.icon.x + this.icon.width + 9.67 * this.dpr, y: -this.icon.height * 0.5 + 1 * this.dpr, text: "Natasha Romanoff", style: {
            fontSize: 10 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
            color: "#6F75FF"
        } }, false);

        this.add([this.icon, this.nameText]);
    }

    protected createAddBtn(text: string) {
        const width = 48 * this.dpr;
        const height = 24 * this.dpr;
        return new NineSliceButton(this.scene, (this.width - width) * 0.5 - 18 * this.dpr, 0, width, height, UIAtlasKey.commonKey, "yellow_btn_normal_s", i18n.t("common.add"), this.dpr, this.scale, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
    }

    protected onHeadhandler() {
        this.emit(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, this.itemData);
    }
}

class SearchItem extends PicFriendItem {
    protected draw() {
        super.draw();

        this.addBtn = this.createAddBtn(i18n.t("common.add"));
        this.addBtn.on(CoreUI.MouseEvent.Tap, this.onAddHandler, this);
        this.add(this.addBtn);
    }

    private onAddHandler() {
        this.emit(PicFriendEvent.REQ_FOLLOW_FRIEND, this.itemData);
    }
}

class FollowItem extends PicFriendItem {
    protected draw() {
        super.draw();

        this.addBtn = this.createAddBtn(i18n.t("friendlist.unfollow"));
        this.addBtn.on(CoreUI.MouseEvent.Tap, this.onAddHandler, this);
        this.add(this.addBtn);
    }

    private onAddHandler() {
        this.emit(PicFriendEvent.UNFOLLOW, this.itemData);
    }
}

class FansItem extends PicFriendItem {
    protected draw() {
        super.draw();

        this.addBtn = this.createAddBtn(i18n.t("friendlist.follow"));
        this.addBtn.on(CoreUI.MouseEvent.Tap, this.onAddHandler, this);
        this.add(this.addBtn);
    }

    private onAddHandler() {
        this.emit(PicFriendEvent.FOLLOW, this.itemData);
    }
}

class BlacklistItem extends PicFriendItem {
    protected draw() {
        super.draw();

        this.addBtn = this.createAddBtn(i18n.t("common.remove"));
        this.addBtn.on(CoreUI.MouseEvent.Tap, this.onAddHandler);
        this.add(this.addBtn);
    }

    private onAddHandler() {
        this.emit(PicFriendEvent.REMOVE_FROM_BLACKLIST);
    }
}

class SubFriendContainer extends FriendContainer {
    protected backBtn: Button;
    protected title: Phaser.GameObjects.Text;
    protected gridTable: GameGridTable;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene, width, height, key, dpr);
        this.draw();
    }

    public register() {
        this.backBtn.on(CoreUI.MouseEvent.Tap, this.onBackHandler, this);
    }

    public unregister() {
        this.backBtn.off(CoreUI.MouseEvent.Tap, this.onBackHandler, this);
    }

    public resize() {
        if (this.gridTable) {
            this.gridTable.resetMask();
            const items = [];
            for (let i = 0; i < 100; i++) {
                items.push({ id: "0", nickname: `friend: ${i}` });
            }
            this.gridTable.setItems(items);
        }
    }

    public destroy() {
        this.unregister();
        super.destroy();
    }

    protected draw() {
        this.backBtn = new Button(this.scene, this.key, "back");
        this.backBtn.setPosition((-this.width + this.backBtn.width) * 0.5 + 21.67 * this.dpr, (-this.height + this.backBtn.height) * 0.5 + 47 * this.dpr);

        this.add([this.backBtn]);
    }

    protected onBackHandler() {
        this.emit("hide");
    }

    protected onItemClickHandler() {

    }
}

class SearchContainer extends SubFriendContainer {
    private searchInput: LabelInput;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene, width, height, key, dpr);
    }

    protected draw() {
        super.draw();

        const topbg = new NineSlicePatch(this.scene, 0, 0, 276 * this.dpr, 33 * this.dpr, this.key, "min_pic_bg", {
            left: 5 * this.dpr,
            top: 5 * this.dpr,
            right: 5 * this.dpr,
            bottom: 5 * this.dpr
        });
        topbg.setPosition(0, 73.67 * this.dpr + (topbg.height - this.height) * 0.5);

        this.gridTable = this.createGrideTable(0, 18 * this.dpr, 275 * this.dpr, 400 * this.dpr, 275 * this.dpr, 36 * this.dpr, () => {
            return new SearchItem(this.scene, 0, 0, this.key, this.dpr);
        }, new Handler(this.onItemClickHandler));

        this.searchInput = new LabelInput(this.scene, {
            x: 0,
            y: 0,
            width: 160 * this.dpr,
            height: 30 * this.dpr,
            placeholder: i18n.t("friendlist.search_friends_notes"),
            fontSize: 14 * this.dpr + "px",
            color: "#666666",
        });
        this.searchInput.setPosition(0, topbg.y);

        this.gridTable.y = topbg.height;
        this.gridTable.layout();

        this.add([topbg, this.searchInput]);
    }
}

class BlackContainer extends SubFriendContainer {
    constructor(scene: Phaser.Scene, width: number, heigth: number, key: string, dpr: number) {
        super(scene, width, heigth, key, dpr);
    }

    protected draw() {
        super.draw();

        this.gridTable = this.createGrideTable(0, 18 * this.dpr, 275 * this.dpr, 400 * this.dpr, 275 * this.dpr, 36 * this.dpr, () => {
            return new BlacklistItem(this.scene, 0, 0, this.key, this.dpr);
        }, new Handler(this.onItemClickHandler));
    }
}

export interface FriendData {
    id: string;
    online?: boolean;
    nickname?: string;
    username?: string;
}

export enum FriendChannel {
    Friends,
    Fans,
    Followes,
    Blacklist,
    Search,
    AddFriend,
}
