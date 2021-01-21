import { op_client } from "pixelpai_proto";
import { ButtonEventDispatcher, UiManager } from "gamecoreRender";
import { Button, ClickEvent, NineSliceButton } from "apowophaserui";
import { ModuleName } from "structure";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaExploreLogSettlePanel } from "./PicaExploreLogSettlePanel";

export class PicaExploreLogPanel extends PicaBasePanel {
    private goOutBtn: Button;
    private expProgress: ExploreTimeProgress;
    private textCon: Phaser.GameObjects.Container;
    private settlePanel: PicaExploreLogSettlePanel;
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
        this.expProgress.x = w - this.expProgress.width * 0.5 - 40 * this.dpr;
        this.expProgress.y = h - 240 * this.dpr;
        this.textCon.y = this.expProgress.y + 55 * this.dpr;
        this.textCon.x = w * 0.5;
        this.expProgress.refreshMask();
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
        this.textCon = this.scene.make.container(undefined, false);
        this.add([this.goOutBtn, this.expProgress, this.textCon]);
        this.resize(w, h);
        super.init();
        this.setTimeProgress(30000);
    }

    setExploreDatas(texts: string[]) {
        this.textCon.removeAll(true);
        const bwidth = 107 * this.dpr, bheight = 25 * this.dpr;
        let posX = -this.width * 0.5 + bwidth * 0.5 + 7 * this.dpr;
        for (const text of texts) {
            const button = new NineSliceButton(this.scene, 0, 0, bwidth, bheight, UIAtlasName.explorelog, "checkpoint_aims_bg", text, this.dpr, this.scale, {
                left: 10 * this.dpr, right: 10 * this.dpr, top: 0 * this.dpr, bottom: 0 * this.dpr
            });
            button.setTextStyle(UIHelper.colorStyle("#FFEE5D", 11 * this.dpr));
            button.x = posX;
            posX += bwidth + 12 * this.dpr;
            if (text === "") button.alpha = 0;
            this.textCon.add(button);
        }
    }

    setExploreSettleDatas(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_SUMMARY) {
        this.openSettlePanel();
        this.settlePanel.setSettleData(content);
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
    }

    hideSettlePanel() {

    }

    setTipsLayout(extpand: boolean) {
        const offset = extpand ? this.scaleHeight - 360 * this.dpr : this.scaleHeight - 240 * this.dpr;
        this.expProgress.y = offset;
        this.textCon.y = this.expProgress.y + 55 * this.dpr;
        this.expProgress.refreshMask();
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
        this.render.renderEmitter(ModuleName.PICAEXPLORELOG_NAME + "_querygohome");
    }

    private onSettleHandler() {
        // const data = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_SUMMARY();
        // data.latestProgress = 300;
        // data.previousProgress = 200;
        // data.pointBase = 200;
        // data.pointCombo = 300;
        // data.pointHint = 200;
        // data.pointTime = 300;
        // data.rewards = [];
        // for (let i = 0; i < 8; i++) {
        //     const tdata = new op_client.CountablePackageItem();
        //     tdata.display = {};
        //     data.rewards.push(tdata);
        // }
        // this.setExploreSettleDatas(data);
        this.onGoOutHandler();
    }

    private clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
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
