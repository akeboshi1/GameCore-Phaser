import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { Button, NineSlicePatch } from "../../../lib/rexui/lib/ui/ui-components";
import { i18n } from "../../i18n";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import Text = Phaser.GameObjects.Text;
import Image = Phaser.GameObjects.Image;
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
    private bg: Image;
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
        this.mSubContanerMap.set(FriendChannel.NewFriend, NewFriendContainer);
        this.mSubContanerMap.set(FriendChannel.NewFans, NewFansContainer);

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
        this.friendContainer.on(PicFriendEvent.FOLLOW, this.onReqFollowFriendHandler, this);
        this.friendContainer.on(PicFriendEvent.UNFOLLOW, this.onUnfollowFriendHanlder, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off(CoreUI.MouseEvent.Tap, this.OnClosePanel, this);
        this.friendContainer.off("shwoAddFriend", this.onShowAddFriendHandler, this);
        this.friendContainer.off(PicFriendEvent.FETCH_FRIEND, this.onFetchFriendHandler, this);
        this.friendContainer.off(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, this.onReqFriendAttributesHandler, this);
        this.friendContainer.off(PicFriendEvent.FOLLOW, this.onReqFollowFriendHandler, this);
        this.friendContainer.off(PicFriendEvent.UNFOLLOW, this.onUnfollowFriendHanlder, this);

        this.friendContainer.unregister();
    }

    public setFriend(type: FriendChannel, data) {
        const subContaienr = this.mSubContanerMap.get(type);
        if (subContaienr) {
            subContaienr.setItem(data);
        }
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

        this.friendContainer = new MainContainer(this.scene, this.bg.width, this.bg.height, this.key, this.dpr, this.scale);
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

    private onReqFollowFriendHandler(id: string) {
        this.emit(PicFriendEvent.FOLLOW, id);
    }

    private onUnfollowFriendHanlder(id: string) {
        this.emit(PicFriendEvent.UNFOLLOW, id);
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
    }
}

class FriendContainer extends Container {
    protected titleText: Text;
    constructor(scene: Phaser.Scene, width: number, height: number, protected key: string, protected dpr: number) {
        super(scene, 0, 0);
        this.setSize(width, height);
    }

    protected draw() {
        const posY = 49 * this.dpr - this.height * 0.5;
        const mfont = `bold ${16 * this.dpr}px ${Font.DEFULT_FONT}`;
        this.titleText = this.scene.make.text({ x: 0, y: posY, style: { font: mfont, bold: true, color: "#0" } }).setOrigin(0.5, 0);
        this.add(this.titleText);
    }

