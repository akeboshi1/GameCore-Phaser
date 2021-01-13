import { op_client } from "pixelpai_proto";
import { ButtonEventDispatcher, UiManager } from "gamecoreRender";
import { Button, ClickEvent, NineSliceButton } from "apowophaserui";
import { ModuleName } from "structure";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";

export class PicaExploreLogPanel extends PicaBasePanel {
    private goOutBtn: Button;
    private expProgress: ExploreTimeProgress;
    private textCon: Phaser.GameObjects.Container;
    private timer: any;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.atlasNames = [UIAtlasName.explorelog];
        this.key = ModuleName.PICAEXPLORELOG_NAME;
    }
    resize(width: number, height: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(width, height);
        this.setSize(w, h);
        this.goOutBtn.x = w - this.goOutBtn.width * 0.5 - 10 * this.dpr;
        this.goOutBtn.y = this.goOutBtn.height * 0.5 + 10 * this.dpr;
        this.expProgress.x = w - this.expProgress.width * 0.5 - 20 * this.dpr;
        this.expProgress.y = h - 240 * this.dpr;
        this.textCon.y = this.expProgress.y + 50 * this.dpr;
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
    }

    setExploreDatas(texts: string[]) {
        const list = this.textCon.list;
        for (const obj of list) {
            obj.destroy(true);
        }
        list.length = 0;
        const bwidth = 107 * this.dpr, bheight = 25 * this.dpr;
        let posX = -this.width * 0.5 + bwidth * 0.5 + 7 * this.dpr;
        for (const text of texts) {
            const button = new NineSliceButton(this.scene, 0, 0, bwidth, bheight, UIAtlasName.explorelog, "checkpoint_aims_bg", text, this.dpr, this.scale, {
                left: 10 * this.dpr, right: 10 * this.dpr, top: 0 * this.dpr, bottom: 0 * this.dpr
            });
            button.setTextStyle(UIHelper.colorStyle("#FFEE5D", 11 * this.dpr));
            button.x = posX;
            posX += bwidth + 12 * this.dpr;
            this.textCon.add(button);
        }
        this.setTimeProgress(30000);
    }

    setTimeProgress(time) {
        this.clearTimer();
        let temp = 0;
        this.timer = setInterval(() => {
            const value = temp / time;
            temp += 20;
            this.expProgress.setProgress(value);
            if (value >= 1) this.clearTimer();
        }, 20);
    }

    destroy() {
        super.destroy();
        this.clearTimer();
    }

    private onProClickHandler() {

    }
    private onGoOutHandler() {
        this.render.renderEmitter(ModuleName.PICAEQUIPUPGRADE_NAME + "_hide");
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
