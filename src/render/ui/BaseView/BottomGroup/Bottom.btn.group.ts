import { BasePanel } from "../../Components/BasePanel";
import { IconBtn } from "../Icon.btn";
import { UIMediatorType } from "../../Ui.mediatorType";
import { ChatMediator } from "../../Chat/Chat.mediator";
import { CheckButton } from "../../Components/Check.button";
import { BagMediator } from "../../Bag/BagView/BagMediator";
import { RightMediator } from "../RightGroup/Right.mediator";
import { ElementStorageMediator } from "../../ElementStorage/ElementStorageMediator";
import { BaseMediator } from "apowophaserui";
import { WorldService } from "../../../world.service";
import { Size } from "../../../../utils/size";
import { JoyStickManager } from "../../../manager/joystick.manager";
import { Url } from "../../../../utils/resUtil";
export class BottomBtnGroup extends BasePanel {
    private mResKey: string;
    private mChatContainer: Phaser.GameObjects.Container;
    private mChatBg: Phaser.GameObjects.Image;
    private mChatText: Phaser.GameObjects.Text;
    private mTurnBtn: IconBtn;
    private mBagBtn: IconBtn;
    private mMarketBag: IconBtn;
    private mShopBtn: IconBtn;
    private mVoiceBtn: CheckButton;
    private mMicBtn: CheckButton;
    private mBtnList: IconBtn[];
    private mExpandBoo: boolean = false;
    private tmpWid: number = 0;
    private tmpHei: number = 0;
    // private mOrientation: Phaser.Scale.Orientation;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.disInteractive();
    }

    public show(param?: any) {
        super.show(param);
    }

    public addListen() {
        this.mChatContainer.on("pointerdown", this.chatHandler, this);
        this.mVoiceBtn.on("selected", this.onSelectedVoiceHandler, this);
        this.mMicBtn.on("selected", this.onSelectedMicHandler, this);
    }

    public removeListen() {
        this.mChatContainer.off("pointerdown", this.chatHandler, this);
        this.mVoiceBtn.off("selected", this.onSelectedVoiceHandler, this);
        this.mMicBtn.off("selected", this.onSelectedMicHandler, this);
    }
    public resize() {
        const size: Size = this.mWorld.getSize();
        this.scale = this.mWorld.uiScale;
        if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
            this.x = size.width >> 1;
            this.mVoiceBtn.x = this.mVoiceBtn.width * this.mMicBtn.scaleX - this.mChatContainer.width / 2;
            this.mVoiceBtn.y = -this.mVoiceBtn.height / 2 * this.mVoiceBtn.scaleY - this.mChatContainer.height / 2;
            this.mMicBtn.x = this.mVoiceBtn.x + this.mVoiceBtn.width * this.mMicBtn.scaleX + 20;
            this.mMicBtn.y = this.mVoiceBtn.y;
        } else if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.PORTRAIT) {
            this.x = size.width - (this.width / 2 + 40) * this.mWorld.uiScale;
            this.mVoiceBtn.x = this.mVoiceBtn.width - this.mChatContainer.width / 2;
            this.mVoiceBtn.y = this.mChatContainer.y - this.mChatContainer.height / 2 - this.mVoiceBtn.height / 2 * this.mMicBtn.scaleX;
            this.mMicBtn.x = this.mVoiceBtn.x + this.mMicBtn.width * this.mMicBtn.scaleX + 20;
            this.mMicBtn.y = this.mVoiceBtn.y;
        }
        this.y = size.height - 120 * this.mWorld.uiScale;
        const rightMediator = this.mWorld.uiManager.getMediator(RightMediator.NAME) as RightMediator;
        let rightBtnGroup;
        if (rightMediator) {
            rightBtnGroup = rightMediator.getView();
        }
        if (rightMediator) {
            if (this.mWorld.inputManager) {
                const joyStick = this.mWorld.inputManager as JoyStickManager;
                joyStick.resize();
            }
            if (rightBtnGroup) rightBtnGroup.resize();
        }
        this.mChatText.setStyle({ "fontSize": Math.floor(30 * this.mWorld.uiScale) });
    }

    public tweenView(show: boolean) {
        const size: Size = this.mWorld.getSize();
        const baseY: number = size.height - 120 * this.mWorld.uiScale;
        const toY: number = show === true ? baseY : baseY + 50;
        const toAlpha: number = show === true ? 1 : 0;
        this.scene.tweens.add({
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
        if (!this.scene) {
            return;
        }
        this.mResKey = "baseView";
        this.scene.load.atlas("chat_atlas", Url.getRes("ui/chat/chat_atlas.png"), Url.getRes("ui/chat/chat_atlas.json"));
        this.scene.load.atlas(this.mResKey, Url.getRes("ui/baseView/mainui_mobile.png"), Url.getRes("ui/baseView/mainui_mobile.json"));
        super.preload();
    }

    protected init() {
        this.mBtnList = [];
        const size: Size = this.mWorld.getSize();
        this.mWorld.uiManager.getUILayerManager().addToUILayer(this);
        const chatBgWidth: number = 430;
        const chatBgHeight: number = 230;
        this.mChatContainer = this.scene.make.container(undefined, false);
        this.mChatBg = this.scene.make.image(undefined, false);
        this.mChatBg.setTexture(this.mResKey, "btnGroup_chatBg.png");
        this.mChatContainer.addAt(this.mChatBg, 0);
        this.mChatText = this.scene.make.text({
            width: chatBgWidth,
            height: chatBgHeight,
            style: { font: "bold YaHei", color: "#666666", fontSize: Math.floor(30 * this.mWorld.uiScale), wordWrap: { width: 430, useAdvancedWrap: true } }
        }, false);
        this.mChatText.setText("点击窗口进入聊天界面");
        this.mChatContainer.addAt(this.mChatText, 1);
        this.mChatContainer.setSize(chatBgWidth, chatBgHeight);
        this.mChatText.x = -this.mChatContainer.width >> 1;
        this.mChatText.y = -this.mChatContainer.height >> 1;
        this.mChatContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, chatBgWidth, chatBgHeight), Phaser.Geom.Rectangle.Contains);
        this.add(this.mChatContainer);
        this.tmpWid += this.mChatContainer.width;
        this.tmpHei += this.mChatContainer.height;
        this.mTurnBtn = new IconBtn(this.scene, this.mWorld, {
            key: UIMediatorType.Turn_Btn_Bottom, bgResKey: this.mResKey, bgTextures: ["btnGroup_white_normal.png", "btnGroup_white_light.png", "btnGroup_white_select.png"],
            iconResKey: this.mResKey, iconTexture: "btnGroup_bottom_expand.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
        });
        this.mTurnBtn.x = (this.tmpWid >> 1) + 30;
        this.mTurnBtn.y = this.tmpHei - this.mTurnBtn.height >> 1;
        this.mTurnBtn.setPos(this.mTurnBtn.x, this.mTurnBtn.y);
        this.add(this.mTurnBtn);

        this.mBagBtn = new IconBtn(this.scene, this.mWorld, {
            key: BagMediator.NAME, bgResKey: this.mResKey, bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
            iconResKey: this.mResKey, iconTexture: "btnGroup_bag_icon.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
        });
        this.mBagBtn.x = this.mTurnBtn.x;
        this.mBagBtn.y = this.mTurnBtn.y - this.mTurnBtn.height / 2 - this.mBagBtn.height / 2 - 10;
        this.mBagBtn.setPos(this.mBagBtn.x, this.mBagBtn.y);
        this.tmpWid += this.mBagBtn.width + 30;
        this.add(this.mBagBtn);
        this.mBtnList.push(this.mBagBtn);
        this.mTurnBtn.setClick(() => {
            this.turnHandler();
        });

        this.mBagBtn.setClick(() => {
            this.bagHandler();
        });

        this.mMarketBag = new IconBtn(this.scene, this.mWorld, {
            key: BagMediator.NAME, bgResKey: this.mResKey, bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
            iconResKey: this.mResKey, iconTexture: "btnGroup_bag_icon.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
        });
        this.mMarketBag.x = this.mTurnBtn.x;
        this.mMarketBag.y = this.mTurnBtn.y - this.mTurnBtn.height / 2 - this.mBagBtn.height / 2 - 60 - this.mMarketBag.height / 2;
        this.mMarketBag.setPos(this.mMarketBag.x, this.mBagBtn.y);
        this.tmpWid += this.mMarketBag.width + 30;
        this.add(this.mMarketBag);
        this.setSize(this.tmpWid, this.tmpHei);
        this.mBtnList.push(this.mMarketBag);

        this.mMarketBag.setClick(() => {
            this.marketBagHandler();
        });

        this.mVoiceBtn = new CheckButton(this.scene, 0, 0, "chat_atlas", "voice_normal.png", "voice_selected.png");
        this.mVoiceBtn.x = this.width - 60 * this.mWorld.uiScale;
        this.mVoiceBtn.y = size.height - this.height;
        this.add(this.mVoiceBtn);

        this.mMicBtn = new CheckButton(this.scene, 0, 0, "chat_atlas", "mic_normal.png", "mic_selected.png");
        this.mMicBtn.x = this.width - 20 * this.mWorld.uiScale;
        this.mMicBtn.y = size.height - this.height;
        this.add(this.mMicBtn);

        this.mVoiceBtn.scaleX = this.mVoiceBtn.scaleY = 1.5;
        this.mMicBtn.scaleX = this.mMicBtn.scaleY = 1.5;
        this.setSize(this.tmpWid, this.tmpHei);
        this.resize();
        super.init();
    }

    protected tweenComplete(show: boolean) {
        this.resize();
        super.tweenComplete(show);
    }

    private onSelectedVoiceHandler(val: boolean) {
        if (val === false) {
            this.mMicBtn.selected = false;
        }
        this.emit("selectedVoice", val);
    }

    private onSelectedMicHandler(val: boolean) {
        if (this.mVoiceBtn.selected === false) {
            this.mMicBtn.selected = false;
            return;
        }
        this.mMicBtn.selected = val;
        this.emit("selectedMic", val);
    }

    private turnHandler() {
        // const med: MainUIMediator = this.mWorld.uiManager.getMediator(MainUIMediator.NAME) as MainUIMediator;
        // (med.getView() as MainUIMobile).getTopView().removeBtn({ medKey: "RankMediator" });
        // return;
        this.mVoiceBtn.visible = this.mExpandBoo;
        this.mMicBtn.visible = this.mExpandBoo;
        const easeType: string = this.mExpandBoo ? "Sine.easeIn" : "Sine.easeOut";
        if (this.mChatContainer && this.mChatContainer.parentContainer) {
            const toScaleX: number = this.mExpandBoo ? 1 : 0;
            const toScaleY: number = this.mExpandBoo ? 1 : 0;
            this.scene.tweens.add({
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
        const rightMediator = this.mWorld.uiManager.getMediator(RightMediator.NAME) as RightMediator;
        let rightBtnGroup;
        if (rightMediator) {
            rightBtnGroup = rightMediator.getView();
        }
        for (let i: number = 0; i < len; i++) {
            const btn: IconBtn = this.mBtnList[i];
            // const angle: number = (90 * (i + 2) / -180) * Math.PI;
            const toX: number = this.mExpandBoo ? btn.getPos().x : this.mChatContainer.width / 2 - Math.abs(btn.getPos().y) - 20;
            const toY: number = this.mExpandBoo ? btn.getPos().y : this.mTurnBtn.y;
            this.scene.tweens.add({
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
                        if (!this.mExpandBoo) {
                            this.setSize(this.tmpWid, this.tmpHei);
                        } else {
                            this.setSize(this.tmpWid, btn.height * 2);
                        }
                        if (rightMediator) {
                            if (this.mWorld.inputManager) {
                                const joyStick = this.mWorld.inputManager as JoyStickManager;
                                joyStick.resize();
                            }
                            if (rightBtnGroup) rightBtnGroup.resize();
                        }
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
            chatMed = new ChatMediator(this.mWorld, this.scene);
            this.mWorld.uiManager.setMediator(ChatMediator.NAME, chatMed);
        }
        const showBoo = chatMed.isShow();
        if (showBoo) {
            // chatMed.hide();
        } else {
            chatMed.show();
        }
        // =====================tween out/in baseView
        this.mWorld.uiManager.baseFaceTween(false);
    }

    private bagHandler() {
        // this.mWorld.closeGame();
        this.mWorld.uiManager.getMediator(UIMediatorType.BagMediator).show();
        // =============index = 0 为背包按钮
    }

    private marketBagHandler() {
        // test code
        let mediator = this.mWorld.uiManager.getMediator(ElementStorageMediator.name);
        if (!mediator) {
            mediator = new ElementStorageMediator(this.mWorld.uiManager.getUILayerManager(), this.scene, this.mWorld)as BaseMediator;
            this.mWorld.uiManager.setMediator(ElementStorageMediator.name, mediator);
        }
        if (mediator.isShow()) {
            mediator.hide();
        } else {
            mediator.show(true);
        }
    }
}