    protected createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number, createFun: Function, callback: Handler, ) {
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
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item,
                    w = cell.width,
                    h = cell.height;
                if (cellContainer === null) {
                    cellContainer = createFun(this.scene, cell);
                }
                if (item.type === FriendChannel.Null) {
                    cell.setHeight(11 * this.dpr);
                } else {
                    if (cell.height !== capH) {
                        cell.setHeight(capH);
                    }
                }
                cellContainer.setSize(cell.width, cell.height);
                cellContainer.setData({ item });
                cellContainer.setItemData(item);
                return cellContainer;
            }
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
    private friendNum: Text;
    private onlineCheckBox: CheckBox;
    private topContent: Container;
    private channelGroup: CheckboxGroup;
    private searchBtn: Button;
    private addFriendBtn: Button;
    private friendTabel: GameGridTable;
    private showingFriends: FriendData[];
    private friendDatas: Map<FriendChannel, FriendData[]>;
    private searchInput: LabelInput;
    // private friendList: FriendList;
    private uiScale: number;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number, uiScale: number) {
        super(scene, width, height, key, dpr);
        this.friendDatas = new Map();
        this.uiScale = uiScale;
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
        let result: FriendData[] = [];
        let target = null;
        this.friendDatas.set(type, data);
        for (const friend of data) {
            target = friend.followed_user || friend.user || friend;
            // if (type === FriendChannel.Followes) {
            //     target = friend.followed_user;
            // } else if (type === FriendChannel.Fans) {
            //     target = friend.user;
            // } else {
            //     target = friend;
            // }
            if (target) result.push({ type, id: target._id, nickname: target.nickname});
        }
        this.sortByName(result);
        let title = "";
        let friendType = "";
        switch(type) {
            case FriendChannel.Friends:
                title = i18n.t("friendlist.title");
                friendType = i18n.t("friendlist.friends");
                const menu: FriendData[] = [{ type: FriendChannel.Menu, menuData: { type: FriendChannel.NewFans } }, { type: FriendChannel.Menu, menuData: { type: FriendChannel.NewFriend } }, { type: FriendChannel.Menu, menuData: { type: FriendChannel.Blacklist } }, { type: FriendChannel.Null }];
                result = menu.concat(result);
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
        this.showingFriends = result;
        // this.friendList.setItems(this.showingFriends);
        this.friendTabel.setItems(this.showingFriends);
        if (title) this.titleText.setText(title);
        this.friendNum.setText(`Number of ${friendType}: ${data.length}`);
    }

    public filterById(id: string) {
        if (!this.showingFriends) {
            return;
        }
        const result = this.showingFriends.filter((friend: FriendData) => friend.id !== id);
        this.friendTabel.setItems(result);
    }

    protected draw() {
        super.draw();
        const posY = -this.height * 0.5 + 17.33 * this.dpr;
        this.friendNum = this.scene.make.text({ x: 0, y: posY, text: "", style: { color: "#ffffff", fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.add(this.friendNum);

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
        }).setOrigin(0, 0.5);
        this.topContent.add([topbg, this.onlineCheckBox, this.searchInput, this.searchBtn, this.addFriendBtn]);

        const tableFont = {
            fontSize: 14 * this.dpr,
            fontFamily: Font.DEFULT_FONT
        };
        const friendsTab = new Button(this.scene, this.key, "friend_default", "friend_select", i18n.t("friendlist.friends"));
        friendsTab.y = this.height * 0.5 - 14 * this.dpr - friendsTab.height * 0.5;
        friendsTab.setTextStyle(tableFont);
        const fansTab = new Button(this.scene, this.key, "fans_default", "fans_select", i18n.t("friendlist.fans"));
        fansTab.y = friendsTab.y;
        fansTab.setTextStyle(tableFont);
        const followsTab = new Button(this.scene, this.key, "follow_default", "follow_select", i18n.t("friendlist.follow"));
        followsTab.y = friendsTab.y;
        followsTab.setTextStyle(tableFont);
        friendsTab.x = (-fansTab.width - friendsTab.width) * 0.5 - 0.67 * this.dpr;
        followsTab.x = (fansTab.width + followsTab.width) * 0.5 + 0.67 * this.dpr;
        this.add([friendsTab, fansTab, followsTab]);

        this.channelGroup = new CheckboxGroup();
        this.channelGroup.on("selected", this.onSelectChannelHandler, this);
        this.channelGroup.appendItemAll([friendsTab, fansTab, followsTab]);

        this.friendTabel = this.createGrideTable(0,this.topContent.y + this.topContent.height + 380 * this.dpr * 0.5 + 18 * this.dpr, 275 * this.dpr, 380 * this.dpr, 275 * this.dpr, 36 * this.dpr, (scene, cell) => {
            const item = new PicFriendItem(this.scene, 0, 0, this.key, this.dpr);
            item.on(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, this.onFtechPlayerHandler, this);
            item.on(PicFriendEvent.FOLLOW, this.onReqFollowFriendHandler, this);
            item.on(PicFriendEvent.UNFOLLOW, this.onReqUnfollowFriendHandler, this);
            return item;
        }, new Handler(this, this.onSelectItemHandler));
    }

    private onFtechPlayerHandler(friend: FriendData) {
        this.emit(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, friend.id);
    }

    private onReqFollowFriendHandler(friend: FriendData) {
        this.emit(PicFriendEvent.FOLLOW, friend.id);
    }

    private onReqUnfollowFriendHandler(friend: FriendData) {
        this.emit(PicFriendEvent.UNFOLLOW, friend.id);
    }

    private onSelectChannelHandler(item) {
        if (!this.channelGroup || this.channelGroup.selectedIndex < 0) {
            return;
        }
        this.emit(PicFriendEvent.FETCH_FRIEND, this.channelGroup.selectedIndex);
        // const data = this.friendDatas.get(this.channelGroup.selectedIndex);
        // if (!data) {
        //     this.emit(PicFriendEvent.FETCH_FRIEND, this.channelGroup.selectedIndex);
        // } else {
        //     this.showFriend(this.channelGroup.selectedIndex, data);
        // }
    }

    private onSelectItemHandler(item) {
        const data: FriendData = item.getData("item");
        if (!data || !data.menuData) {
            return;
        }
        if (data.type === FriendChannel.Menu) {
            this.emit("shwoAddFriend", data.menuData.type);
        }
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
        if (!text) {
            this.friendTabel.setItems(this.showingFriends);
            return;
        }
        let result = this.showingFriends.slice(0);
        result = result.filter((friend: FriendData) => {
            if (friend.nickname && friend.nickname.indexOf(text) > -1) {
                return true;
            }
            return false;
        });
        this.friendTabel.setItems(result);
    }

    private onTextChangeHandler() {
        this.onSeachHandler();
    }
}

class PicFriendItem extends Container {
    public itemData: any;
    protected mDpr: number = 0;
    protected mKey: string;
    private currnetType: FriendChannel;
    private currentRender: IRenderer;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        this.setSize(275 * dpr, 36 * dpr);
        this.mDpr = dpr;
        this.mKey = key;
    }

    public setItemData(data: FriendData) {
        this.itemData = data;
        if (this.currnetType !== data.type) {
            this.currnetType = data.type;
            if (this.currentRender) {
                this.currentRender.destroy();
                this.currentRender = null;
            }
            this.currentRender = this.createRenderer(data.type);
        }
        if (!this.currentRender) return;
        this.currentRender.setItemData(data);
    }

    protected createAddBtn(text: string) {
        const width = 48 * this.mDpr;
        const height = 24 * this.mDpr;
        return new NineSliceButton(this.scene, (this.width - width) * 0.5 - 18 * this.mDpr, 0, width, height, UIAtlasKey.commonKey, "yellow_btn_normal_s", i18n.t("common.add"), this.mDpr, this.scale, {
            left: 10 * this.mDpr,
            top: 10 * this.mDpr,
            right: 10 * this.mDpr,
            bottom: 10 * this.mDpr
        });
    }

    protected onHeadhandler() {
        this.emit(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, this.itemData);
    }

    private createRenderer(type: FriendChannel) {
        // TODO 改成反射
        switch(type) {
            case FriendChannel.Friends:
            case FriendChannel.NewFriend:
                return new FriendRenderer(this.scene, this);
            case FriendChannel.Null:
                return new NullRenderer(this.scene, this);
            case FriendChannel.Menu:
                return new MenuRenderer(this.scene, this);
            case FriendChannel.Followes:
                return new FollowRenderer(this.scene, this);
            case FriendChannel.Fans:
                return new FansRenderer(this.scene, this);
            case FriendChannel.Blacklist:
                return new BlacklistRenderer(this.scene, this);
        }
    }

    get key(): string {
        return this.mKey;
    }

    get dpr(): number {
        return this.mDpr;
    }
}

