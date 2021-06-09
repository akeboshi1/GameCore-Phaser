import { Button, ClickEvent } from "apowophaserui";
import { Render } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { Handler } from "utils";
import { MainUIRedType } from "picaStructure";
export class PicaNewActivityPanel extends Phaser.GameObjects.Container {
    public arrowButton: Button;
    private dpr: number;
    private key: string;
    private activityButton: Button;
    private indentButton: Button;
    private rechargeButton: Button;
    // 移动交互按钮
    private interactiveButton: Button;
    private emailButton: Button;
    private roamButton: Button;
    private shopButton: Button;
    private listBtns: Button[];
    private listBtns2: Button[];
    private listPosY: number[] = [];
    private tempButtons: Button[][] = [];
    private redButtonMap: Map<number, Button> = new Map();
    private sendHandler: Handler;
    private isFold: boolean = false;
    constructor(private render: Render, scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        this.init();
    }
    init() {
        this.activityButton = new Button(this.scene, UIAtlasName.iconcommon, "home_activity", "home_activity");
        this.activityButton.on(ClickEvent.Tap, this.onActivityHandler, this);

        this.indentButton = new Button(this.scene, UIAtlasName.iconcommon, "home_indent", "home_indent");
        this.indentButton.on(ClickEvent.Tap, this.onIndentHandler, this);

        this.rechargeButton = new Button(this.scene, UIAtlasName.iconcommon, "home_recharge", "home_recharge");
        this.rechargeButton.on(ClickEvent.Tap, this.onRechargeHandler, this);

        this.interactiveButton = new Button(this.scene, UIAtlasName.iconcommon, "home_recharge", "home_recharge");
        this.interactiveButton.on(ClickEvent.Tap, this.onInteractiveHandler, this);

        this.emailButton = new Button(this.scene, UIAtlasName.iconcommon, "home_email", "home_email");
        this.emailButton.on(ClickEvent.Tap, this.onEmailHandler, this);
        this.redButtonMap.set(MainUIRedType.MAIL, this.emailButton);

        this.roamButton = new Button(this.scene, UIAtlasName.iconcommon, "home_roam", "home_roam");
        this.roamButton.on(ClickEvent.Tap, this.onRoamHandler, this);

        this.shopButton = new Button(this.scene, UIAtlasName.iconcommon, "home_shop", "home_shop");
        this.shopButton.on(ClickEvent.Tap, this.onShopHandler, this);

        this.arrowButton = new Button(this.scene, UIAtlasName.uicommon, "home_more_2", "home_more_2");
        this.arrowButton.on(ClickEvent.Tap, this.onArrowHandler, this);
        this.listBtns = [this.activityButton, this.indentButton, this.rechargeButton, this.emailButton];
        this.listBtns2 = [this.roamButton, this.shopButton, this.interactiveButton];
        this.listPosY = [this.activityButton.y, this.indentButton.y, this.rechargeButton.y, this.emailButton.y];
        this.add(this.listBtns);
        this.add(this.listBtns2);
        this.add(this.arrowButton);
        this.LayoutAllButtons();
    }

    public addListen() {
        this.indentButton.on(ClickEvent.Tap, this.onIndentHandler, this);
        this.rechargeButton.on(ClickEvent.Tap, this.onRechargeHandler, this);
        this.emailButton.on(ClickEvent.Tap, this.onEmailHandler, this);
    }

    public removeListen() {
        this.indentButton.off(ClickEvent.Tap, this.onIndentHandler, this);
        this.rechargeButton.off(ClickEvent.Tap, this.onRechargeHandler, this);
        this.emailButton.off(ClickEvent.Tap, this.onEmailHandler, this);
    }
    public setHandler(send: Handler) {
        this.sendHandler = send;
    }

    public updateUIState(datas: any[]) {
        for (const data of datas) {
            const button = this.getButton(data.name);
            if (button) button.visible = data.visible;
            // if (data.visible) button.enable = data.disable;
        }
        this.LayoutAllButtons();
    }

    public get redMap() {
        return this.redButtonMap;
    }

