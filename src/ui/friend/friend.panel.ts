import { Panel } from "../components/panel";
import { Background, Border, Url } from "../../utils/resUtil";
import { WorldService } from "../../game/world.service";
import { Size } from "../../utils/size";
import { NinePatch } from "../components/nine.patch";
import { IListItemComponent } from "../bag/IListItemRender";
import { Font } from "../../utils/font";
import { DynamicImage } from "../components/dynamic.image";
import { Geom } from "phaser";
export interface IFriendIcon {
    res: string;
    name: string;
}
export class FriendPanel extends Panel {
    public static count: number = 4;
    private mWorld: WorldService;
    private mBg;
    private mUpBtn: Phaser.GameObjects.Sprite;
    private mDownBtn: Phaser.GameObjects.Sprite;
    private mClsBtnSprite: Phaser.GameObjects.Sprite;
    private mTitleTxt: Phaser.GameObjects.Text;
    private mFriendList: FriendItem[];
    private mFriendDataList: any[];
    private mIndex: number = 0;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        if (!this.mShowing) return;
        if (this.mWorld.game.device.os.desktop) {
            this.x = size.width / 2;
            this.y = size.height / 2;
        } else {
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                this.x = (this.width - size.width) / 2;
                this.y = 0;
            } else {
                this.x = 0;
                this.y = (this.height - size.height) / 2;
            }
        }

        this.scaleX = this.scaleY = this.mWorld.uiScale;
        this.addAt(this.mBg, 0);
        this.add(this.mTitleTxt);
    }

    public show(param?: any) {
        const size: Size = this.mWorld.getSize();
        this.mData = param;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        super.show();
    }

    public destroy() {
        if (this.mBg) this.mBg.destory();
        if (this.mTitleTxt) this.mTitleTxt.destroy(true);
        if (this.mUpBtn) this.mUpBtn.destroy(true);
        if (this.mDownBtn) this.mDownBtn.destroy(true);
        if (this.mFriendList) {
            this.mFriendList.forEach((item: FriendItem) => {
                if (item) {
                    item.destory();
                    item = null;
                }
            });
        }
        this.mIndex = 0;
        this.mBg = null;
        this.mTitleTxt = null;
        this.mUpBtn = null;
        this.mDownBtn = null;
        this.mFriendList = null;
        super.destroy();
    }

    public friendChat(id: string) {

    }

    public friendGo(gameId: string) {

    }

    public btnScaleHandler(gameObject: any, scaleX: number = 1) {
        this.mScene.tweens.add({
            targets: gameObject,
            duration: 50,
            ease: "Linear",
            props: {
                scaleX: { value: .5 * scaleX },
                scaleY: { value: .5 },
            },
            yoyo: true,
            repeat: 0,
        });
        gameObject.scaleX = scaleX;
        gameObject.scaleY = 1;
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.scene.load.image(Background.getName(), Background.getPNG());
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.image("friendChat", Url.getRes("ui/friend/friend_chat.png"));
        this.scene.load.image("friendGo", Url.getRes("ui/friend/friend_go.png"));
        this.mScene.load.atlas("bagView", Url.getRes("ui/bag/bagView.png"), Url.getRes("ui/bag/bagView.json"));
        super.preload();
    }

    protected init() {
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        const size: Size = this.mWorld.getSize();

        this.mBg = new NinePatch(this.scene, 0, 0, 600 / this.mWorld.uiScale, size.height * .5 * this.mWorld.uiScale, Border.getName(), null, Border.getConfig());
        this.setSize(this.mBg.width, this.mBg.height);
        // this.addAt(this.mBg, 0);
        this.mTitleTxt = this.mScene.make.text(undefined, false);
        this.mTitleTxt.setFontFamily("YaHei");
        this.mTitleTxt.setFontStyle("bold");
        this.mTitleTxt.setFontSize(14);
        this.mTitleTxt.style.align = "left";
        this.mTitleTxt.setText("好友列表");
        this.mTitleTxt.x = -this.mBg.width / 2 + 15;
        this.mTitleTxt.y = -this.mBg.height / 2 + 8;
        // this.add(this.mTitleTxt);

        this.mUpBtn = this.mScene.make.sprite(undefined, false);
        this.mUpBtn.setTexture("bagView", "bagView_tab");
        this.mUpBtn.rotation = Math.PI / 2;
        this.mUpBtn.y = (this.mUpBtn.height / 2 - this.mBg.height) / 2;

        this.mDownBtn = this.mScene.make.sprite(undefined, false);
        this.mDownBtn.setTexture("bagView", "bagView_tab");
        this.mDownBtn.rotation = -Math.PI / 2;
        this.mDownBtn.y = (this.mBg.height - this.mDownBtn.height / 2) / 2;

        this.mDownBtn.setInteractive();
        this.mUpBtn.setInteractive();
        this.mDownBtn.on("pointerup", this.downHandler, this);
        this.mUpBtn.on("pointerup", this.upHandler, this);

        if (!this.mScene.cache.obj.has("clsBtn")) {
            this.mScene.load.spritesheet("clsBtn", Url.getRes("ui/common/common_clsBtn.png"), { frameWidth: 16, frameHeight: 16, startFrame: 1, endFrame: 3 });
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onClsLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onClsLoadCompleteHandler();
        }
        this.initFriendItem();
        super.init();
    }

    protected tweenComplete(show) {
        super.tweenComplete(show);
        this.mWorld.roomManager.currentRoom.getHero().getFriend().requestFriend((data: any[]) => {
            this.setDataList(data);
        });
        if (show) this.resize();
    }

    private downHandler() {
        this.btnScaleHandler(this.mDownBtn);
        const len: number = this.mFriendDataList ? this.mFriendDataList.length : 0;
        const pageNum: number = Math.floor(len / FriendPanel.count);
        this.mIndex = this.mIndex + 1 > pageNum ? pageNum : this.mIndex + 1;
        this.refreshDataList();
    }

    private upHandler() {
        this.btnScaleHandler(this.mUpBtn);
        this.mIndex = this.mIndex - 1 > 0 ? this.mIndex - 1 : 0;
        this.refreshDataList();
    }

    private setDataList(data: any[]) {
        this.mFriendDataList = data;
        const len: number = data.length > FriendPanel.count ? FriendPanel.count : data.length;
        for (let i: number = 0; i < len; i++) {
            const item: FriendItem = this.mFriendList[i];
            const dat = data[this.mIndex * FriendPanel.count + i];
            if (!dat) {
                item.visible = false;
                return;
            }
            item.visible = true;
            dat.index = i;
            item.dataChange(dat);
            this.add(item);
        }
        this.add(this.mUpBtn);
        this.add(this.mDownBtn);
    }

    private refreshDataList() {
        if (!this.mFriendDataList || !this.mFriendList) return;
        const len: number = this.mFriendDataList.length > FriendPanel.count ? FriendPanel.count : this.mFriendDataList.length;
        for (let i: number = 0; i < len; i++) {
            const item: FriendItem = this.mFriendList[i];
            let dat = this.mFriendDataList[this.mIndex * FriendPanel.count + i];
            if (!dat) dat = {};
            dat.index = i;
            item.dataChange(dat);
        }
    }

    private initFriendItem() {
        this.mFriendList = [];
        const len: number = FriendPanel.count;
        const resList: any[] = [{
            res: "friendChat",
            name: "聊天"
        }, {
            res: "friendGo",
            name: "跟随"
        }];
        for (let i: number = 0; i < len; i++) {
            const item: FriendItem = new FriendItem(this.mWorld, this.mScene, this, resList);
            item.y = -this.mBg.height / 2 + this.mTitleTxt.height + i * (item.height + 10) + (item.height / 2 + 10);
            // this.add(item);
            this.mFriendList.push(item);
        }
        // this.add(this.mUpBtn);
        // this.add(this.mDownBtn);
    }

    private onClsLoadCompleteHandler() {
        this.mClsBtnSprite = this.mScene.make.sprite(undefined, false);
        this.mClsBtnSprite.setTexture("clsBtn", "btn_normal");
        this.mClsBtnSprite.x = (this.mBg.width >> 1) - 65;
        this.mClsBtnSprite.y = (-this.mBg.height >> 1);
        this.mClsBtnSprite.setInteractive();
        this.mClsBtnSprite.on("pointerup", this.hide, this);
        this.add(this.mClsBtnSprite);
    }
}