interface IRenderer {
    setItemData(data);
    destroy();
}

class MenuRenderer implements IRenderer {
    private icon: Image;
    private text: Text;
    private arrow: Image;
    constructor(private scene: Phaser.Scene, private owner: PicFriendItem) {
        this.icon = this.scene.make.image({
            x: 7.44 * this.owner.dpr - this.owner.width * 0.5,
            key: owner.key,
            frame: "black_list"
        }, false).setOrigin(0, 0.5);
        this.text = this.scene.make.text({
            x: this.icon.x + this.icon.width + 9.67 * owner.dpr,
            style: {
                fontSize: 9.33 * owner.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#000000"
            }
        }).setOrigin(0, 0.5);
        this.arrow = this.scene.make.image({
            x: owner.width * 0.5 - 20 * owner.dpr,
            key: owner.key,
            frame: "arrow"
        }).setOrigin(1, 0.5);
        this.owner.add([this.icon, this.text, this.arrow]);
    }

    setItemData(data: FriendData) {
        const menudata = data.menuData;
        if (!menudata) {
            return;
        }
        switch(menudata.type) {
            case FriendChannel.NewFans:
                this.icon.setFrame("new_fans");
                this.text.text = "Fans";
                break;
            case FriendChannel.Blacklist:
                this.icon.setFrame("black_list");
                this.text.text = "Blacklist";
                break;
            case FriendChannel.NewFriend:
                this.icon.setFrame("friend_add");
                this.text.text = "Add Buddy";
                break;
        }
    }

