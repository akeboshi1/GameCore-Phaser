import { op_client } from "pixelpai_proto";
import { ButtonEventDispatcher, ImageValue, ProgressMaskBar, UiManager } from "gamecoreRender";
import { Button, ClickEvent, NineSliceButton } from "apowophaserui";
import { ModuleName } from "structure";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaExploreLogSettlePanel } from "./PicaExploreLogSettlePanel";

export class PicaExploreLogPanel extends PicaBasePanel {
    private goOutBtn: Button;
    private continueProgress: ProgressMaskBar;
    private continueText: Phaser.GameObjects.Text;
    private expProgress: ExploreTimeProgress;
    private textCon: ExploreTipsTextsCon;
    private settlePanel: PicaExploreLogSettlePanel;
    private rotateTween: Phaser.Tweens.Tween;
    private guideCon: PicaExploreLogGuideText;
    private timer: any;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.atlasNames = [UIAtlasName.explorelog, UIAtlasName.uicommon1];
        this.key = ModuleName.PICAEXPLORELOG_NAME;
    }
    resize(width: number, height: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(width, height);
        this.setSize(w, h);
        this.goOutBtn.x = w - this.goOutBtn.width * 0.5 - 10 * this.dpr;
        this.goOutBtn.y = this.goOutBtn.height * 0.5 + 10 * this.dpr;
        this.continueProgress.x = w * 0.5;
        this.continueProgress.y = -this.continueProgress.height * 0.5;
        this.continueText.x = this.continueProgress.x + this.continueProgress.width * 0.5 + 5 * this.dpr;
        this.continueText.y = this.continueProgress.y;
        this.expProgress.x = w - this.expProgress.width * 0.5 - 40 * this.dpr;
        this.expProgress.y = h - 240 * this.dpr;
        this.textCon.y = this.expProgress.y + 55 * this.dpr;
        this.textCon.x = w * 0.5;
        this.expProgress.refreshMask();
        this.textCon.refreshMask();
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.goOutBtn.on(ClickEvent.Tap, this.onGoOutHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.goOutBtn.off(ClickEvent.Tap, this.onGoOutHandler, this);
    }

    init() {
        const w = this.scaleWidth;
        const h = this.scaleHeight;
        this.setSize(w, h);
        this.goOutBtn = new Button(this.scene, UIAtlasName.explorelog, "checkpoint_abort");
        this.expProgress = new ExploreTimeProgress(this.scene, this.dpr, this.scale);
        this.expProgress.setHandler(new Handler(this, this.onProClickHandler));
        this.continueProgress = new ProgressMaskBar(this.scene, UIAtlasName.explorelog, "checkpoint_progress bar_bottom", "checkpoint_progress bar_top");
        this.continueProgress.visible = false;
        this.continueText = this.scene.make.text({ style: UIHelper.yellowStyle(this.dpr, 24) }).setOrigin(0, 0.5);
        this.continueText.setFontStyle("bold italic");
        this.textCon = new ExploreTipsTextsCon(this.scene, w, 138 * this.dpr, this.dpr, this.scale);
      //  this.guideCon = new PicaExploreLogGuideText(this.scene, 132 * this.dpr, 113 * this.dpr, this.dpr);
        this.add([this.goOutBtn, this.expProgress, this.continueProgress, this.continueText, this.textCon]);
        this.resize(w, h);
        super.init();
        this.setTimeProgress(30000);
    }

    setExploreDatas(texts: string[]) {
        this.textCon.setTextTips(texts);
    }

    setExploreCountDown(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_SHOW_COUNTDOWN) {
        this.continueProgress.setProgress(100, 100);
        this.continueText.text = `x${content.combo}`;
        if (!this.continueProgress.visible) {
            this.continueProgress.visible = true;
            const to = this.continueProgress.height * 0.5 + 20 * this.dpr;
            this.continueText.scale = 0.01;
            UIHelper.playtPosYTween(this.scene, this.continueProgress, 0, to, 300, "Bounce.easeOut", undefined, new Handler(this, () => {
                if (!this.scene) return;
                this.playRotateTween(0, 100, content.seconds * 1000);
                this.continueText.alpha = 1;
                UIHelper.playScaleTween(this.scene, this.continueText, 0.1, 1, 200, "Back.easeInOut", undefined);
            }), new Handler(this, () => {
                if (!this.scene) return;
                this.continueProgress.refreshMask();
                this.continueText.y = this.continueProgress.y;
            }));
        } else {
            if (content.combo === 0) {
                this.continueFadeOutAnimation();
            } else {
                this.playRotateTween(0, 100, content.seconds * 1000);
                this.continueText.scale = 0.1;
                this.continueText.alpha = 1;
                UIHelper.playScaleTween(this.scene, this.continueText, 0.1, 1, 200, "Linear", undefined);
            }
        }
    }
    setExploreSettleDatas(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_SUMMARY) {
        this.openSettlePanel();
        this.settlePanel.setSettleData(content);
        this.clearRotateTween();
    }

    setTimeProgress(time) {
        this.expProgress.setProgress(0);
        this.clearTimer();
        let temp = 0;
        this.timer = setInterval(() => {
            const value = temp / time;
            temp += 20;
            this.expProgress.setProgress(value);
            if (value >= 1) this.clearTimer();
        }, 20);
    }

    openSettlePanel() {
        const wid = this.width;
        const hei = this.height;
        if (!this.settlePanel) {
            this.settlePanel = new PicaExploreLogSettlePanel(this.scene, wid, hei, this.dpr, this.scale);
            this.settlePanel.setHandler(new Handler(this, this.onSettleHandler));
            this.settlePanel.y = -20 * this.dpr;
        }
        this.add(this.settlePanel);
        this.settlePanel.x = wid * 0.5;
        this.settlePanel.y = hei * 0.5;
        this.settlePanel.resize(wid, hei);
        this.settlePanel.visible = true;
    }

    hideSettlePanel() {
        this.settlePanel.visible = false;
    }

    setTipsLayout(extpand: boolean) {
        const offset = extpand ? this.scaleHeight - 360 * this.dpr : this.scaleHeight - 240 * this.dpr;
        this.expProgress.y = offset;
        this.textCon.y = this.expProgress.y + 55 * this.dpr;
        this.expProgress.refreshMask();
        this.textCon.refreshMask();
    }

    destroy() {
        super.destroy();
        this.clearTimer();
    }

    private onProClickHandler() {
        this.render.renderEmitter(ModuleName.PICAEXPLORELOG_NAME + "_queryexplorehint");
        this.setTimeProgress(30000);
    }
    private onGoOutHandler() {
        UIHelper.createMessageBox(this.render, this, this.key, i18n.t("explore.exit"), i18n.t("explore.exittips"), () => {
            this.render.renderEmitter(ModuleName.PICAEXPLORELOG_NAME + "_querygohome");
        });
    }

    private onSettleHandler() {
        this.render.renderEmitter(ModuleName.PICAEXPLORELOG_NAME + "_showexplorelist");
        this.hideSettlePanel();
    }

    private clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }
    private playRotateTween(from: number, to: number, duration: number) {
        if (!this.scene) return;
        this.clearRotateTween();
        this.rotateTween = this.scene.tweens.addCounter({
            from,
            to,
            ease: "Linear",
            duration,
            onUpdate: (cope: any, param: any) => {
                if (!this.scene) {
                    this.rotateTween.stop();
                    this.rotateTween.remove();
                }
                this.continueProgress.setProgress(to - param.value, to);
                if (param.value === to) {
                    this.continueFadeOutAnimation();
                }
            },
            onComplete: () => {
                this.clearRotateTween();
            },
        });
    }
    private clearRotateTween() {
        if (this.rotateTween) {
            this.rotateTween.stop();
            this.rotateTween.remove();
            this.rotateTween = undefined;
        }
    }

    private continueFadeOutAnimation() {
        if (!this.scene) return;
        if (!this.continueProgress.visible) return;
        UIHelper.playAlphaTween(this.scene, this.continueProgress, 1, 0, 500, "Linear", undefined, new Handler(this, () => {
            if (!this.scene) return;
            this.continueProgress.visible = false;
            this.continueProgress.y = -this.continueProgress.height * 0.5;
            this.continueProgress.alpha = 1;
        }), new Handler(this, (value: number) => {
            this.continueText.alpha = value;
        }));
    }
}
class ExploreTimeProgress extends ButtonEventDispatcher {
    public dpr: number;
    private zoom: number;
    private bg: Phaser.GameObjects.Image;
    private lightbg: Phaser.GameObjects.Image;
    private topbg: Phaser.GameObjects.Image;
    private lightIcon: Phaser.GameObjects.Image;
    private barmask: Phaser.GameObjects.Graphics;
    private send: Handler;
    private proValue: number = 0;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene, 0, 0, false);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
        this.enable = true;
    }

    public setProgress(value: number) {
        const startAngle = -90;
        const endAngle = 360 * value - 90;
        this.barmask.clear();
        this.barmask.fillStyle(0xffffff);
        this.barmask.slice(0, 0, 43 * this.dpr / this.zoom, Phaser.Math.DegToRad(startAngle), Phaser.Math.DegToRad(endAngle), false);
        this.barmask.fillPath();
        if (value >= 1) {
            this.lightIcon.setFrame("checkpoint_prompt_icon_light");
        } else {
            this.lightIcon.setFrame("checkpoint_prompt_icon_gray");
        }
        this.proValue = value;
    }

    refreshMask() {
        const world = this.getWorldTransformMatrix();
        this.barmask.setPosition(world.tx, world.ty);
    }

    destroy() {
        super.destroy();
        this.barmask.destroy();
    }

    public setHandler(send: Handler) {
        this.send = send;
    }
    protected init() {
        this.bg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "checkpoint_prompt_bottom" });
        this.lightbg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "checkpoint_prompt_schedule" });
        this.topbg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "checkpoint_prompt_top" });
        this.lightIcon = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "checkpoint_prompt_icon_gray" });
        this.barmask = this.scene.make.graphics(undefined, false);
        this.lightbg.mask = this.barmask.createGeometryMask();
        this.add([this.bg, this.lightbg, this.topbg, this.lightIcon]);
        this.setSize(this.bg.width, this.bg.height);
        this.on(ClickEvent.Tap, this.onClickHandler, this);
    }

    private onClickHandler() {
        if (this.send && this.proValue >= 1) this.send.run();
    }
}