    protected LayoutAllButtons() {
        this.tempButtons.forEach((value) => {
            value.length = 0;
        });
        this.tempButtons.length = 0;
        const items = this.LayoutButton(this.listBtns);
        const posx = this.listBtns[0].x - this.listBtns2[0].width * 0.5 - this.listBtns[0].width * 0.5 - 15 * this.dpr;
        const items2 = this.LayoutButton(this.listBtns2, posx);
        this.tempButtons.push(items);
        this.tempButtons.push(items2);
        const tempItems = items.length > items2.length ? items : items2;
        this.listPosY.length = 0;
        let lastButton: Button;
        for (const item of tempItems) {
            this.listPosY.push(item.y);
            lastButton = item;
        }
        if (lastButton) {
            this.arrowButton.y = lastButton.y + lastButton.height * 0.5 + 10 * this.dpr + this.arrowButton.height * 0.5;
            this.arrowButton.visible = true;
        } else this.arrowButton.visible = false;
    }
    protected LayoutButton(buttons: Button[], posX: number = 0) {
        const space: number = 15 * this.dpr;
        let posy = -this.height * 0.5;
        const temps = [];
        for (const button of buttons) {
            if (!button.visible) continue;
            button.x = posX;
            button.y = posy + button.height * 0.5;
            posy += button.height + space;
            temps.push(button);
        }
        return temps;
    }

    private onActivityHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["activity"]);
    }
    private onIndentHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["indent"]);
    }
    private onRechargeHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["recharge"]);
    }

    private onInteractiveHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["interactive"]);
    }

    private onEmailHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["email"]);
    }
    private onRoamHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["roam"]);
    }
    private onShopHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["shop"]);
    }
    private onArrowHandler() {
        this.isFold = !this.isFold;
        if (this.isFold) {
            this.foldButtons();
        } else
            this.unfoldButtons();
    }

    private foldButtons() {
        const from = this.listPosY[this.listPosY.length - 1];
        const to = this.listPosY[0];
        const tween = this.scene.tweens.addCounter({
            from,
            to,
            ease: "Linear",
            duration: 150,
            onUpdate: (cope: any, param: any) => {
                this.updateAllButtons(param.value);
            },
            onComplete: () => {
                tween.stop();
                tween.remove();
                this.arrowButton.setFrameNormal("home_more_1");
                this.removeListen();
            },
        });
    }

    private unfoldButtons() {
        const from = this.listPosY[0];
        const to = this.listPosY[this.listPosY.length - 1];
        const tween = this.scene.tweens.addCounter({
            from,
            to,
            ease: "Linear",
            duration: 150,
            onUpdate: (cope: any, param: any) => {
                this.updateAllButtons(param.value);
            },
            onComplete: () => {
                tween.stop();
                tween.remove();
                this.arrowButton.setFrameNormal("home_more_2");
                this.addListen();
            },
        });
    }

    private updateAllButtons(tempY: number) {
        let temparr: Button[];
        this.tempButtons.forEach((value) => {
            this.updateButtons(tempY, value);
            if (!temparr) temparr = value;
            else {
                if (temparr.length < value.length) temparr = value;
            }
        });
        if (temparr.length > 0) {
            const lastButton = temparr[temparr.length - 1];
            this.arrowButton.y = lastButton.y + lastButton.height * 0.5 + 10 * this.dpr + this.arrowButton.height * 0.5;
            const temps2 = this.tempButtons[1];
            if (temps2.length > 0) {
                if (lastButton.y === this.listPosY[0]) {
                    temps2[0].visible = false;
                } else temps2[0].visible = true;
            }

        }

    }

    private updateButtons(tempY: number, buttons: Button[]) {
        const lowY = this.listPosY[0];
        const dis = this.listPosY[this.listPosY.length - 1] - tempY;
        for (let i = 1; i < buttons.length; i++) {
            const button = buttons[i];
            let posy = this.listPosY[i] - dis;
            button.y = posy;
            const maxY = this.listPosY[i];
            if (posy > maxY) posy = maxY;
            if (posy < lowY) posy = lowY;
            let alpha = (posy - lowY) / (button.height * 0.5);
            alpha = alpha < 0 ? 0 : alpha;
            alpha = alpha > 1 ? 1 : alpha;
            button.alpha = alpha;
            button.y = posy;
        }
    }
    private getButton(name: string) {
        if (name === "mainui.activity") {
            return this.activityButton;
        } else if (name === "mainui.indent") {
            return this.indentButton;
        } else if (name === "mainui.recharge") {
            return this.rechargeButton;
        } else if (name === "mainui.email") {
            return this.emailButton;
        } else if (name === "mainui.roam") {
            return this.roamButton;
        } else if (name === "mainui.shop") {
            return this.shopButton;
        }
    }
}
