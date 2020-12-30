import { NineSlicePatch, BBCodeText, IPatchesConfig, ClickEvent } from "apowophaserui";
import { Font, Handler, i18n } from "utils";

export class ItemInfoTips extends Phaser.GameObjects.Container {
    private tipsbg: NineSlicePatch;
    private tipsText: BBCodeText;
    private dpr: number;
    private key: string;
    private config: IPatchesConfig;
    private fullHide: boolean = true;
    private invalidArea: Phaser.Geom.Rectangle;
    private callback: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, bg: string, dpr: number, config?: IPatchesConfig) {
        super(scene);
        this.setSize(width, height);
        this.key = key;
        this.dpr = dpr;
        this.config = config ? config : {
            left: 15 * this.dpr,
            top: 15 * this.dpr,
            right: 15 * this.dpr,
            bottom: 15 * this.dpr
        };
        this.create(bg);
    }
    public setInvalidArea(invalidArea?: Phaser.Geom.Rectangle) {
        this.fullHide = true;
        this.invalidArea = invalidArea;
    }
    public setHandler(back: Handler) {
        this.callback = back;
    }
    public set enableFullHide(value) {
        this.fullHide = value;
        this.invalidArea = undefined;
    }

    public setVisible(value: boolean) {
        if (!value) this.hide();
        else this.show();
        super.setVisible(value);
        return this;
    }
    public hide() {
        if (this.fullHide && this.visible) {
            this.scene.input.off("pointerdown", this.onHideHandler, this);
        }
        this.visible = false;
        if (this.callback) this.callback.run();
    }

    public show() {
        if (this.fullHide && !this.visible) {
            this.scene.input.on("pointerdown", this.onHideHandler, this);
        }
        this.visible = true;
    }

    public resize(width: number, height: number) {
        this.tipsText.setWrapWidth(width);
        let tipsHeight = this.tipsText.height + 20 * this.dpr;
        if (tipsHeight < height) tipsHeight = height;
        this.setSize(width, tipsHeight);
        this.tipsbg.resize(width, tipsHeight);
        this.tipsbg.y = -tipsHeight * 0.5;
        this.tipsText.y = -tipsHeight + 10 * this.dpr;
    }
    public setText(text: string, apha: number = 0.9) {
        //  this.tipsbg.alpha = apha;
        this.tipsText.text = text;
        const tipsHeight = this.tipsText.height + 20 * this.dpr;
        const tipsWidth = this.tipsbg.width;
        this.setSize(tipsWidth, tipsHeight);
        this.tipsbg.resize(tipsWidth, tipsHeight);
        this.tipsbg.y = -tipsHeight * 0.5;
        this.tipsText.y = -tipsHeight + 10 * this.dpr;
    }
    public setItemData(data: any) {
        const tex = this.getDesText(data);
        this.setText(tex);
    }
    public setTipsPosition(gameobject: Phaser.GameObjects.Container, container: Phaser.GameObjects.Container, offsety: number = 0) {
        let posx: number = gameobject.x;
        let posy: number = gameobject.y;
        let tempobject = <Phaser.GameObjects.Container>gameobject;
        while (tempobject.parentContainer !== container) {
            posx += tempobject.parentContainer.x;
            posy += tempobject.parentContainer.y;
            tempobject = tempobject.parentContainer;
        }
        if (posx - this.width * 0.5 < -container.width * 0.5) {
            this.x = this.width * 0.5 - container.width * 0.5 + 20 * this.dpr;
        } else if (posx + this.width * 0.5 > container.width * 0.5) {
            this.x = container.width * 0.5 - this.width * 0.5 - 20 * this.dpr;
        } else {
            this.x = posx;
        }
        this.y = posy - this.height * 0.5 + 10 * this.dpr + offsety;
    }
    private create(bg: string) {
        const tipsWidth = this.width;
        const tipsHeight = this.height;
        const tipsbg = new NineSlicePatch(this.scene, 0, 0, tipsWidth, tipsHeight, this.key, bg, this.config);
        tipsbg.setPosition(0, -tipsHeight * 0.5);
        this.tipsbg = tipsbg;
        const tipsText = new BBCodeText(this.scene, -this.width * 0.5 + 10 * this.dpr, -tipsHeight + 60 * this.dpr, "", {
            color: "#333333",
            fontSize: 13 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
            wrap: {
                width: this.width - 15 * this.dpr,
                mode: "string"
            }
        }).setOrigin(0);

        this.tipsText = tipsText;
        this.add([tipsbg, tipsText]);
    }
    private getDesText(data: any) {
        if (!data) data = <any>{ "sellingPrice": true, tradable: false };
        let text: string = `[stroke=#2640CA][color=#2640CA][b]${data.name}[/b][/color][/stroke]` + "\n";
        let source = `[stroke=#2640CA][color=#2640CA]${i18n.t("item.source")}[/color][/stroke]`;
        source += data.source;
        text += source + "\n";
        let description = `[stroke=#2640CA][color=#2640CA]${i18n.t("item.des")}[/color][/stroke]：`;
        description += data.des;
        text += description;
        return text;
    }

    private onHideHandler(pointer: Phaser.Input.Pointer) {
        if (!this.checkPointerInBounds(pointer))
            this.hide();
    }
    private checkPointerInBounds(pointer) {
        if (pointer && this.invalidArea) {
            if (pointer.x > this.invalidArea.left && pointer.x < this.invalidArea.right) {
                if (pointer.y > this.invalidArea.top && pointer.y < this.invalidArea.bottom) {
                    return true;
                }
            }
        }
        return false;
    }
}