    destroy() {
        if (this.icon) this.icon.destroy();
        if (this.text) this.text.destroy();
        if (this.arrow) this.arrow.destroy();
    }
}

class NullRenderer implements IRenderer {
    private graphics: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, private owner: PicFriendItem) {
        this.graphics = scene.make.graphics(undefined, false);
        this.graphics.fillStyle(0xF5F5F5);
        // this.graphics.fillRect(-this.owner.width * 0.5, -this.owner.height * 0.5, this.owner.width, this.owner.height);
        this.graphics.fillRect(0, 0, this.owner.width * 2, this.owner.height * 2);
        owner.add(this.graphics);
    }

    public setItemData(data) {
    }

    public destroy() {
        if (this.graphics) this.graphics.destroy();
    }
}

class FriendRenderer implements IRenderer {
    protected icon: Image;
    protected nameText: Text;
    protected itemData: any;
    constructor(scene: Phaser.Scene, protected owner: PicFriendItem) {
        this.icon = scene.make.image({x: 7.44 * owner.dpr - owner.width * 0.5, key: owner.key, frame: "offline_head"}).setOrigin(0, 0.5).setInteractive().on("pointerup", this.onHeadhandler, this);
        this.nameText = scene.make.text({ x: this.icon.x + this.icon.width + 9.67 * owner.dpr, y: -this.icon.height * 0.5 + 1 * owner.dpr, text: "Natasha Romanoff", style: {
            fontSize: 10 * owner.dpr,
            fontFamily: Font.DEFULT_FONT,
            color: "#6F75FF"
        } }, false);

        owner.add([this.icon, this.nameText]);
    }

    public setItemData(data: FriendData) {
        this.itemData = data;
        this.nameText.text = data.nickname;
    }

    public destroy() {
        if (!this.owner) {
            return;
        }
        const list = this.owner.list;
        while(list.length) {
            list[list.length - 1].destroy();
        }
    }

    protected onHeadhandler() {
        this.owner.emit(PicFriendEvent.REQ_FRIEND_ATTRIBUTES, this.itemData);
    }
}

class FansRenderer extends FriendRenderer {
    protected addBtn: NineSliceButton;
    constructor(protected scene: Phaser.Scene, owner: PicFriendItem) {
        super(scene, owner);

        this.addBtn = this.createAddBtn(i18n.t("friendlist.follow"));
        this.addBtn.on(CoreUI.MouseEvent.Tap, this.onAddHandler, this);
        this.owner.add(this.addBtn);
    }

    protected createAddBtn(text: string) {
        // TODO 按钮不用九宫格
        const { width, height, key, dpr } = this.owner;
        const btnW = 48 * dpr;
        const btnH = 24 * dpr;
        const button =  new NineSliceButton(this.scene, (width - btnW) * 0.5 - 18 * dpr, 0, btnW, btnH, UIAtlasKey.commonKey, "yellow_btn_normal_s", i18n.t("common.add"), dpr, 1, {
            left: 10 * 1,
            top: 10 * 1,
            right: 10 * 1,
            bottom: 10 * 1
        });
        button.setTextStyle({
            fontSize: 9 * dpr,
            fontFamily: Font.DEFULT_FONT
        });
        return button;
    }

    protected onAddHandler() {
        this.owner.emit(PicFriendEvent.FOLLOW, this.itemData);
    }
}

class FollowRenderer extends FansRenderer {
    constructor(scene: Phaser.Scene, owner: PicFriendItem) {
        super(scene, owner);
        if (this.addBtn) this.addBtn.setText(i18n.t("friendlist.unfollow"));
    }

    protected onAddHandler() {
        this.owner.emit(PicFriendEvent.UNFOLLOW, this.itemData);
    }
}

class BlacklistRenderer extends FansRenderer {
    constructor(scene: Phaser.Scene, owner: PicFriendItem) {
        super(scene, owner);
        this.addBtn.setText(i18n.t("common.remove"));
    }

