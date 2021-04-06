import { ClickEvent, Button, BBCodeText } from "apowophaserui";
import { CommonBackground, DynamicImage, ItemInfoTips, ProgressMaskBar, ToggleColorButton, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { Handler, i18n, UIHelper, Url } from "utils";
import { PicaSceneNavigationMapPanel } from "./PicaSceneNavigationMapPanel";
import { PicaBasePanel } from "../pica.base.panel";
import { UIAtlasName } from "picaRes";
import { op_client } from "pixelpai_proto";
export class PicaSceneNavigationPanel extends PicaBasePanel {
    private content: Phaser.GameObjects.Container;
    private blackBg: Phaser.GameObjects.Graphics;
    private bg: CommonBackground;
    private townPanel: PicaSceneNavigationMapPanel;
    private mNavigationData: any[];
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICASCENENAVIGATION_NAME;
        this.atlasNames = [UIAtlasName.map];
    }

    public resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.blackBg.clear();
        this.blackBg.fillStyle(0, 0.66);
        this.blackBg.fillRect(0, 0, width, height);
        this.content.x = -this.content.width * 0.5 - 10 * this.dpr;
        this.content.y = height * 0.5;
        this.setSize(width, height);
    }

    public onShow() {
        if (this.mNavigationData) this.setNavigationListData(this.mNavigationData);
    }

    public setNavigationListData(content: any[]) {
        this.mNavigationData = content;
        if (!this.mInitialized) return;
        this.openTownNavigationPanel();
        this.townPanel.setTownDatas(content);
    }

    protected init() {
        if (this.mInitialized) return;
        const w = this.scaleWidth;
        const h = this.scaleHeight;
        this.blackBg = this.scene.make.graphics(undefined, false);
        this.blackBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        this.blackBg.on("pointerup", this.onCloseHandler, this);
        this.add(this.blackBg);
        this.content = this.scene.make.container(undefined, false);
        const bgwidth = 300 * this.dpr, bgheight = h;
        this.content.setSize(bgwidth, bgheight);
        this.bg = new CommonBackground(this.scene, 0, 0, bgwidth, bgheight);
        this.content.add([this.bg]);
        this.add([this.content]);
        this.resize(0, 0);
        super.init();
        this.playMove(new Handler(this, () => {
            if (this.townPanel) {
                this.townPanel.refreshMask();
            }
        }), new Handler(this, () => {
            if (this.townPanel) this.townPanel.refreshMask();
        }));
    }

    protected onHide() {
        this.hideTownNavigationPanel();
    }

    private openTownNavigationPanel() {
        if (!this.townPanel) {
            const offset = 60 * this.dpr;
            const height = this.scaleHeight - offset;
            this.townPanel = new PicaSceneNavigationMapPanel(this.scene, 274 * this.dpr, height, this.dpr, this.scale);
            this.townPanel.setHandler(new Handler(this, this.onTownHandler));
            this.townPanel.y = (offset) * 0.5;
            this.content.add(this.townPanel);
        }
        this.townPanel.show();
        this.townPanel.refreshMask();
    }

    private hideTownNavigationPanel() {
        if (this.townPanel)
            this.townPanel.hide();
    }

    private onTownHandler(tag: string, data: any) {// op_client.IEditModeRoom
        if (tag === "enter") {
            this.onEnterRoomHandler(data);
        } else if (tag === "progress") {

        }
    }

    private onEnterRoomHandler(roomID: string) {
        this.render.renderEmitter(this.key + "_queryenter", roomID);
    }

    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_close");
    }
    private playMove(handler: Handler, update: Handler) {
        const from = -this.content.width * 0.5 - 10 * this.dpr;
        const to = this.content.width * 0.5;
        const tween = this.scene.tweens.add({
            targets: this.content,
            x: {
                from,
                to
            },
            ease: "Linear",
            duration: 300,
            onComplete: () => {
                tween.stop();
                tween.remove();
                if (handler) handler.run();
            },
            onUpdate: () => {
                if (update) update.run();
            }
        });
    }
}
