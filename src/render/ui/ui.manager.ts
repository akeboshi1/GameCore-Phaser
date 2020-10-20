import { ILauncherConfig } from "../../structureinterface/lanucher.config";
import { Logger } from "../../utils/log";
import { Render } from "../render";
import { BasePanel } from "./components/base.panel";

export class UiManager {
    private mScene: Phaser.Scene;
    private mPanelMap: Map<string, BasePanel>;
    private mCache: any[] = [];
    private mCacheUI: Function;
    constructor(private mRender: Render) {
    }

    public setScene(scene: Phaser.Scene) {
        this.mScene = scene;
        if (scene && this.mCacheUI) {
            this.mCacheUI();
            this.mCacheUI = undefined;
        }
    }

    public resize(width: number, height: number) {
        if (this.mPanelMap) {
            this.mPanelMap.forEach((panel: BasePanel) => {
                if (panel.isShow) panel.resize();
            });
        }
    }

    public setPanel(value: string, panel: BasePanel) {
        this.mPanelMap.set(value, panel);
    }

    public getPanel(type: string): BasePanel | undefined {
        if (!this.mPanelMap) return;
        return this.mPanelMap.get(type);
    }

    public clearPanel() {
        if (!this.mPanelMap) {
            return;
        }
        this.mPanelMap.forEach((med: BasePanel) => med.destroy());
        this.mPanelMap.clear();
        this.mPanelMap = null;
    }

    public destroy() {
        this.clearPanel();
        this.mPanelMap = undefined;
        this.clearCache();
        this.mScene = undefined;
    }

    public showPanel(type: string, ...param: any[]) {
        if (!this.mScene) {
            this.render.sceneManager.launchScene("MainUIScene");
            this.mCache.push(param);
            this.mCacheUI = this.showPanel;
            return;
        }
        if (!this.mPanelMap) {
            this.mPanelMap = new Map();
        }
        // type = this.getPanelNameByAlias(type);
        const className: string = type + "Panel";
        let panel: BasePanel = this.mPanelMap.get(className);
        if (!panel) {
            // const path: string = `./${type}/${type}Panel`;
            const ns: any = require(`./${type}/${className}`);
            panel = new ns[className](this);
            if (!panel) {
                Logger.getInstance().error(`error ${type} no panel can show!!!`);
                return;
            }
            this.mPanelMap.set(type + "Panel", panel);
        //     // mediator.setName(type);
        }
        // // if (mediator.showing) return;
        // if (param) mediator.setParam(param);
        panel.show(param);
    }

    public hidePanel(type: string) {
        if (!this.mPanelMap) {
            return;
        }
        // type = this.getPanelNameByAlias(type);
        const medName: string = `${type}Mediator`;
        const panel: BasePanel = this.mPanelMap.get(medName);
        if (!panel) {
            Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        panel.hide();
    }

    get scene(): Phaser.Scene {
        return this.mScene;
    }

    get render(): Render {
        return this.mRender;
    }

    private clearCache() {
        this.mCacheUI = undefined;
        this.mCache = [];
    }
}
