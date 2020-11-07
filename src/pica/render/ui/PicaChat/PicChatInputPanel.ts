import { BBCodeText, Button, ClickEvent, GameScroller, InputText, NineSliceButton, NineSlicePatch } from "apowophaserui";
import { UIAtlasKey } from "picaRes";
import { Render } from "gamecoreRender";
import { Font, i18n } from "utils";

export class PicChatInputPanel extends Phaser.Events.EventEmitter {
    private mBackground: Phaser.GameObjects.Graphics;
    private bottomCon: Phaser.GameObjects.Container;
    private contentCon: Phaser.GameObjects.Container;
    private quickCon: Phaser.GameObjects.Container;
    private key: string;
    private sendBtn: Button;
    private cancelBtn: Button;
    private mInput: InputText;
    private mOutputText: BBCodeText;
    private dpr: number;
    private scene: Phaser.Scene;
    private gamescroll: GameScroller;
    private chatArr: string[] = [];
    private maxChatLength: number = 100;
    private quickChatScroll: GameScroller;
    private keyboardHeight: number;
    private quickBg: Phaser.GameObjects.Image;
    private isOpenQuickPanel: boolean = false;
    private isSendChat: boolean = false;
    private quickChatAtt: string[];
    private isDispose: boolean = false;
    constructor(scene: Phaser.Scene, private render: Render, key: string, chatArr: string[]) {
        super();
        this.key = key;
        this.dpr = window.devicePixelRatio;
        this.scene = scene;
        this.chatArr = chatArr;
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        this.mBackground = scene.add.graphics();
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.6);
        this.mBackground.fillRect(0, 0, width, height);
        this.mBackground.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, width, height),
            Phaser.Geom.Rectangle.Contains
        );
        this.bottomCon = scene.add.container(0, 0);
        this.bottomCon.setPosition(width * 0.5, height * 0.5);
        const inputBg = new NineSlicePatch(
            scene,
            0,
            0,
            width,
            47 * this.dpr,
            this.key,
            "chat_Input_bg",
            {
                left: 2 * this.dpr,
                top: 0 * this.dpr,
                right: 2 * this.dpr,
                bottom: 0 * this.dpr,
            }
        );
        this.bottomCon.setSize(width, inputBg.height);
        this.bottomCon.add(inputBg);
        this.sendBtn = new Button(this.scene, this.key, "chat_quick_2");
        this.sendBtn.x =
            -width * 0.5 + this.sendBtn.width * 0.5 + 12 * this.dpr;
        this.sendBtn.on(String(ClickEvent.Tap), this.onQuickSendHandler, this);
        this.bottomCon.add(this.sendBtn);
        this.cancelBtn = new NineSliceButton(
            this.scene,
            0,
            0,
            63 * this.dpr,
            28 * this.dpr,
            UIAtlasKey.commonKey,
            "red_btn_normal",
            i18n.t("common.cancel"),
            this.dpr,
            1,
            {
                left: 14 * this.dpr,
                top: 0,
                right: 14 * this.dpr,
                bottom: 0,
            }
        );
        this.cancelBtn.setTextStyle({
            color: "#ffffff",
            fontSize: 16 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
        });
        this.cancelBtn.x =
            width * 0.5 - this.cancelBtn.width * 0.5 - 12 * this.dpr;
        this.cancelBtn.on(String(ClickEvent.Tap), this.onCancelHandler, this);
        this.bottomCon.add(this.cancelBtn);
        const chatbgWidth =
            Math.abs(this.sendBtn.x - this.cancelBtn.x) -
            this.sendBtn.width * 0.5 -
            this.cancelBtn.width * 0.5 -
            16 * this.dpr;
        const chatbgx =
            this.sendBtn.x +
            this.sendBtn.width * 0.5 +
            8 * this.dpr +
            chatbgWidth * 0.5;
        const chatInputbg = new NineSlicePatch(
            this.scene,
            chatbgx,
            0,
            chatbgWidth,
            36 * this.dpr,
            this.key,
            "chat_Input",
            {
                left: 12 * this.dpr,
                top: 0 * this.dpr,
                right: 12 * this.dpr,
                bottom: 0 * this.dpr,
            }
        );
        this.bottomCon.add(chatInputbg);
        this.mInput = new InputText(
            this.scene,
            chatbgx - chatbgWidth * 0.5,
            0,
            chatbgWidth,
            40 * this.dpr,
            {
                type: "text",
                placeholder: "",
                color: "#0",
                fontSize: 20 * this.dpr + "px",
            }
        );
        this.mInput.setOrigin(0, 0.5);
        this.bottomCon.add(this.mInput);
        this.contentCon = scene.add.container(0, 0);
        this.contentCon.setSize(width, 200 * this.dpr);
        this.mOutputText = new BBCodeText(
            scene,
            -width * 0.5 + 10 * this.dpr,
            0,
            "",
            {
                fontSize: 14 * this.dpr + "px",
                fontFamily: Font.DEFULT_FONT,
                stroke: "#000000",
                strokeThickness: 1 * this.dpr,
                textMask: false,
                lineSpacing: 2 * this.dpr,
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: "#000",
                    blur: 4,
                    stroke: true,
                    fill: true,
                },
                wrap: {
                    mode: "char",
                    width: width - 12 * this.dpr,
                },
            }
        ).setOrigin(0, 0.5);
        (<any>this.mOutputText).setResolution(this.dpr);
        this.gamescroll = new GameScroller(scene, {
            x: 0,
            y: 0,
            width,
            height: this.contentCon.height,
            zoom: 1,
            dpr: this.dpr,
            align: 0,
            orientation: 0,
            selfevent: true
        });
        this.contentCon.add(this.gamescroll);
        this.gamescroll.addItem(this.mOutputText);

        this.quickCon = this.scene.add.container(0, 0);
        this.quickBg = this.scene.make.image({
            key: this.key,
            frame: "home_quick chat _bg",
        });
        this.quickBg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.quickCon.add(this.quickBg);
        this.quickCon.x = width * 0.5;
        this.quickChatScroll = new GameScroller(scene, {
            x: 0,
            y: 0,
            width,
            height: 200 * this.dpr,
            zoom: 1,
            dpr: this.dpr,
            align: 2,
            orientation: 0,
            cellupCallBack: (gameobject) => {
                this.onQuickChatItemHandler(gameobject);
            },
        });
        this.quickChatScroll.removeListen();
        this.quickCon.add(this.quickChatScroll);
        this.mInput.on("blur", this.onBlurHandler, this);
        this.mInput.on("focus", this.onFocusHandler, this);
        this.mInput.node.addEventListener("keypress", (e) => {
            const keycode = e.keyCode || e.which;
            if (keycode === 13) {
                this.isSendChat = true;
                this.onSentChat();
            }
        });
        window.addEventListener(
            "native.keyboardshow",
            this.onKeyboardHandler.bind(this)
        );
        this.bottomCon.visible = false;
        this.contentCon.visible = false;
    }

    public setKeywordHeight(height: number) {
        const camheight = this.scene.cameras.main.height;
        const camWidth = this.scene.cameras.main.width;
        // const pktGlobal: any = window["pktGlobal"];
        const screenHeight = camheight; // pktGlobal.deviceHeight;
        const statusHeight = 0; // pktGlobal.toolbarHeight;
        const offsetHeight = screenHeight - height - statusHeight;
        this.bottomCon.visible = true;
        this.contentCon.visible = true;

        this.bottomCon.y = offsetHeight - this.bottomCon.height * 0.5;
        this.contentCon.height =
            this.bottomCon.y - this.bottomCon.height * 0.5 - 20 * this.dpr;
        this.contentCon.y =
            this.bottomCon.y -
            this.bottomCon.height * 0.5 -
            this.contentCon.height * 0.5 -
            5 * this.dpr;
        this.contentCon.x = camWidth * 0.5;
        this.gamescroll.resetSize(camWidth, this.contentCon.height);
        this.gamescroll.refreshMask();
        const conHeight = 200 * this.dpr;// camheight - offsetHeight; // height + 20 * this.dpr;
        this.quickCon.y = this.bottomCon.y - this.bottomCon.height * 0.5;
        this.quickBg.y = -conHeight * 0.5;
        this.quickBg.displayWidth = camWidth + 10 * this.dpr;
        this.quickBg.displayHeight = conHeight;
        this.quickChatScroll.y = this.quickBg.y;
        this.quickChatScroll.resetSize(camWidth, conHeight);
        this.keyboardHeight = height;
        // this.mInput.text =
        //     screenHeight +
        //     "   " +
        //     height +
        //     "   " +
        //     statusHeight +
        //     "   " +
        //     this.dpr +
        //     "   " +
        //     camheight;
        // // tslint:disable-next-line:no-console
        // console.log(this.mInput.text + "    ");
        this.setQuickChatItems();
    }

    public setQuickChatData(datas: string[]) {
        if (datas) this.quickChatAtt = datas;
        this.quickChatAtt.unshift(undefined);
        this.setKeywordHeight(0);
        this.onQuickSendHandler();
        let text = "";
        for (const chat of this.chatArr) {
            text += chat;
        }
        this.mOutputText.text = text;
        this.gamescroll.Sort();
        // tslint:disable-next-line:no-console
        console.log(datas);
        // this.mInput.setFocus();
    }
    public appendChat(val: string) {
        this.chatArr.push(val);
        if (this.chatArr.length > this.maxChatLength) this.chatArr.shift();
        let text = "";
        for (const chat of this.chatArr) {
            text += chat;
        }
        this.mOutputText.text = text;
        this.gamescroll.Sort();
    }

    private onKeyboardHandler(e) {
        // tslint:disable-next-line:no-console
        console.log(e.keyboardHeight);
        if (this.keyboardHeight > 0 && e.keyboardHeight === this.keyboardHeight)
            return;
        window.removeEventListener(
            "native.keyboardshow",
            this.onKeyboardHandler.bind(this)
        );
        // this.setKeywordHeight(e.keyboardHeight);
    }

    private setQuickChatItems() {
        this.quickChatScroll.clearItems(true);
        const camheight = this.scene.cameras.main.height;
        const camWidth = this.scene.cameras.main.width;
        for (let i = 0; i < this.quickChatAtt.length; i++) {
            const text = this.quickChatAtt[i];
            if (text) {
                const item = new QuickChatItem(
                    this.scene,
                    camWidth,
                    30 * this.dpr,
                    this.key,
                    this.dpr,
                    i === 0 ? true : false
                );
                this.quickChatScroll.addItem(item);
                item.setText(text);
            }
        }
        this.quickChatScroll.Sort();
        this.quickCon.visible = false;
    }

    private setFirstQuickItem() {
        if (
            this.quickChatScroll.getItemList().length ===
            this.quickChatAtt.length
        ) {
            const list = this.quickChatScroll.getItemList();
            if (list && list.length > 0) {
                (<QuickChatItem>list[0]).setText(this.quickChatAtt[0]);
            }
        } else {
            const camWidth = this.scene.cameras.main.width;
            const item = new QuickChatItem(
                this.scene,
                camWidth,
                40 * this.dpr,
                this.key,
                this.dpr,
                true
            );
            this.quickChatScroll.addItemAt(item, 0);
            this.quickChatScroll.Sort();
            item.setText(this.quickChatAtt[0]);
        }
    }

    private onBlurHandler() {
        if (!this.isOpenQuickPanel && !this.isSendChat) {
            this.onCancelHandler();
        }
        this.isSendChat = false;
    }
    private onFocusHandler() {
        // if (this.isOpenQuickPanel) {
        //     this.quickCon.visible = false;
        //     this.quickChatScroll.removeListen();
        //     this.isOpenQuickPanel = false;
        // }
    }

    private onQuickSendHandler() {

        this.isOpenQuickPanel = !this.isOpenQuickPanel;
        if (this.isOpenQuickPanel) {
            this.quickCon.visible = true;
            this.quickChatScroll.addListen();
        } else {
            this.mInput.setFocus();
            this.quickCon.visible = false;
            this.quickChatScroll.removeListen();
            this.isOpenQuickPanel = false;
        }

        // this.mInput.setBlur();
    }
    private onSentChat() {
        const chat = this.mInput.text;
        if (chat !== "") {
            this.quickChatAtt[0] = chat;
            this.setFirstQuickItem();
        }
        this.mInput.text = "";
        this.mInput.setFocus();
        this.sendChat(chat);
    }
    private sendChat(chat: string) {
        this.emit("send", chat);
    }

    private onQuickChatItemHandler(item: QuickChatItem) {
        // this.sendChat(item.dataChat);
        this.mInput.text = item.dataChat;
        this.mInput.setFocus();
        this.quickCon.visible = false;
        this.quickChatScroll.removeListen();
        this.isOpenQuickPanel = false;
    }

    private onCancelHandler() {
        if (this.isDispose) return;
        this.isDispose = true;
        this.mInput.setBlur();
        this.mBackground.destroy();
        this.mInput.destroy();
        this.bottomCon.destroy();
        this.contentCon.destroy();
        this.quickCon.destroy();
        this.gamescroll.clearItems(true);
        this.scene = undefined;
        this.gamescroll = undefined;
        this.mOutputText = undefined;
        this.quickChatScroll = undefined;
        this.emit("close");
        this.destroy();
    }
}

