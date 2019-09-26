import {WorldService} from "../../game/world.service";
import RoundRectangle from "../../../lib/rexui/plugins/gameobjects/shape/roundrectangle/RoundRectangle";
import TextArea from "../../../lib/rexui/templates/ui/textarea/TextArea";
import InputText from "../../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import {Panel} from "../components/panel";
import {Button} from "../components/button";
import NinePatch from "../../../lib/rexui/plugins/gameobjects/ninepatch/NinePatch";

export class ChatPanel extends Panel {
    private mParent: Phaser.GameObjects.Container;
    private mTextArea: TextArea;
    private mInputText: InputText;
    constructor(scene: Phaser.Scene, private mWorldService: WorldService) {
        super(scene);
    }

    public appendChat(val: string) {
        this.mTextArea.appendText(val + "\n");
        this.mTextArea.scrollToBottom();
    }

    public setSize(w: number, h: number) {
        this.mParent.setSize(w, h);
    }

    public setLocation(x: number, y: number) {
        if (!this.mParent) {
            return;
        }
        return;
        // TODO 设置位置后，DefaultMask位置不会更新，所以暂时以0 0为准
        // DefaultMask在TextBlock中，TextBlock是一个非渲染矩形游戏对象
        const size = this.mWorldService.getSize();
        this.mParent.x = 8;
        this.mParent.y = size.height - this.mParent.height - 8;
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mScene.load.image("button", "./resources/ui/common/button.png");
        this.mScene.load.image("chat_input_bg", "./resources/ui/chat/input_bg.png");
        this.mScene.load.image("chat_border_bg", "./resources/ui/chat/bg.png");
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        super.init();
        this.mParent = this.mScene.add.container(0, 0);

        const size = this.mWorldService.getSize();
        this.setSize(464, 281);

        const output = this.mScene.make.container(undefined, false);
        this.mParent.add(output);

        const border = new NinePatch(this.mScene, 4, size.height - 260, {
            width: 464,
            height: 281,
            key: "chat_border_bg",
            columns: [4, 2, 4],
            rows: [4, 2, 4]
        }).setOrigin(0, 0);
        this.mParent.add(border);

        const background = new RoundRectangle(this.mScene, 0, 0, 2, 2, 3, 0x808080, 0.5);
        output.add(background);

        const track = new RoundRectangle(this.mScene, 100, 10, 10, 10, 10, 0x260e04);
        output.add(track);

        const text = this.mScene.make.text({
            width: 440,
            height: 200,
            style: { font: "bold 14px YaHei" }
        }, false);
        output.add(text);

        const thumb = new RoundRectangle(this.mScene, 0, 0, 10, 20, 10, 0xFFFF00);
        output.add(thumb);
        this.mTextArea = new TextArea(this.mScene, {
            x: 230,
            y: size.height - 150,
            width: 440,
            height: 200,
            textWidth: 420,
            textHeight: 190,

            // background,

            text,
            // text: this.rexUI.add.BBCodeText(),
            // textMask: false,

            slider: {
                track,
                thumb,
            },

        })
            .layout();
        output.add(this.mTextArea);

        let s = "";
        for (let i = 999; i < 10000; i++) {
            s += i + "\n";
        }

        this.mTextArea.setText(s);

        const tracks = this.mTextArea.getElement("child");
        if (tracks) {
            // tracks.x += 150;
        }

        const inputContainer = this.mScene.make.container(undefined, false);
        this.mParent.add(inputContainer);

        const inputBg = new NinePatch(this.mScene, 8, size.height - 46, {
            width: 370,
            height: 32,
            key: "chat_input_bg",
            columns: [4, 2, 4],
            rows: [4, 2, 4]
        }).setOrigin(0, 0);
        inputContainer.add(inputBg);

        this.mInputText = new InputText(this.mScene, 12, size.height - 40, 10, 10, {
            type: "input",
            text: "hello world",
            fontSize: "14px",
            color: "#808080"
        })
            .resize(370, 20)
            .setOrigin(0, 0)
            .setStyle({ font: "bold 16px YaHei" });

        inputContainer.add(this.mInputText);

        const sendMsgBtn = new Button(this.mScene, 60, size.height - 30, {
            width: 60,
            height: 30,
            key: "button",
            columns: [4, 2, 4],
            rows: [4, 2, 4]
        }, "发送");
        sendMsgBtn.x = 420;
        sendMsgBtn.y = 940;
        sendMsgBtn.on("pointerdown", this.onSendMsgHandler, this);
        inputContainer.add(sendMsgBtn);

        // this.setSize(464, 281);
        // this.setLocation(0, 0);
    }

    private onSendMsgHandler() {
        const text = this.mInputText.text;
        if (text.length > 0) {
            this.emit("sendChat", text);
            this.mInputText.setText("");
            this.mInputText.setBlur();
        }
    }
}
