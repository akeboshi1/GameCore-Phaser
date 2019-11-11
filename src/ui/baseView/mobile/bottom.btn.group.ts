import { Panel } from "../../components/panel";
import { WorldService } from "../../../game/world.service";
import { Url } from "../../../utils/resUtil";
import { IconBtn } from "./icon.btn";
import { Size } from "../../../utils/size";
import { UIMediatorType } from "../../ui.mediatorType";
import { ChatMediator } from "../../chat/chat.mediator";
import { MainUIMediator } from "../mainUI.mediator";

export class BottomBtnGroup extends Panel {
    private mResKey: string;
    private mChatContainer: Phaser.GameObjects.Container;
    private mChatBg: Phaser.GameObjects.Image;
    private mChatText: Phaser.GameObjects.Text;
    private mTurnBtn: IconBtn;
    private mBagBtn: IconBtn;
    private mShopBtn: IconBtn;
    private mBtnList: IconBtn[];
    private mWorld: WorldService;
    private mExpandBoo: boolean = false;
    // private mOrientation: Phaser.Scale.Orientation;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
    }

    public show(param?: any) {
        this.scaleX = this.scaleY = this.mWorld.uiScale;
        super.show(param);
    }

    // public changeOrientation(type: Phaser.Scale.Orientation) {
    // this.mOrientation = type;
    // }

    public resize() {
        const size: Size = this.mWorld.getSize();
        switch (this.mWorld.game.scale.orientation) {
            case Phaser.Scale.Orientation.LANDSCAPE:
                this.x = size.width >> 1;
                break;
            case Phaser.Scale.Orientation.PORTRAIT:
                this.x = size.width - (this.width / 2 + 40) * this.mWorld.uiScale;
                break;
        }
        this.y = size.height - 120 * this.mWorld.uiScale;
        this.scaleX = this.scaleY = this.mWorld.uiScale;
        this.mChatText.setStyle({ "fontSize": Math.floor(30 * this.mWorld.uiScale) });
    }

    public tweenView(show: boolean) {
        const size: Size = this.mWorld.getSize();
        const baseY: number = size.height - 120 * this.mWorld.uiScale;
        const toY: number = show === true ? baseY : baseY + 50;
        const toAlpha: number = show === true ? 1 : 0;
        this.mScene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Linear",
            props: {
                y: { value: toY },
                alpha: { value: toAlpha },
            },
        });
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mResKey = "baseView";
        this.mScene.load.atlas(this.mResKey, Url.getRes("ui/baseView/mainui_mobile.png"), Url.getRes("ui/baseView/mainui_mobile.json"));
        super.preload();
    }

    protected init() {
        this.mBtnList = [];
        const size: Size = this.mWorld.getSize();
        let mWid: number = 0;
        let mHei: number = 0;
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        const chatBgWidth: number = 430;
        const chatBgHeight: number = 230;
        this.mChatContainer = this.mScene.make.container(undefined, false);
        this.mChatBg = this.mScene.make.image(undefined, false);
        this.mChatBg.setTexture(this.mResKey, "btnGroup_chatBg.png");
        this.mChatContainer.addAt(this.mChatBg, 0);
        this.mChatText = this.mScene.make.text({
            width: chatBgWidth,
            height: chatBgHeight,
            style: { font: "bold YaHei", fontSize: Math.floor(30 * this.mWorld.uiScale), wordWrap: { width: 430, useAdvancedWrap: true } }
        }, false);
        this.mChatText.setText("测试测试测试测试测试测试测试测试测试123123哈哈哈哈哈哈");
        this.mChatContainer.addAt(this.mChatText, 1);
        this.mChatContainer.setSize(chatBgWidth, chatBgHeight);
        this.mChatText.x = -this.mChatContainer.width >> 1;
        this.mChatText.y = -this.mChatContainer.height >> 1;
        this.mChatContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, chatBgWidth, chatBgHeight), Phaser.Geom.Rectangle.Contains);
        this.add(this.mChatContainer);
        mWid += this.mChatContainer.width;
        mHei += this.mChatContainer.height;
        this.mTurnBtn = new IconBtn(this.mScene, this.mWorld, this.mResKey, ["btnGroup_white_normal.png", "btnGroup_white_light.png", "btnGroup_white_select.png"], "btnGroup_bottom_expand.png", 1);
        this.mTurnBtn.x = (mWid >> 1) + 30;
        this.mTurnBtn.y = mHei - this.mTurnBtn.height >> 1;
        this.mTurnBtn.setPos(this.mTurnBtn.x, this.mTurnBtn.y);
        this.add(this.mTurnBtn);

        this.mBagBtn = new IconBtn(this.mScene, this.mWorld, this.mResKey, ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"], "btnGroup_bag_icon.png", 1);
        this.mBagBtn.x = this.mTurnBtn.x;
        this.mBagBtn.y = this.mTurnBtn.y - this.mTurnBtn.height / 2 - this.mBagBtn.height / 2 - 10;
        this.mBagBtn.setPos(this.mBagBtn.x, this.mBagBtn.y);
        mWid += this.mBagBtn.width + 30;
        this.add(this.mBagBtn);
        this.setSize(mWid, mHei);
        this.mBtnList.push(this.mBagBtn);
        this.mTurnBtn.setClick(() => {
            this.turnHandler();
        });

        this.mBagBtn.setClick(() => {
            this.bagHandler();
        });
        this.resize();
        this.mChatContainer.on("pointerdown", this.chatHandler, this);
        super.init();
    }

    private turnHandler() {
        const easeType: string = this.mExpandBoo ? "Sine.easeIn" : "Sine.easeOut";
        if (this.mChatContainer && this.mChatContainer.parentContainer) {
            const toScaleX: number = this.mExpandBoo ? 1 : 0;
            const toScaleY: number = this.mExpandBoo ? 1 : 0;
            this.mScene.tweens.add({
                targets: this.mChatContainer,
                duration: 300,
                ease: easeType,
                props: {
                    scaleX: { value: toScaleX },
                    scaleY: { value: toScaleY }
                }
            });
        }
        if (!this.mBtnList || this.mBtnList.length < 1) {
            this.mExpandBoo = !this.mExpandBoo;
            return;
        }
        const len: number = this.mBtnList.length;
        for (let i: number = 0; i < len; i++) {
            const btn: IconBtn = this.mBtnList[i];
            const angle: number = (90 * (i + 2) / -180) * Math.PI;
            const toX: number = this.mExpandBoo ? btn.getPos().x : this.mChatContainer.width / 2 - Math.abs(btn.getPos().y) - 20;
            const toY: number = this.mExpandBoo ? btn.getPos().y : this.mTurnBtn.y;
            this.mScene.tweens.add({
                targets: btn,
                duration: 300,
                ease: easeType,
                props: {
                    x: { value: toX },
                    y: { value: toY }
                },
                onComplete: (tween, targets, ship) => {
                    if (i === len - 1) {
                        this.mExpandBoo = !this.mExpandBoo;
                    }
                },
                onCompleteParams: [this]
            });
        }
    }

    private chatHandler() {
        // ======================show chatView
        let chatMed: ChatMediator = this.mWorld.uiManager.getMediator(ChatMediator.NAME) as ChatMediator;
        if (chatMed === undefined) {
            chatMed = new ChatMediator(this.mWorld, this.mScene);
            this.mWorld.uiManager.setMediator(ChatMediator.NAME, chatMed);
        }
        const showBoo = chatMed.isShow();
        if (showBoo) {
           // chatMed.hide();
        } else {
            chatMed.show();
        }
        // =====================tween out/in baseView
        const baseViewMed: MainUIMediator = this.mWorld.uiManager.getMediator(MainUIMediator.NAME) as MainUIMediator;
        if (baseViewMed) {
            baseViewMed.tweenView(false);
        }
    }

    private bagHandler() {
        this.mWorld.uiManager.getMediator(UIMediatorType.BagMediator).show();
        // =============index = 0 为背包按钮
    }
}
