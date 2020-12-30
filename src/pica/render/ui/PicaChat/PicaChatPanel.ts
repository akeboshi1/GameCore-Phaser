import { BBCodeText, TextArea, UIType } from "apowophaserui";
import { AlertView, BasePanel, DragonbonesDisplay, InputPanel, Render, UiManager } from "gamecoreRender";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { EventType, ModuleName, RENDER_PEER } from "structure";
import { Font, i18n } from "utils";
import { PicaChatInputPanel } from "./PicaChatInputPanel";
import { PicaGiftPanel } from "./PicaGiftPanel";

enum ChatChannel {
    CurrentScene = 0,
    World = 1,
    Team = 2,
    Private = 3,
    System = 4
}

export class PicaChatPanel extends BasePanel {
    private readonly MAX_HEIGHT: number;
    private readonly MIN_HEIGHT: number;
    private mBackground: Phaser.GameObjects.Graphics;
    private mScrollBtn: Phaser.GameObjects.Image;
    private mTileContainer: Phaser.GameObjects.Container;
    private mTitleBg: Phaser.GameObjects.Image;
    private mChatBtn: Phaser.GameObjects.Image;
    private mHornBtn: Phaser.GameObjects.Image;
    private mEmojiBtn: Phaser.GameObjects.Image;
    private mGiftBtn: Phaser.GameObjects.Image;
    private mOutputText: BBCodeText;
    private mTextArea: TextArea;
    private mInputText: InputPanel | PicaChatInputPanel;
    private chatCatchArr: string[] = [];
    private chatMaxLen: number = 100;
    private giftPanel: PicaGiftPanel;
    constructor(private uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.MAX_HEIGHT = 460 * this.dpr;
        this.MIN_HEIGHT = 100 * this.dpr;
        this.scale = 1;
        this.key = ModuleName.PICACHAT_NAME;
        this.UIType = UIType.Scene;
    }

    show(param?: any) {
        super.show(param);
        this.mShowData = param;
        if (!this.mInitialized) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.addListen();
        this.checkUpdateActive();
    }

