import { Button, ClickEvent } from "apowophaserui";
import { Render } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { ModuleName } from "structure";
import { Handler, i18n } from "utils";

export class PicaNewActivityPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private key: string;
    private activityButton: Button;
    private indentButton: Button;
    private rechargeButton: Button;
    private emailButton: Button;
    private roamButton: Button;
    private arrowButton: Button;
    private listBtns: Button[];
    private listBtns2: Button[];
    private listPosY: number[] = [];
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
        const activityButton = new Button(this.scene, UIAtlasName.iconcommon, "home_activity", "home_activity");
        activityButton.y = -this.height * 0.5 + activityButton.height * 0.5;
        this.activityButton = activityButton;
        this.activityButton.on(ClickEvent.Tap, this.onActivityHandler, this);

        const indentButton = new Button(this.scene, UIAtlasName.iconcommon, "home_indent", "home_indent");
        indentButton.y = activityButton.y + activityButton.height * 0.5 + 15 * this.dpr + indentButton.height * 0.5;
        this.indentButton = indentButton;
        this.indentButton.on(ClickEvent.Tap, this.onIndentHandler, this);

        const rechargeButton = new Button(this.scene, UIAtlasName.iconcommon, "home_recharge", "home_recharge");
        rechargeButton.y = indentButton.y + indentButton.height * 0.5 + 15 * this.dpr + rechargeButton.height * 0.5;
        this.rechargeButton = rechargeButton;
        this.rechargeButton.on(ClickEvent.Tap, this.onRechargeHandler, this);

        const emailButton = new Button(this.scene, UIAtlasName.iconcommon, "home_email", "home_email");
        emailButton.y = rechargeButton.y + rechargeButton.height * 0.5 + 15 * this.dpr + emailButton.height * 0.5;
        this.emailButton = emailButton;
        this.emailButton.on(ClickEvent.Tap, this.onEmailHandler, this);

        this.roamButton = new Button(this.scene, UIAtlasName.iconcommon, "home_roam", "home_roam");
        this.roamButton.y = activityButton.y;
        this.roamButton.x = activityButton.x - this.roamButton.width * 0.5 - activityButton.width * 0.5 - 15 * this.dpr;
        this.roamButton.on(ClickEvent.Tap, this.onRoamHandler, this);

        this.arrowButton = new Button(this.scene, UIAtlasName.uicommon, "home_more_2", "home_more_2");
        this.arrowButton.y = emailButton.y + emailButton.height * 0.5 + 10 * this.dpr + this.arrowButton.height * 0.5;
        this.arrowButton.on(ClickEvent.Tap, this.onArrowHandler, this);

        this.listBtns = [activityButton, indentButton, rechargeButton, emailButton];
        this.listBtns2 = [this.roamButton];
        this.listPosY = [activityButton.y, indentButton.y, rechargeButton.y, emailButton.y];
        this.add(this.listBtns);
        this.add(this.listBtns2);
        this.add(this.arrowButton);
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
    private onActivityHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["activity"]);
    }
    private onIndentHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["indent"]);
    }
    private onRechargeHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["recharge"]);
    }

    private onEmailHandler() {
        const tempdata = {
            text: [{ text: i18n.t("noticeTips.staytuned"), node: undefined }]
        };
        this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, tempdata);
        return;
        if (this.sendHandler) this.sendHandler.runWith(["email"]);
    }
    private onRoamHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["roam"]);
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
        this.updateButtons(tempY, this.listBtns);
        this.updateButtons(tempY, this.listBtns2);
        const lastButton = this.listBtns[this.listBtns.length - 1];
        this.arrowButton.y = lastButton.y + lastButton.height * 0.5 + 10 * this.dpr + this.arrowButton.height * 0.5;
        if (lastButton.y === this.listPosY[0]) {
            this.listBtns2[0].visible = false;
        } else this.listBtns2[0].visible = true;
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
}
