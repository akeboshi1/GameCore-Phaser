import { BasePanel, UiManager } from "gamecoreRender";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { ModuleName, RENDER_PEER } from "structure";
import { Handler } from "utils";
import { PicTreasureOpenPanel } from "./PicaTreasureOpenPanel";
import { PicaTreasurePreviewPanel } from "./PicaTreasurePreviewPanel";
export class PicaTreasurePanel extends BasePanel {
    private blackGraphic: Phaser.GameObjects.Graphics;
    private previewPanel: PicaTreasurePreviewPanel;
    private treasureOpenPanel: PicTreasureOpenPanel;
    private content: Phaser.GameObjects.Container;
    constructor(private uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICATREASURE_NAME;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        super.resize(width, height);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0, 0.88);
        this.blackGraphic.fillRect(0, 0, width, height);
        this.content.x = width / 2;
        this.content.y = height / 2;
        this.setSize(width * this.scale, height * this.scale);
    }

    show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.setInteractive();
        this.addListen();
        this.updateData();
    }

    preload() {
        this.addAtlas(this.key, "treasure/treasure.png", "treasure/treasure.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.textureUrl(UIAtlasName.commonUrl), UIAtlasName.jsonUrl(UIAtlasName.commonUrl));
        this.addAtlas(UIAtlasKey.common3Key, UIAtlasName.textureUrl(UIAtlasName.common3Url), UIAtlasName.jsonUrl(UIAtlasName.common3Url));
        super.preload();
    }

    init() {
        const width = this.cameraWidth;
        const height = this.cameraHeight;
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.blackGraphic.setInteractive(new Phaser.Geom.Rectangle(0, 0, width / this.scale, height / this.scale), Phaser.Geom.Rectangle.Contains);
        this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        this.add(this.content);
        this.resize(0, 0);
        super.init();
        this.setPreviewData();
    }

    updateData() {
    }

    setPreviewData() {
        this.openPreviewPanel();
        this.previewPanel.setTreasureData();
    }
    setTreasureOpenData() {
        this.openTreasureOpenPanel();
        this.treasureOpenPanel.setTreasureData();
    }
    openPreviewPanel() {
        const wid = 334 * this.dpr;
        const hei = 353 * this.dpr;
        if (!this.previewPanel) {
            this.previewPanel = new PicaTreasurePreviewPanel(this.scene, this.render, wid, hei, this.key, this.dpr, this.scale);
            this.previewPanel.setHandler(new Handler(this, () => {
                this.hidePreviewPanel();
                this.setTreasureOpenData();
            }), new Handler(this, this.OnCloseHandler));
        }
        this.content.add(this.previewPanel);
        this.previewPanel.resize(wid, hei);
        this.previewPanel.addListen();
    }

    hidePreviewPanel() {
        this.content.remove(this.previewPanel);
        this.previewPanel.removeListen();
    }

    openTreasureOpenPanel() {
        const wid = 295 * this.dpr;
        const hei = 301 * this.dpr;
        if (!this.treasureOpenPanel) {
            this.treasureOpenPanel = new PicTreasureOpenPanel(this.scene, wid, hei, this.key, this.dpr, this.scale);
            this.treasureOpenPanel.setHandler(new Handler(this, this.OnCloseHandler));
        }
        this.content.add(this.treasureOpenPanel);
        this.treasureOpenPanel.resize(wid, hei);
        this.treasureOpenPanel.addListen();
    }

    hideOpenPanel() {
        this.content.remove(this.treasureOpenPanel);
        this.treasureOpenPanel.removeListen();
    }
    private OnCloseHandler() {
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_close");
    }
}