class ExploreTipsTextsCon extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private maskGrap: Phaser.GameObjects.Graphics;
    private tipsItems: NineSliceButton[] = [];
    private tweens: Phaser.Tweens.Tween[] = [];
    private texts: string[] = [];
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.maskGrap = this.scene.make.graphics(undefined, false);
        this.maskGrap.clear();
        this.maskGrap.fillStyle(0, 1);
        this.maskGrap.fillRect(-width * 0.5 * zoom, -height * 0.5 * zoom, width * zoom, height * zoom);
        this.mask = this.maskGrap.createGeometryMask();
    }
    refreshMask() {
        const world = this.getWorldTransformMatrix();
        this.maskGrap.setPosition(world.tx, world.ty);
    }

    setTextTips(texts: string[]) {
        const bwidth = 107 * this.dpr, bheight = 25 * this.dpr;
        let posX = -this.width * 0.5 + bwidth * 0.5 + 7 * this.dpr;
        const first = this.tipsItems.length === 0 ? true : false;
        for (let i = 0; i < texts.length; i++) {
            const text = texts[i];
            const before = this.texts[i];
            if (before !== text && text !== "") {
                const button = new NineSliceButton(this.scene, 0, 0, bwidth, bheight, UIAtlasName.explorelog, "checkpoint_aims_bg", text, this.dpr, this.scale, {
                    left: 10 * this.dpr, right: 10 * this.dpr, top: 0 * this.dpr, bottom: 0 * this.dpr
                });
                button.setTextStyle(UIHelper.colorStyle("#FFEE5D", 11 * this.dpr));
                button.x = posX;
                const replaceItem = this.tipsItems[i];
                if (!first) this.replaceAnimation(button, replaceItem);
                this.add(button);
                this.tipsItems[i] = button;
            } else {
                if (text === "") {
                    const replaceItem = this.tipsItems[i];
                    if (!first) this.replaceAnimation(undefined, replaceItem);
                }
            }
            posX += bwidth + 12 * this.dpr;
            this.texts[i] = text;
        }
        if (first) this.firstAnimation();
    }

    private firstAnimation() {
        let delay = 0;
        for (const item of this.tipsItems) {
            item.y = this.height * 0.5;
            this.playtPosYTween(item, this.height * 0.5, 0, 600, undefined, delay);
            delay += 50;
        }
    }

    private replaceAnimation(source: NineSliceButton, target?: NineSliceButton) {
        if (target) {
            target.y = 0;
            this.playtPosYTween(target, 0, -this.height * 0.5, 600 * this.dpr, new Handler(this, () => {
                target.destroy();
            }));
            this.playAlphaTween(target, 1, 0, 500);
        }
        if (source) {
            source.y = this.height * 0.5;
            this.playtPosYTween(source, this.height * 0.5, 0, 600);
        }
    }
    private playtPosYTween(obj: any, from: number, to: number, duration: number = 500, compl?: Handler, delay?: number) {
        if (!this.scene) return;
        const tweenY = this.scene.tweens.add({
            targets: obj,
            y: {
                from,
                to
            },
            ease: "Bounce.easeOut",
            duration,
            delay,
            onComplete: () => {
                tweenY.stop();
                tweenY.remove();
                this.removeTween(tweenY);
                if (compl) compl.run();
            },
        });
        this.tweens.push(tweenY);
    }

    private playAlphaTween(obj: any, from: number, to: number, duration: number = 500, compl?: Handler, delay?: number) {
        if (!this.scene) return;
        const tweenAlpha = this.scene.tweens.add({
            targets: obj,
            alpha: {
                from,
                to
            },
            ease: "Linear",
            duration,
            delay,
            onComplete: () => {
                tweenAlpha.stop();
                tweenAlpha.remove();
                this.removeTween(tweenAlpha);
                if (compl) compl.runWith(to);
            },
        });
        this.tweens.push(tweenAlpha);
    }
    private removeTween(tween: Phaser.Tweens.Tween) {
        const index = this.tweens.indexOf(tween);
        if (index !== -1) this.tweens.splice(index, 1);
    }
}
class PicaExploreLogGuideText extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private title: Phaser.GameObjects.Text;
    private close: Button;
    private dpr: number;
    private imageValues: ImageValue[] = [];
    private mixWidth: number = 0;
    private mixHeight: number = 0;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.mixWidth = width;
        this.mixHeight = height;
        this.dpr = dpr;
        this.background = this.scene.make.graphics(undefined, false);
        this.title = this.scene.make.text({ style: UIHelper.whiteStyle(dpr) });
        this.title.setFontStyle("bold");
        this.title.text = i18n.t("explore.exploretask");
        this.title.x = 10 * dpr;
        this.title.y = this.title.height * 0.5 + 10 * dpr;
        this.close = new Button(scene, UIAtlasName.explorelog, "checkpoint_end_aims_closed", "checkpoint_end_aims_closed");
        this.close.x = 132 * dpr;
        this.close.y = this.title.y;
        this.add([this.background, this.title, this.close]);
    }

    public setGuideTexts(data: op_client.IGUIDE_TEXT[]) {
        for (const img of this.imageValues) {
            img.visible = false;
        }
        for (let i = 0; i < data.length; i++) {
            let item: ImageValue;
            const temp = data[i];
            if (i < this.imageValues.length) {
                item = this.imageValues[i];
            } else {
                item = new ImageValue(this.scene, 132 * this.dpr, 13 * this.dpr, UIAtlasName.explorelog, "checkpoint_end_aims_undone", this.dpr);
                item.setLayout(1);
                this.imageValues.push(item);
            }
            const finish = temp.progress === temp.totalSteps;
            const frame = finish ? "checkpoint_end_aims_done" : "checkpoint_end_aims_undone";
            const color = finish ? "#FFFFFF" : "#FFEE5D";
            const text = `${temp.text} (${temp.progress}/${temp.totalSteps})`;
            item.setFrameValue(text, UIAtlasName.explorelog, frame);
            item.setTextStyle({ color });
            item.visible = true;
        }
        this.setLayoutTexts();
    }

    private setLayoutTexts() {
        let mixWidth = this.mixWidth;
        let mixHeight = this.mixHeight;
        const space = 16 * this.dpr;
        let posy = 30 * this.dpr;
        const posx = 20 * this.dpr;
        for (let i = 0; i < this.imageValues.length; i++) {
            const item = this.imageValues[i];
            if (!item.visible) break;
            item.y = posy;
            item.x = posx;
            posy += i * (item.height + space) * i;
            if (mixWidth < item.width) mixWidth = item.width;
        }
        if (mixHeight < posy + 20 * this.dpr) mixHeight = posy + 20 * this.dpr;
        this.background.clear();
        this.background.fillStyle(0, 0.3);
        this.background.fillRoundedRect(0, 0, mixWidth, mixHeight, { tl: 0, tr: 5 * this.dpr, br: 5 * this.dpr, bl: 0 });
    }
}
