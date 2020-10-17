import { op_client, op_pkt_def } from "pixelpai_proto";
import { BaseMediator, UIType } from "apowophaserui";
import { UIMediatorType } from "../../game/ui/ui.mediator.type";
import { ILayerManager, LayerManager } from "./layer.manager";
import { ILauncherConfig } from "../../structureinterface/lanucher.config";
import { Render } from "../render";

export class UiManager {
    private mScene: Phaser.Scene;
    private mMedMap: Map<UIMediatorType, BaseMediator>;
    private mUILayerManager: ILayerManager;
    private mCache: any[] = [];
    private mCacheUI: Function;
    private mAtiveUIData: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI;
    private mConfig: ILauncherConfig;
    constructor(private render: Render) {
        this.mConfig = render.config;
        this.mUILayerManager = new LayerManager();
    }

    public getUILayerManager(): ILayerManager {
        return this.mUILayerManager;
    }

    public getActiveUIData(name: string): op_pkt_def.IPKT_UI[] {
        if (!this.mAtiveUIData) return null;
        const arr: op_pkt_def.IPKT_UI[] = [];
        for (const data of this.mAtiveUIData.ui) {
            const tagName = data.name.split(".")[0];
            const paneName = this.getPanelNameByStateTag(tagName);
            if (paneName === name) {
                arr.push(data);
            }
        }
        return arr;
    }

    public setScene(scene: Phaser.Scene) {
        this.mScene = scene;
        this.mUILayerManager.setScene(scene);
        if (scene && this.mCacheUI) {
            this.mCacheUI();
            this.mCacheUI = undefined;
        }
    }

    public showMainUI() {
        if (!this.mScene) {
            this.mCacheUI = this.showMainUI;
            return;
        }
        const scene = this.mScene;
        this.clearMediator();
        if (!this.mMedMap) {
            this.mMedMap = new Map();
            // ============场景中固定显示ui
            if (this.mConfig.platform === "pc") {
            } else {
            }
        }
        // TOOD 通过统一的方法创建打开
        this.mMedMap.forEach((mediator: any, key: string) => {
            const map: Map<string, any> = new Map();
            const deskBoo: boolean = this.mConfig.platform && this.mConfig.platform === "pc" ? true : false;
            if (map) map.set(key, mediator);
            if (mediator.isSceneUI()) {
                mediator.show();
            }
        });
        if (this.mAtiveUIData) {
            this.updateUIState(this.mAtiveUIData);
        }
        if (this.mCache) {
            for (const tmp of this.mCache) {
                const ui = tmp[0];
                this.showMed(ui.name, ui);
            }
            this.mCache.length = 0;
        }
    }

    public resize(width: number, height: number) {
        if (this.mMedMap) {
            this.mMedMap.forEach((mediator: BaseMediator) => {
                if (mediator.isShow) mediator.resize();
            });
        }
    }

    public setMediator(value: string, mediator: BaseMediator) {
        this.mMedMap.set(value, mediator);
    }

    public getMediator(type: string): BaseMediator | undefined {
        if (!this.mMedMap) return;
        return this.mMedMap.get(type);
    }

    public clearMediator() {
        if (!this.mMedMap) {
            return;
        }
        this.mMedMap.forEach((med: BaseMediator) => med.destroy());
        this.mMedMap.clear();
        this.mMedMap = null;
    }

    public destroy() {
        this.clearMediator();
        this.mMedMap = undefined;
        this.clearCache();
        this.mScene = undefined;
    }

    public showMed(type: string, ...param: any[]) {
        if (!this.mScene) {
            this.mCache.push(param);
            return;
        }
        if (!this.mMedMap) {
            this.mMedMap = new Map();
        }
        type = this.getPanelNameByAlias(type);
        const className: string = type + "Mediator";
        let mediator: BaseMediator = this.mMedMap.get(className);
        if (!mediator) {
            const path: string = `./${type}/${type}Mediator`;
            const ns: any = require(`./${type}/${className}`);
            mediator = new ns[className](this.mUILayerManager, this.mScene, this.render);
            if (!mediator) {
                // Logger.getInstance().error(`error ${type} no panel can show!!!`);
                return;
            }
            this.mMedMap.set(type + "Mediator", mediator);
            // mediator.setName(type);
        }
        // if (mediator.showing) return;
        if (param) mediator.setParam(param);
        mediator.show(param);
    }
    public hideMed(type: string) {
        if (!this.mMedMap) {
            return;
        }
        type = this.getPanelNameByAlias(type);
        const medName: string = `${type}Mediator`;
        const mediator: BaseMediator = this.mMedMap.get(medName);
        if (!mediator) {
            // Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        mediator.hide();
    }
    public showExistMed(type: string, extendName = "Mediator") {
        if (!this.mMedMap) {
            return;
        }
        type = this.getPanelNameByAlias(type);
        const className: string = type + extendName;
        const mediator: BaseMediator = this.mMedMap.get(className);
        if (mediator) mediator.show();
    }

    private clearCache() {
        this.mCacheUI = undefined;
        this.mCache = [];
    }

    private updateUIState(data: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI) {
        for (const ui of data.ui) {
            const tag = ui.name;
            const paneltags = tag.split(".");
            const panelName = this.getPanelNameByStateTag(paneltags[0]);
            if (panelName) {
                const mediator: BaseMediator = this.mMedMap.get(panelName + "Mediator");
                if (mediator) {
                    if (paneltags.length === 1) {
                        if (ui.visible || ui.visible === undefined) {
                            this.showMed(panelName);
                        } else {
                            this.hideMed(panelName);
                        }
                    } else {
                        const view = mediator.getView();
                        if (view)
                            view.updateUIState(ui);
                    }
                }
            }
        }
    }

    private getPanelNameByStateTag(tag: string) {
        switch (tag) {
            case "mainui":
                return "PicaMainUI";
            case "activity":
                return "Activity";
            case "picachat":
                return "PicaChat";
            case "picanavigate":
                return "PicaNavigate";
            case "PicHandheld":
                return "PicHandheld";
        }
        return tag;
    }
    private getPanelNameByAlias(alias: string) {
        switch (alias) {
            case "MessageBox":
                return "PicaMessageBox";
        }
        return alias;
    }
}
