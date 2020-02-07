import InputText from "../../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import { WorldService } from "../../game/world.service";
import { World } from "../../game/world";
import { Tool } from "../../utils/tool";
import { MainUIScene } from "../../scenes/main.ui";

export class InputTextFactory {
    private mWorld: WorldService;
    constructor(world: WorldService) {
        this.mWorld = world;
    }

    public getInputText(scene: Phaser.Scene, style: any): InputTextField {
        const inputtext = new InputTextField(scene, this.mWorld, style);
        return inputtext;
    }
}

export const InputTextFieldEvent = {
    textchange: "textchange",
    textclick: "textclick",
    textdblclick: "textdblclick",
    textfocus: "textfocus",
    textblur: "textblur",
};

export class InputTextField extends Phaser.Events.EventEmitter {
    private mTextField: Phaser.GameObjects.Text;
    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private mInputText: InputText;
    private textConfig: any;
    private mDelayTime: number = 300;
    private mInputTimeID;
    constructor(scene: Phaser.Scene, world: WorldService, config: any) {
        super();
        this.mScene = scene;
        this.mWorld = world;
        this.textConfig = config;
        this.mTextField = scene.make.text({
            align: config.align,
            x: config.x,
            y: config.y,
            stroke: "#000000",
            strokeThickness: 2,
            style: {
                color: config.color,
                font: config.font,
                wordWrap: {
                    width: config.textWidth,
                    height: config.textHeight,
                }
            }
        }, false).setInteractive(new Phaser.Geom.Rectangle(0, 0, config.textWidth, config.textHeight), Phaser.Geom.Rectangle.Contains);
        this.mTextField.setOrigin(0.5, 0.5);
        this.mTextField.setAlign(config.align);
        this.mTextField.setText(config.text || "");
        this.mTextField.on("pointerdown", this.showText, this);
    }

    public getView(): Phaser.GameObjects.Text {
        return this.mTextField;
    }

    public destroy() {
        if (this.mInputText) {
            this.mInputText.destroy();
        }
        this.mInputText = null;
    }

    private showText() {
        const textX: number = this.textConfig.posType === 1 ? -this.textConfig.textWidth >> 1 : -this.mWorld.getSize().width >> 1;
        const defaultText: string = this.mTextField.text && this.mTextField.text.length > 0 ?
            this.mTextField.text : this.textConfig.minNum;
        if (!this.mInputText) {
            this.mInputText = new InputText(this.mScene, {
                id: this.textConfig.id,
                x: textX,
                y: this.textConfig.y,
                width: this.textConfig.textWidth,
                height: this.textConfig.textHeight,
                type: this.textConfig.type,
                fontSize: this.textConfig.font,
                color: this.textConfig.color,
                "z-index": 999,
                align: "center",
                text: defaultText,
                posType: this.textConfig.posType
            });
            this.mInputText.setOrigin(0, 0.6);
        } else {
            this.mInputText.setText(defaultText);
        }
        // 0 顶部 1 当前文本位置
        if (this.textConfig.posType === 1) {
            this.mTextField.visible = false;
            if (!this.mInputText.parentContainer) this.mTextField.parentContainer.add(this.mInputText);
        }
        this.mInputText.visible = true;
        this.mInputText.on("textchange", this.onTextchange, this);
        this.mInputText.on("onclick", this.onTextClick, this);
        this.mInputText.on("ondblclick", this.onTextDbclick, this);
        this.mInputText.on("focus", this.onTextFocus, this);
        this.mInputText.on("blur", this.onTextBlur, this);
        this.mScene.input.on("gameobjectdown", this.sceneDown, this);
        if (this.mWorld.game.device.os.iOS && !this.mWorld.game.device.os.desktop) {
            this.setInputFocus();
        } else {
            this.mInputTimeID = (this.mScene as MainUIScene).setTimeout(() => {
                this.setInputFocus();
            }, this.mDelayTime);
        }
    }

    private hideText() {
        this.mTextField.visible = true;
        if (!this.mInputText) return;
        this.mInputText.off("textchange", this.onTextchange, this);
        this.mInputText.off("onclick", this.onTextClick, this);
        this.mInputText.off("ondblclick", this.onTextDbclick, this);
        this.mInputText.off("focus", this.onTextFocus, this);
        this.mInputText.off("blur", this.onTextBlur, this);
        this.mScene.input.off("gameobjectdown", this.sceneDown, this);
        const text = this.mInputText.text;
        if (text.length > 0) {
            this.mTextField.setText(text);
        }
        this.mInputText.setText("");
        this.mInputText.setBlur();
        this.mInputText.visible = false;
        if (this.mInputTimeID) {
            (this.mScene as MainUIScene).clearTimeout(this.mInputTimeID);
        }
        if (this.textConfig.posType === 1) {
            this.mTextField.visible = true;
        }
    }

    private setInputFocus() {
        // 从dom中获取对应id的输入文本
        const input: any = document.all.namedItem(this.textConfig.id);
        if (input) {
            input.focus();
        }
    }

    private sceneDown(pointer, gameobject) {
        if (gameobject && gameobject === this.mTextField) {
            return;
        }
        this.onTextBlur();
    }

    private onTextchange() {
        if (this.textConfig.type === "number") {
            let num: number = Number(this.mInputText.text);
            if (isNaN(num)) {
                num = 0;
            }
            if (this.textConfig.minNum && this.textConfig.maxNum) {
                if (num < this.textConfig.minNum) {
                    num = this.textConfig.minNum;
                } else if (num > this.textConfig.maxNum) {
                    num = this.textConfig.maxNum;
                }
            }
            this.mInputText.text = num + "";
        }
        this.emit(InputTextFieldEvent.textchange);
    }

    private onTextClick() {
        this.emit(InputTextFieldEvent.textclick);
    }

    private onTextDbclick() {
        this.emit(InputTextFieldEvent.textdblclick);
    }

    private onTextFocus() {
        this.emit(InputTextFieldEvent.textfocus);
    }

    private onTextBlur() {
        this.hideText();
        this.emit(InputTextFieldEvent.textblur);
    }
}