    resize(w: number, h: number) {
        const zoom = this.scale;
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        w = width;
        h = h ? h : 133 * this.dpr;
        if (this.giftPanel && this.giftPanel.visible) h = 185 * this.dpr;
        this.setSize(width, h);
        const frame = this.scene.textures.getFrame(this.key, "title_bg");
        const scaleRatio = frame ? (width / this.scale) / frame.width : 1;
        this.mTitleBg.scaleX = scaleRatio;
        this.mTitleBg.x = (width / this.scale) / 2;

        this.y = height - this.height;
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.6);
        this.mBackground.fillRect(0, 0, width / this.scale, h / this.scale);
        this.mTextArea.childrenMap.child.setMinSize(w, (h - 16 * this.dpr) * zoom);
        this.mTextArea.layout();
        this.mTextArea.setPosition(this.width / 2 + 4 * this.dpr, this.y + this.mTextArea.height / 2 + 10 * this.dpr * zoom);
        const textMask = this.mTextArea.childrenMap.text;
        textMask.y = 8 * this.dpr;
        this.mTextArea.scrollToBottom();
        if (this.giftPanel) {
            this.giftPanel.resize();
            this.giftPanel.y = this.height - this.giftPanel.height * 0.5;
            this.giftPanel.x = this.width * 0.5;
        }
        super.resize(w, h);
        this.mBackground.input = undefined;
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, width / this.scale, h / this.scale), Phaser.Geom.Rectangle.Contains);
    }

    public async chatHandler(content: any) {
        const nickName = await this.render.mainPeer.getPlayerName(content.chatSenderid);
        let speaker = "";
        if (nickName) {
            speaker = nickName;
        } else {
            if (content.chatSenderid) {
                speaker = i18n.t("chat.mystery");
            }
        }
        let color = "#ffffff";
        if (content.chatSetting) {
            color = content.chatSetting.textColor;
        }
        this.showChat(`[color=${color}][${this.getChannel(content.chatChannel)}]${speaker}: ${content.chatContext}[/color]\n`);
    }

    public showChat(chat: string) {
        this.appendChat(chat);
    }

    public getChannel(channel: any) {
        switch (channel) {
            case ChatChannel.CurrentScene:
                return i18n.t("chat.current");
            case ChatChannel.World:
                return i18n.t("chat.world");
            default:
                return i18n.t("chat.system");
        }
    }

    public setGiftData(content) {
        this.giftPanel.setGiftDatas(content.commodities);
    }

    public appendChat(val: string) {
        this.chatCatchArr.push(val);
        if (this.chatCatchArr.length > this.chatMaxLen) this.chatCatchArr.shift();
        if (this.mTextArea) {
            this.mTextArea.appendText(val);
            this.mTextArea.scrollToBottom();
        }

        if (this.mInputText && this.mInputText instanceof PicaChatInputPanel) {
            (<PicaChatInputPanel>this.mInputText).appendChat(val);
        }
    }

    public isShowChatPanel() {
        if (!this.mTextArea || !this.mTextArea.visible) return false;
        return true;
    }

    public hide() {
        if (this.mTextArea) this.mTextArea.destroy();
        if (this.mOutputText) this.mOutputText.destroy();
        this.mShow = false;
        this.removeListen();
        // this.removeInteractive();
        super.hide();
    }

    public addListen() {
        super.addListen();
        if (!this.mInitialized) return;
        this.mChatBtn.setInteractive();
        this.mEmojiBtn.setInteractive();
        if (this.mTextArea.visible) this.mScrollBtn.setInteractive();
        this.mGiftBtn.setInteractive();
        this.mTextArea.childrenMap.child.setInteractive();

        this.mScrollBtn.on("drag", this.onDragHandler, this);
        this.scene.input.setDraggable(this.mScrollBtn, true);
        this.mChatBtn.on("pointerup", this.onShowInputHanldler, this);
        this.mGiftBtn.on("pointerup", this.onGiftHandler, this);
        this.mEmojiBtn.on("pointerup", this.onEmojiHandler, this);
        this.render.emitter.on(EventType.CHAT, this.chatHandler, this);
        // this.render.emitter.on("queryMarket", this.setGiftData, this);
        this.render.emitter.on(EventType.UPDATE_PARTY_STATE, this.setGiftButtonState, this);
    }

    public removeListen() {
        super.removeListen();
        if (!this.mInitialized) return;
        this.mChatBtn.disableInteractive();
        this.mEmojiBtn.disableInteractive();
        this.mScrollBtn.disableInteractive();
        this.mGiftBtn.disableInteractive();
        this.mTextArea.childrenMap.child.disableInteractive();
        this.mEmojiBtn.off("pointerup", this.onEmojiHandler, this);
        this.mScrollBtn.off("drag", this.onDragHandler, this);
        this.mChatBtn.off("pointerup", this.onShowInputHanldler, this);
        this.mGiftBtn.off("pointerup", this.onGiftHandler, this);

        this.render.emitter.off(EventType.CHAT, this.chatHandler, this);
        // this.render.emitter.off("queryMarket", this.setGiftData, this);
        this.render.emitter.off(EventType.UPDATE_PARTY_STATE, this.setGiftButtonState, this);
    }

    updateUIState(active?: any) {// op_pkt_def.IPKT_UI
        if (!this.mInitialized) {
            return;
        }
        // if (active.name === "picachat.navigatebtn") {
        //     if (this.mNavigateBtn.visible !== active.visible) {
        //         this.mNavigateBtn.visible = active.visible;
        //     }
        // }
    }

    public destroy() {
        if (this.mBackground) this.mBackground.disableInteractive();
        super.destroy();
    }

    protected preload() {
        this.addAtlas(this.key, "pica_chat/pica_chat.png", "pica_chat/pica_chat.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }

    protected init() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        this.mBackground = this.scene.make.graphics(undefined, false);
        const zoom = this.scale;
        this.setSize(width, 135 * this.dpr);
        this.mTileContainer = this.scene.make.container(undefined, false);
        this.mScrollBtn = this.scene.make.image({ x: 21 * this.dpr * zoom, key: this.key, frame: "scroll_btn" }, false).setScale(zoom);
        this.mScrollBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mTitleBg = this.scene.make.image({ key: this.key, frame: "title_bg" }, false).setScale(zoom);
        this.mChatBtn = this.scene.make.image({ x: 96 * this.dpr * zoom, key: this.key, frame: "chat_icon" }, false).setScale(zoom);
        this.mHornBtn = this.scene.make.image({ x: 159 * this.dpr * zoom, key: this.key, frame: "horn_icon" }, false).setScale(zoom);
        this.mEmojiBtn = this.scene.make.image({ x: 218 * this.dpr * zoom, key: this.key, frame: "emoji" }, false).setScale(zoom);
        this.mGiftBtn = this.scene.make.image({ x: 218 * this.dpr * zoom, key: this.key, frame: "party_gift_icon" }, false).setScale(zoom);
        // this.mNavigateBtn = this.scene.make.image({ x: 281 * this.dpr, key: this.key, frame: "more_btn" }, false).setScale(zoom);
        const space = 20 * this.dpr;
        this.mTitleBg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mScrollBtn.x = this.mScrollBtn.width * 0.5 + 5 * this.dpr;
        this.mScrollBtn.y = -this.mScrollBtn.height / 2 + this.mTitleBg.height;

        this.mChatBtn.x = this.mScrollBtn.x + this.mScrollBtn.width * 0.5 + space + this.mChatBtn.width * 0.5;
        this.mChatBtn.y = -this.mChatBtn.height / 2 + this.mTitleBg.height;
        this.mChatBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        this.mHornBtn.x = this.mChatBtn.x + this.mChatBtn.width * 0.5 + space + this.mHornBtn.width * 0.5;
        this.mHornBtn.y = -this.mHornBtn.height / 2 + this.mTitleBg.height;
        this.mHornBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        this.mEmojiBtn.x = this.mHornBtn.x + this.mHornBtn.width * 0.5 + space + this.mEmojiBtn.width * 0.5;
        this.mEmojiBtn.y = -this.mEmojiBtn.height / 2 + this.mTitleBg.height;
        this.mEmojiBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        this.mGiftBtn.x = this.mEmojiBtn.x + this.mEmojiBtn.width * 0.5 + space + this.mGiftBtn.width * 0.5;
        this.mGiftBtn.y = -this.mGiftBtn.height / 2 + this.mTitleBg.height;
        this.mGiftBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        // this.mNavigateBtn.y = -this.mNavigateBtn.height / 2 + this.mTitleBg.height;
        // this.mNavigateBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        this.mOutputText = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: 14 * this.dpr / zoom + "px",
            fontFamily: Font.DEFULT_FONT,
            stroke: "#000000",
            strokeThickness: 1 * this.dpr * zoom,
            textMask: false,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: "#000",
                blur: 4,
                stroke: true,
                fill: true
            },
            wrap: {
                mode: "char",
                width: width - 12 * this.dpr * zoom
            }
        });
        (<any>this.mOutputText).setResolution(this.dpr);
        const background = this.scene.make.graphics(undefined, false);
        this.mTextArea = new TextArea(this.mScene, {
            x: width / 2 + 4 * this.dpr * zoom,
            y: 160 * this.dpr * zoom,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, 0.2),
            textWidth: width - 4 * this.dpr * zoom,
            textHeight: this.MAX_HEIGHT,
            text: this.mOutputText,
        })
            .layout();
        this.mTileContainer.add([
            this.mTitleBg,
            this.mChatBtn,
            this.mHornBtn,
            this.mEmojiBtn,
            this.mGiftBtn,
            this.mScrollBtn,
        ]);
        this.add([
            this.mBackground,
            this.mTileContainer,
            this.mTextArea,
            this.mOutputText,
            background,
        ]);
        // this.mTextArea.setSliderEnable(false);
        this.resize(this.width, 133 * this.dpr);
        super.init();
        // this.removeInteractive();
    }

    private onDragHandler(pointer, dragX, dragY) {
        const height = this.height + (pointer.prevPosition.y - pointer.position.y);
        if (height > this.MAX_HEIGHT || height < this.MIN_HEIGHT) {
            return;
        }
        this.resize(this.width, height);
    }
    private setGiftButtonState(isparty: boolean) {
        if (this.giftPanel) this.giftPanel.setGiftActive(isparty);
    }
    private onShowNavigateHandler() {
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_showNavigate");
    }
    private onEmojiHandler() {
        const id = this.render.displayManager.user.id;

        this.render.mainPeer.setDragonBonesQueue(id, [{ animationName: "idle", scale: false, times: 1 }]);
        this.render.physicalPeer.changePlayerState(id, "jump", 1);
        // this.render.mainPeer.changePlayerState(id, "jump", 1);
    }
    private onGiftHandler() {
        if (!this.giftPanel || !this.giftPanel.visible) {
            this.hideAllChildPanel();
            if (!this.giftPanel) {
                this.giftPanel = new PicaGiftPanel(this.scene, 0, 0, this.width, 175 * this.dpr, this.key, this.dpr, this.scale);
                this.giftPanel.y = this.height - this.giftPanel.height * 0.5;
                this.giftPanel.x = this.width * 0.5;
                this.add(this.giftPanel);
                this.giftPanel.resize();
                this.giftPanel.on("showpropfun", this.showPropFun, this);
                this.giftPanel.on("buyItem", this.onBuyItemHandler, this);
                this.giftPanel.on("shownotice", this.showNoticeHandler, this);
            }
            this.resize(this.width, 185 * this.dpr);
            this.giftPanel.show();
            this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_querymarket");
            this.render.mainPeer.getCurRoom()
                .then((curRoom) => {
                    const openingParty = (curRoom) ? curRoom.openingParty : false;
                    this.giftPanel.setGiftActive(openingParty);
                });
        } else {
            this.giftPanel.hide();
            this.showChatTextArea();
        }
    }

    private onShowInputHanldler() {
        // new InputPanel(this.scene);
        this.hideAllChildPanel();
        this.showChatTextArea();
        if (this.mInputText) {
            return;
        }
        const pktGlobal = window["pktGlobal"];
        if (pktGlobal && pktGlobal.envPlatform === "Cordova") {
            if (this.scene.cache.json.has("quickchat")) {
                setTimeout(() => {
                    this.openAppInputPanel();
                }, 20);
            } else {
                const jsonUrl = `../../resources/ui/quickchat/${i18n.language}.json`;
                this.scene.load.json("quickchat", jsonUrl);
                this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.openAppInputPanel, this);
                this.scene.load.start();
            }
        } else {
            this.mInputText = new InputPanel(this.scene, this.render);
            this.mInputText.once("close", this.sendChat, this);
        }
    }

    private sendChat(val: string) {
        this.mInputText = undefined;
        if (!val) {
            return;
        }
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_chat", val);
    }

    private openAppInputPanel() {
        if (this.scene.cache.json.has("quickchat")) {
            this.mInputText = new PicaChatInputPanel(this.scene, this.render, this.key, this.chatCatchArr.concat());
            this.mInputText.once("close", this.appCloseChat, this);
            this.mInputText.on("send", this.appSendChat, this);
            const quickArr = this.scene.cache.json.get("quickchat");
            this.mInputText.setQuickChatData(quickArr.concat());
            if (this.parentContainer) this.parentContainer.visible = false;
            this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.openAppInputPanel, this);
        }
    }
    private appSendChat(val: string) {
        if (!val) {
            return;
        }
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_chat", val);
    }

    private appCloseChat() {
        this.mInputText.off("send", this.appSendChat, this);
        this.mInputText = undefined;
        if (this.parentContainer) this.parentContainer.visible = true;
    }
    private checkUpdateActive() {
        this.render.mainPeer.getCurRoom()
            .then((curRoom) => {
                if (curRoom)
                    this.setGiftButtonState(curRoom.openingParty);
            });
        this.render.mainPeer.getActiveUIData(ModuleName.PICACHAT_NAME)
            .then((arr) => {
                if (arr) {
                    for (const data of arr) {
                        this.updateUIState(data);
                    }
                }
            });
    }
    private hideAllChildPanel() {
        if (this.giftPanel) this.giftPanel.hide();
        if (this.mTextArea) this.mTextArea.visible = false;
        this.mScrollBtn.disableInteractive();
        this.showPanelHandler(ModuleName.PICAHANDHELD_NAME, false);
    }
    private showChatTextArea() {
        this.mTextArea.visible = true;
        this.mScrollBtn.setInteractive();
        this.showPanelHandler(ModuleName.PICAHANDHELD_NAME, true);
    }
    private onBuyItemHandler(prop: any, data: any) {// op_def.IOrderCommodities, op_client.CountablePackageItem
        const alertView = new AlertView(this.uiManager);
        const price = data.count * data.sellingPrice.price;
        if (price > 0) {
            alertView.show({
                title: i18n.t("party.sendgift"),
                text: i18n.t("party.sendgifttips", { count: prop.quantity, name: data.name || data.shortName }),
                oy: 302 * this.dpr * this.render.uiScale,
                callback: () => {
                    this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_buyItem", prop);
                },
            });
        } else {
            this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_buyItem", prop);
        }
    }
    private showPropFun(config: any) {// PicPropFunConfig
        this.showPanelHandler(ModuleName.PICAPROPFUN_NAME, true, config);
    }
    private showNoticeHandler(text: string) {
        const data = {
            text: [{ text, node: undefined }]
        };// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI
        this.showPanelHandler(ModuleName.PICANOTICE_NAME, true, data);
    }
    private showPanelHandler(panelName: string, isshow: boolean, data?: any) {
        if (!this.render) {
            return;
        }
        if (isshow) {
            this.render.mainPeer.showMediator(panelName, true, data);
        } else {
            this.render.mainPeer.showMediator(panelName, false);
        }
    }
}