    protected onAddHandler() {
        this.owner.emit(PicFriendEvent.REMOVE_FROM_BLACKLIST);
    }
}

class SubFriendContainer extends FriendContainer {
    protected backBtn: Button;
    protected gridTable: GameGridTable;
    protected friendType: FriendChannel;
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
            for (let i = 0; i < 10000; i++) {
                items.push({ type: this.friendType, id: "0", nickname: `friend: ${i}` });
            }
            this.gridTable.setItems(items);
        }
    }

    public setItems(items: any[]) {
        if (this.gridTable) this.gridTable.setItems(items);
    }

    public destroy() {
        this.unregister();
        super.destroy();
    }

    protected draw() {
        super.draw();
        this.backBtn = new Button(this.scene, this.key, "back");
        this.backBtn.setPosition((-this.width + this.backBtn.width) * 0.5 + 21.67 * this.dpr, (-this.height + this.backBtn.height) * 0.5 + 47 * this.dpr);

        this.gridTable = this.createGrideTable(0, 18 * this.dpr, 275 * this.dpr, 400 * this.dpr, 275 * this.dpr, 36 * this.dpr, () => {
            return new PicFriendItem(this.scene, 0, 0, this.key, this.dpr);
        }, new Handler(this.onItemClickHandler));

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
        this.friendType = FriendChannel.Search;
    }

    protected draw() {
        super.draw();

        this.titleText.setText(i18n.t("friendlist.search"));

        const topbg = new NineSlicePatch(this.scene, 0, 0, 276 * this.dpr, 33 * this.dpr, this.key, "min_pic_bg", {
            left: 5 * this.dpr,
            top: 5 * this.dpr,
            right: 5 * this.dpr,
            bottom: 5 * this.dpr
        });
        topbg.setPosition(0, 73.67 * this.dpr + (topbg.height - this.height) * 0.5);

        this.searchInput = new LabelInput(this.scene, {
            x: 0,
            y: 0,
            width: 160 * this.dpr,
            height: 30 * this.dpr,
            placeholder: i18n.t("friendlist.search_friends_notes"),
            fontSize: 12 * this.dpr + "px",
            color: "#666666",
        }).setOrigin(0, 0.5);
        this.searchInput.setPosition(0, topbg.y);

        this.gridTable.y = topbg.height;
        this.gridTable.layout();

        this.add([topbg, this.searchInput]);
    }
}

class BlackContainer extends SubFriendContainer {
    constructor(scene: Phaser.Scene, width: number, heigth: number, key: string, dpr: number) {
        super(scene, width, heigth, key, dpr);
        this.friendType = FriendChannel.Blacklist;
    }

    draw() {
        super.draw();
        this.titleText.setText(i18n.t("friendlist.blacklist"));
    }
}

class NewFansContainer extends SubFriendContainer {
    constructor(scene: Phaser.Scene, width: number, heigth: number, key: string, dpr: number) {
        super(scene, width, heigth, key, dpr);
        this.friendType = FriendChannel.Blacklist;
    }

    draw() {
        super.draw();
        this.titleText.setText(i18n.t("friendlist.new_fans"));
    }
}

class NewFriendContainer extends SubFriendContainer {
    constructor(scene: Phaser.Scene, width: number, heigth: number, key: string, dpr: number) {
        super(scene, width, heigth, key, dpr);
        this.friendType = FriendChannel.Blacklist;
    }

    draw() {
        super.draw();
        this.titleText.setText(i18n.t("friendlist.new_friend"));
    }
}

class SearchInput extends LabelInput {
    private searchBtn: Button;
    constructor(scene: Phaser.Scene, config: any, key: string) {
        super(scene, config);

        this.searchBtn = new Button(this.scene, key, "search");
        this.add(this.searchBtn);
    }
}

interface MenuData {
    type: FriendChannel;
}

export interface FriendData {
    type: FriendChannel;
    id?: string;
    online?: boolean;
    nickname?: string;
    username?: string;
    menuData?: MenuData;
}

export enum FriendChannel {
    Friends,
    Fans,
    Followes,
    Blacklist,
    Search,
    NewFriend,
    Menu,
    NewFans,
    Null
}