class QuickChatItem extends Phaser.GameObjects.Container {
    public dataChat: string = "";
    private text: Phaser.GameObjects.Text;
    private key: string;
    constructor(
        scene: Phaser.Scene,
        width: number,
        height: number,
        key: string,
        dpr: number,
        first: boolean = false
    ) {
        super(scene);
        this.key = key;
        this.setSize(width, height);
        this.text = this.scene.make
            .text({
                x: 0,
                y: 0,
                text: "",
                style: {
                    fontSize: 13 * dpr,
                    fontFamily: Font.DEFULT_FONT,
                    color: "#6F6F6F",
                },
            })
            .setOrigin(0, 0.5);
        this.text.x = -width * 0.5 + 20 * dpr;
        this.add(this.text);
        if (first) {
            const line = this.scene.make.image({ key, frame: "home_divider" });
            line.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            line.y = height * 0.5;
            this.add(line);
        } else {
            const line = this.scene.make.graphics(undefined);
            line.clear();
            line.fillStyle(0x6f6f6f, 0.3);
            line.fillRect(-width * 0.5 + 20 * dpr, -1, width, 2);
            line.setPosition(0, height * 0.5);
            this.add(line);
        }
    }

    public setText(tex: string) {
        this.text.text = tex;
        this.dataChat = tex;
    }
}