export class FriendItem extends Phaser.GameObjects.Container implements IListItemComponent {
    public index: number;
    public nameTF: Phaser.GameObjects.Text;
    public statusTF: Phaser.GameObjects.Text;
    public mRoleIcon: DynamicImage;

    private mPanel: FriendPanel;
    private mWorld: WorldService;
    private iconResList: IFriendIcon[];
    private mScene: Phaser.Scene;
    constructor(world: WorldService, scene: Phaser.Scene, panel: FriendPanel, iconResList: IFriendIcon[]) {
        super(scene);
        this.mPanel = panel;
        this.mWorld = world;
        this.mScene = scene;
        const size: Size = this.mWorld.getSize();
        const mBg = new NinePatch(scene, 0, 0, 570, 100, Border.getName(), null, Border.getConfig());
        this.addAt(mBg, 0);
        this.setSize(mBg.width, mBg.height);

        this.mRoleIcon = new DynamicImage(scene, -mBg.width / 2, 0);
        this.mRoleIcon.scaleX = this.mRoleIcon.scaleY = .15;
        this.add(this.mRoleIcon);

        this.nameTF = scene.make.text({
            align: "left",
            style: { font: Font.YAHEI_20_BOLD, fill: "#FFCC00" }
        }, false);
        this.statusTF = scene.make.text({
            align: "left",
            style: { font: "14px YaHei" }
        }, false);
        this.nameTF.y = 10 - mBg.height / 2;
        this.add(this.nameTF);
        this.statusTF.x = this.nameTF.x;
        this.add(this.statusTF);

        this.iconResList = iconResList;
    }

