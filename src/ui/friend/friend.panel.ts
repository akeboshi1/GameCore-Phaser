import { Panel } from "../components/panel";
import { Background, Border, Url } from "../../utils/resUtil";
import { WorldService } from "../../game/world.service";
import { Size } from "../../utils/size";
import { NinePatch } from "../components/nine.patch";
import { IListItemComponent } from "../bag/IListItemRender";

export class FriendPanel extends Panel {
    public static count: number = 5;
    private mWorld: WorldService;
    private mBg;
    private mUpBtn: Phaser.GameObjects.Sprite;
    private mDownBtn: Phaser.GameObjects.Sprite;
    private mClsBtnSprite: Phaser.GameObjects.Sprite;
    private mTitleTxt: Phaser.GameObjects.Text;
    private mFriendList: FriendItem[];
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        if (!this.mShowing) return;
        if (this.mBg) {
            this.mBg.destroy(true);
            this.mBg = null;
        }
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

        this.mBg = new NinePatch(this.scene, 0, 0, 1080, size.height / 2, Background.getName(), null, Background.getConfig());
        this.setSize(this.mBg.width, this.mBg.height);
        this.add(this.mUpBtn);
        this.add(this.mDownBtn);
        this.addAt(this.mBg, 0);
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
        this.mBg = null;
        this.mTitleTxt = null;
        this.mUpBtn = null;
        this.mDownBtn = null;
        this.mFriendList = null;
        super.destroy();
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.scene.load.image(Background.getName(), Background.getPNG());
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.mScene.load.atlas("bagView", Url.getRes("ui/bag/bagView.png"), Url.getRes("ui/bag/bagView.json"));
        super.preload();
    }

    protected init() {
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        const size: Size = this.mWorld.getSize();
        const wid: number = size.width;
        const hei: number = size.height;

        this.mBg = new NinePatch(this.scene, 0, 0, 1080, size.height / 2, Background.getName(), null, Background.getConfig());
        this.setSize(this.mBg.width, this.mBg.height);

        this.mTitleTxt = this.mScene.make.text(undefined, false);

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
    }

    private upHandler() {
        this.btnScaleHandler(this.mUpBtn);
    }

    private btnScaleHandler(gameObject: Phaser.GameObjects.Sprite, scaleX: number = 1) {
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

    private setDataList(data: any[]) {
        if (this.mFriendList) {
            this.mFriendList.forEach((item: FriendItem) => {
                if (item) {
                    item.destory();
                    item = null;
                }
            });
        }
        this.mFriendList = [];
        const len: number = data.length;
        for (let i: number = 0; i < len; i++) {
            const item: FriendItem = new FriendItem(this, "", ["", ""]);
            this.mFriendList.push(item);
        }
    }

    private onClsLoadCompleteHandler() {
        this.mClsBtnSprite = this.mScene.make.sprite(undefined, false);
        this.mClsBtnSprite.setTexture("clsBtn", "btn_normal");
        this.mClsBtnSprite.x = (this.mBg.width >> 1) - 65;
        this.mClsBtnSprite.y = (-this.mBg.height >> 1);

        // ===============背包界面左翻按钮
        this.mClsBtnSprite.setInteractive();
        this.mClsBtnSprite.on("pointerup", this.hide, this);
        this.add(this.mClsBtnSprite);
    }
}

export class FriendItem implements IListItemComponent {
    public index: number;
    constructor(panel: FriendPanel, bgRes: string, iconResList: string[]) {
    }

    public getView(): any {

    }

    public dataChange(data: any) {

    }

    public destory() {

    }
}
