import { UiManager } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { ModuleName } from "structure";
import { Handler, i18n } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaLeaderBoardListPanel } from "./PicaLeaderBoardListPanel";
import { CommonBackground } from "..";
import { PicaLeaderBoardDetailPanel } from "./PicaLeaderBoardDetailPanel";
import { PicaLeaderBoardTipsPanel } from "./PicaLeaderBoardTipsPanel";
export class PicaLeaderBoardPanel extends PicaBasePanel {
    private mBackground: CommonBackground;
    private content: Phaser.GameObjects.Container;
    private listPanel: PicaLeaderBoardListPanel;
    private detailPanel: PicaLeaderBoardDetailPanel;
    private redObj: any;
    private tipsPanel: PicaLeaderBoardTipsPanel;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICALEADERBOARD_NAME;
        this.loadAtlas = [UIAtlasName.uicommon, UIAtlasName.uicommon1, UIAtlasName.illustrate, UIAtlasName.illustrate_new, UIAtlasName.leader_board];
        this.tempDatas = {};
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        this.mBackground.x = w * 0.5;
        this.mBackground.y = h * 0.5;
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        super.resize(w, h);
        this.setSize(w, h);
    }

    public destroy() {
        super.destroy();
        if (this.listPanel) this.listPanel.destroy();
        if (this.detailPanel) this.detailPanel.destroy();
    }
    private get serviceTimestamp(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.render.mainPeer.requestCurTime().then((t) => {
                resolve(t);
            });
        });
    }
    public setDetailPanel(myRankingData, rankdatas, avatars) {
        this.detailPanel.setMyRanking(myRankingData, avatars);
        this.detailPanel.createRankListCells(rankdatas, avatars);
        this.detailPanel.refreshMask();
    }

    init() {
        const width = this.scaleWidth, height = this.scaleHeight;
        this.mBackground = new CommonBackground(this.scene, 0, 0, width, height);
        this.add(this.mBackground);
        const conWdith = 295 * this.dpr;
        const conHeight = 405 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add([this.content]);
        this.resize();
        super.init();
    }

    onShow(param?) {
        this.openListPanel();
        if (this.showData) {
            this.autoOpenDetailPanel();
        }
    }
    setRedsState(obj: any) {
        this.redObj = obj;
        if (!this.mInitialized) return;
        if (this.listPanel) this.listPanel.setRedsState(this.redObj["redlist"]);
    }
    private autoOpenDetailPanel() {
        const param = this.showData;
        if (param) {
            const id = param.text[0].text;
            const title = param.text[1].text;
            this.hideListPanel();
            this.openDetailPanel();
            this.detailPanel.setTitle(title, "close");
            this.render.renderEmitter(this.key + "_getranklistdata", id);
        }
    }
    private openListPanel() {
        this.showListPanel();
        this.listPanel.setListData();
        if (this.redObj) this.listPanel.setRedsState(this.redObj["redlist"]);
    }

    private showListPanel() {
        if (!this.listPanel) {
            this.listPanel = new PicaLeaderBoardListPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.listPanel.setHandler(new Handler(this, this.onListHandler));
            this.content.add(this.listPanel);
        }
        this.listPanel.visible = true;
    }
    private hideListPanel() {
        this.listPanel.visible = false;
    }

    private openDetailPanel() {
        this.showDetailPanel();
    }
    private showDetailPanel() {
        if (!this.detailPanel) {
            this.detailPanel = new PicaLeaderBoardDetailPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.detailPanel.setHandler(new Handler(this, this.onDetailHandler));
            this.content.add(this.detailPanel);
        }
        this.detailPanel.resize(this.scaleWidth, this.scaleHeight);
        this.detailPanel.visible = true;
    }
    private hideDetailPanel() {
        this.detailPanel.visible = false;
    }
    private openTipsPanel() {
        this.showTipsPanel();
    }
    private showTipsPanel() {
        if (!this.tipsPanel) {
            this.tipsPanel = new PicaLeaderBoardTipsPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.tipsPanel.setHandler(new Handler(this, this.onTipsHandler));
            this.content.add(this.tipsPanel);
        }
        this.tipsPanel.resize(this.scaleWidth, this.scaleHeight);
        this.tipsPanel.visible = true;
    }
    private hideTipsPanel() {
        this.tipsPanel.visible = false;
    }

    private onListHandler(tag: string, data?: any) {
        if (tag === "cook" || tag === "fuben" || tag === "guanqia" || tag === "activity") {
            this.hideListPanel();
            this.openDetailPanel();
            this.detailPanel.setTitle(i18n.t("leaderboard." + tag), "back");
            this.render.renderEmitter(this.key + "_getranklistdata", tag);
        } else if (tag === "back") {
            this.render.renderEmitter(this.key + "_close", tag);
        }
    }
    private onTipsHandler(tag: string) {
        if (tag === "close") {
            this.hideTipsPanel();
        }
    }
    private onDetailHandler(tag: string, data: any) {
        if (tag === "back") {
            this.hideDetailPanel();
            this.showListPanel();
        } else if (tag === "showTips") {
            this.openTipsPanel();
        } else if (tag === "close") {
            this.onCloseHandler();
        }
    }
    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_close");
    }
}