    public getView(): any {
        return this;
    }

    public dataChange(data: any) {
        const lv: number = data.level || 0;
        const id: string = data.id || "1";
        const name: string = data.nickname || "test";
        this.nameTF.setText(name);
        this.mRoleIcon.load(Url.getOsdRes(data.avatar || "1"));
        this.mRoleIcon.x = -this.width / 2 + 64;
        this.nameTF.x = this.mRoleIcon.x + 54;
        this.index = data.index;
        if (this.iconResList) {
            const len: number = this.iconResList.length;
            for (let i: number = 0; i < len; i++) {
                const icon: Phaser.GameObjects.Image = this.mScene.make.image(undefined, false);
                const iconCon: Phaser.GameObjects.Container = this.mScene.make.container(undefined, false);
                const bg = new NinePatch(this.mScene, 0, 0, 60, 60, Border.getName(), null, Border.getConfig());
                const txt = this.mScene.make.text(undefined, false);
                const friendIconData: IFriendIcon = this.iconResList[i];
                txt.setText(friendIconData.name);
                icon.setTexture(friendIconData.res);
                icon.scaleX = icon.scaleY = .8;
                icon.y = -bg.height / 2 + icon.height / 2;
                iconCon.add(icon);
                iconCon.add(txt);
                iconCon.addAt(bg, 0);
                txt.x = -txt.width >> 1;
                txt.y = iconCon.height + txt.height / 2;
                iconCon.x = this.width / 2 - (i + 1) * 70;
                iconCon.setSize(60, 60);
                iconCon.setInteractive(new Geom.Rectangle(0, 0, 60, 60), Phaser.Geom.Rectangle.Contains);
                iconCon.on("pointerdown", () => {
                    this.mPanel.btnScaleHandler(iconCon);
                }, this);
                this.add(iconCon);
            }
        }
    }

    public destory() {
        this.index = 0;
        if (this.nameTF) {
            this.nameTF.destroy(true);
        }
        if (this.statusTF) {
            this.statusTF.destroy(true);
        }

        if (this.mRoleIcon) {
            this.mRoleIcon.destroy(true);
        }
        this.nameTF = null;
        this.statusTF = null;
        this.mPanel = null;
        this.mWorld = null;
        super.destroy(true);
    }
}
