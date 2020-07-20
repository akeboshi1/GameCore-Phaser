import { BasePanel } from "../../components/BasePanel";
import { WorldService } from "../../../game/world.service";
import { Url } from "../../../utils/resUtil";
import { IconBtn } from "../../components/icon.btn";
import { Size } from "../../../utils/size";
import { UIMediatorType } from "../../ui.mediatorType";
import { ChatMediator } from "../../chat/chat.mediator";
import { JoyStickManager } from "../../../game/joystick.manager";
import { CheckButton } from "../../components/check.button";
import { BagMediator } from "../../bag/bagView/bagMediator";
import { RightMediator } from "../rightGroup/right.mediator";
import { ElementStorageMediator } from "../../ElementStorage/ElementStorageMediator";
import { BaseMediator } from "../../components";
export class BottomBtnGroup extends BasePanel {
    private mResKey: string;
    private mChatContainer: Phaser.GameObjects.Container;
    private mChatBg: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
    private mChatText: Phaser.GameObjects.Text;
    private mTurnBtn: IconBtn | Phaser.GameObjects.Graphics;
    private mBagBtn: IconBtn | Phaser.GameObjects.Graphics;
    private mMarketBag: IconBtn | Phaser.GameObjects.Graphics;
    private mShopBtn: IconBtn | Phaser.GameObjects.Graphics;
    private mVoiceBtn: CheckButton | Phaser.GameObjects.Graphics;
    private mMicBtn: CheckButton | Phaser.GameObjects.Graphics;
    private mBtnList: any[];
    private mExpandBoo: boolean = false;
    private tmpWid: number = 0;
    private tmpHei: number = 0;
    private mVoiceBtnWid: number = 0;
    private mVoiceBtnHei: number = 0;
    private mMicBtnWid: number = 0;
    private mMicBtnHei: number = 0;
    // private mOrientation: Phaser.Scale.Orientation;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.disInteractive();
    }

    public show(param?: any) {
        super.show(param);
    }

    public addListen() {
        this.mChatContainer.on("pointerup", this.chatHandler, this);
        this.mVoiceBtn.on("selected", this.onSelectedVoiceHandler, this);
        this.mMicBtn.on("selected", this.onSelectedMicHandler, this);
        if (CONFIG.pure) {
            (<IconBtn>this.mTurnBtn).setClick(() => {
                this.turnHandler();
            });
            (<IconBtn>this.mBagBtn).setClick(() => {
                this.bagHandler();
            });
            (<IconBtn>this.mMarketBag).setClick(() => {
                this.marketBagHandler();
            });
        } else {
            this.mTurnBtn.on("pointerup", this.turnHandler, this);
            this.mBagBtn.on("pointerup", this.bagHandler, this);
            this.mMarketBag.on("pointerup", this.marketBagHandler, this);
        }
    }

    public removeListen() {
        this.mChatContainer.off("pointerup", this.chatHandler, this);
        this.mVoiceBtn.off("selected", this.onSelectedVoiceHandler, this);
        this.mMicBtn.off("selected", this.onSelectedMicHandler, this);
        if (CONFIG.pure) {
            (<IconBtn>this.mTurnBtn).removeListen();
            (<IconBtn>this.mBagBtn).removeListen();
            (<IconBtn>this.mMarketBag).removeListen();
        } else {
            this.mTurnBtn.on("pointerup", this.turnHandler, this);
            this.mBagBtn.on("pointerup", this.bagHandler, this);
        }
    }
    public resize() {
        const size: Size = this.mWorld.getSize();
        this.scale = this.mWorld.uiScale;
        const voiceBtnWid: number = 28;
        const voiceBtnHei: number = 28;
        if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
            this.x = size.width >> 1;
            this.mVoiceBtn.x = voiceBtnWid * this.mMicBtn.scaleX - this.mChatContainer.width / 2;
            this.mVoiceBtn.y = -voiceBtnHei / 2 * this.mVoiceBtn.scaleY - this.mChatContainer.height / 2;
            this.mMicBtn.x = this.mVoiceBtn.x + voiceBtnWid * this.mMicBtn.scaleX + 20;
            this.mMicBtn.y = this.mVoiceBtn.y;
        } else if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.PORTRAIT) {
            this.x = size.width - (this.width / 2 + 40) * this.mWorld.uiScale;
            this.mVoiceBtn.x = voiceBtnWid - this.mChatContainer.width / 2;
            this.mVoiceBtn.y = this.mChatContainer.y - this.mChatContainer.height / 2 - voiceBtnHei / 2 * this.mMicBtn.scaleX;
            this.mMicBtn.x = this.mVoiceBtn.x + voiceBtnWid * this.mMicBtn.scaleX + 20;
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
        if (!CONFIG.pure) {
            this.mResKey = "baseView";
            this.scene.load.atlas("chat_atlas", Url.getRes("ui/chat/chat_atlas.png"), Url.getRes("ui/chat/chat_atlas.json"));
            this.scene.load.atlas(this.mResKey, Url.getRes("ui/baseView/mainui_mobile.png"), Url.getRes("ui/baseView/mainui_mobile.json"));
        }
        super.preload();
    }

    protected init() {
        this.mBtnList = [];
        const size: Size = this.mWorld.getSize();
        this.mWorld.uiManager.getUILayerManager().addToUILayer(this);
        const chatBgWidth: number = 430;
        const chatBgHeight: number = 230;
        const btnWid: number = 58;
        const btnHei: number = 58;
        const bagBtnWid: number = 48;
        const bagBtnHei: number = 48;
        const voiceBtnWid: number = 28;
        const voiceBtnHei: number = 28;
        this.mChatContainer = this.scene.make.container(undefined, false);
        if (!CONFIG.pure) {
            this.mChatBg = this.scene.make.image(undefined, false);
            this.mChatBg.setTexture(this.mResKey, "btnGroup_chatBg.png");
            this.mTurnBtn = new IconBtn(this.scene, this.mWorld, {
                key: UIMediatorType.Turn_Btn_Bottom, bgResKey: this.mResKey, bgTextures: ["btnGroup_white_normal.png", "btnGroup_white_light.png", "btnGroup_white_select.png"],
                iconResKey: this.mResKey, iconTexture: "btnGroup_bottom_expand.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
            });
            this.mBagBtn = new IconBtn(this.scene, this.mWorld, {
                key: BagMediator.NAME, bgResKey: this.mResKey, bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
                iconResKey: this.mResKey, iconTexture: "btnGroup_bag_icon.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
            });
            this.mMarketBag = new IconBtn(this.scene, this.mWorld, {
                key: BagMediator.NAME, bgResKey: this.mResKey, bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"],
                iconResKey: this.mResKey, iconTexture: "btnGroup_bag_icon.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
            });
            this.mVoiceBtn = new CheckButton(this.scene, 0, 0, "chat_atlas", "voice_normal.png", "voice_selected.png");
            this.mMicBtn = new CheckButton(this.scene, 0, 0, "chat_atlas", "mic_normal.png", "mic_selected.png");
        } else {
            this.mChatBg = this.scene.make.graphics(undefined, false);
            this.mChatBg.fillStyle(0);
            this.mChatBg.fillRect(-chatBgWidth >> 1, -chatBgHeight >> 1, chatBgWidth, chatBgHeight);
            this.mTurnBtn = this.scene.make.graphics(undefined, false);
            this.mTurnBtn.fillStyle(0xffcc00);
            this.mTurnBtn.fillRect(-btnWid >> 1, -btnHei >> 1, btnWid, btnHei);
            this.mBagBtn = this.scene.make.graphics(undefined, false);
            this.mBagBtn.fillStyle(0xccff00);
            this.mBagBtn.fillRect(-bagBtnWid >> 1, -bagBtnHei >> 1, bagBtnWid, bagBtnHei);
            this.mMarketBag = this.scene.make.graphics(undefined, false);
            this.mMarketBag.fillStyle(0xccff00);
            this.mMarketBag.fillRect(-bagBtnWid >> 1, -bagBtnHei >> 1, bagBtnWid, bagBtnHei);
            this.mVoiceBtn = this.scene.make.graphics(undefined, false);
            this.mVoiceBtn.fillStyle(0xccff00);
            this.mVoiceBtn.fillRect(-voiceBtnWid >> 1, -voiceBtnHei >> 1, voiceBtnWid, voiceBtnHei);
            this.mMicBtn = this.scene.make.graphics(undefined, false);
            this.mMicBtn.fillStyle(0xccff00);
            this.mMicBtn.fillRect(-voiceBtnWid >> 1, -voiceBtnHei >> 1, voiceBtnWid, voiceBtnHei);
        }

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

        this.mTurnBtn.x = (this.tmpWid >> 1) + 30;
        this.mTurnBtn.y = this.tmpHei - btnWid >> 1;
        this.add(this.mTurnBtn);

        this.mBagBtn.x = this.mTurnBtn.x;
        this.mBagBtn.y = this.mTurnBtn.y - btnHei / 2 - bagBtnHei / 2 - 10;
        this.tmpWid += bagBtnWid + 30;
        this.add(this.mBagBtn);
        this.mBtnList.push(this.mBagBtn);
        // this.mTurnBtn.setClick(() => {
        //     this.turnHandler();
        // });

        // this.mBagBtn.setClick(() => {
        //     this.bagHandler();
        // });

        this.mMarketBag.x = this.mMarketBag.x;
        this.mMarketBag.y = this.mBagBtn.y;
        this.tmpWid += btnWid + 30;
        this.add(this.mMarketBag);
        this.setSize(this.tmpWid, this.tmpHei);
        this.mBtnList.push(this.mMarketBag);

        this.mVoiceBtn.x = this.width - 60 * this.mWorld.uiScale;
        this.mVoiceBtn.y = size.height - this.height;
        this.add(this.mVoiceBtn);

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
            if (!CONFIG.pure) {
                (<CheckButton>this.mMicBtn).selected = false;
            } else {
                const mode = val ? Phaser.BlendModes.SCREEN : Phaser.BlendModes.ADD;
                (<Phaser.GameObjects.Graphics>this.mMicBtn).setBlendMode(mode);
            }
        }
        this.emit("selectedVoice", val);
    }

    private onSelectedMicHandler(val: boolean) {
        if (!CONFIG.pure) {
            if ((<CheckButton>this.mVoiceBtn).selected === false) {
                (<CheckButton>this.mVoiceBtn).selected = false;
                return;
            }
            (<CheckButton>this.mVoiceBtn).selected = val;
        } else {
            const mode = val ? Phaser.BlendModes.SCREEN : Phaser.BlendModes.ADD;
            (<Phaser.GameObjects.Graphics>this.mVoiceBtn).setBlendMode(mode);
        }
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
            mediator = new ElementStorageMediator(this.mWorld.uiManager.getUILayerManager(), this.scene, this.mWorld) as BaseMediator;
            this.mWorld.uiManager.setMediator(ElementStorageMediator.name, mediator);
        }
        if (mediator.isShow()) {
            mediator.hide();
        } else {
            mediator.show(true);
        }
    }
}
