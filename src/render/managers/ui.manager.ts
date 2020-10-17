import { ILayerManager, LayerManager } from "./layer.manager";
import { ILauncherConfig } from "../../structureinterface/lanucher.config";
import { Render } from "../render";
import { BasePanel } from "../ui/components/base.panel";

export class UiManager {
    private mScene: Phaser.Scene;
    private mPanelMap: Map<string, BasePanel>;
    private mUILayerManager: ILayerManager;
    private mCache: any[] = [];
    private mCacheUI: Function;
    private mConfig: ILauncherConfig;
    constructor(private render: Render) {
        this.mConfig = render.config;
        this.mUILayerManager = new LayerManager();
    }

    public getUILayerManager(): ILayerManager {
        return this.mUILayerManager;
    }

    public setScene(scene: Phaser.Scene) {
        this.mScene = scene;
        this.mUILayerManager.setScene(scene);
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
        // if (!this.mScene) {
        //     this.mCache.push(param);
        //     return;
        // }
        // if (!this.mPanelMap) {
        //     this.mPanelMap = new Map();
        // }
        // type = this.getPanelNameByAlias(type);
        // const className: string = type + "Mediator";
        // let mediator: BasePanel = this.mPanelMap.get(className);
        // if (!mediator) {
        //     const path: string = `./${type}/${type}Mediator`;
        //     const ns: any = require(`./${type}/${className}`);
        //     mediator = new ns[className](this.mUILayerManager, this.mScene, this.render);
        //     if (!mediator) {
        //         // Logger.getInstance().error(`error ${type} no panel can show!!!`);
        //         return;
        //     }
        //     this.mPanelMap.set(type + "Mediator", mediator);
        //     // mediator.setName(type);
        // }
        // // if (mediator.showing) return;
        // if (param) mediator.setParam(param);
        // mediator.show(param);
    }
    public hidePanel(type: string) {
        if (!this.mPanelMap) {
            return;
        }
        // type = this.getPanelNameByAlias(type);
        // const medName: string = `${type}Mediator`;
        // const mediator: BasePanel = this.mPanelMap.get(medName);
        // if (!mediator) {
        //     // Logger.getInstance().error(`error ${type} no panel can show!!!`);
        //     return;
        // }
        // mediator.hide();
    }
    // public showExistMed(type: string, extendName = "Mediator") {
    //     if (!this.mPanelMap) {
    //         return;
    //     }
    //     type = this.getPanelNameByAlias(type);
    //     const className: string = type + extendName;
    //     const mediator: BasePanel = this.mPanelMap.get(className);
    //     if (mediator) mediator.show();
    // }

    private clearCache() {
        this.mCacheUI = undefined;
        this.mCache = [];
    }
}
