import { Logger } from "utils";
import { Render } from "../render";
import { BasePanel } from "./components/base.panel";
import { BasicScene } from "../scenes/basic.scene";
import { LoginPanel } from "./Login/LoginPanel";

export class UiManager {
    private mScene: BasicScene;
    private mPanelMap: Map<string, BasePanel>;
    private mCache: any[] = [];
    private mCacheUI: Function;
    private readonly mPanelClass = {
        "BaseMediator": BasePanel,
        "LoginMediator": LoginPanel,
        // "Activity": ActivityPanel,
        // "Dialog": DialogPanel,
    };

    constructor(private mRender: Render) {
    }

    public setScene(scene: BasicScene) {
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

    public createPanel(mediatorName: string) {
        if (!this.mPanelClass.hasOwnProperty(mediatorName)) {
            Logger.getInstance().error("mediatorName error: ", mediatorName);
            return;
        }

        const panel = new this.mPanelClass[mediatorName](this.mScene, this.mRender);
        this.setPanel(mediatorName, panel);
        return panel;
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

    public showPanel(type: string, param?: any) {
        if (!this.mScene) {
            const scene = this.render.sceneManager.currentScene;
            if (!scene) return;
            scene.scene.launch("MainUIScene");
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
        return panel;
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

    public updateUIState(panelName: string, ui: any) {
        const panel = this.mPanelMap.get(panelName);
        if (panel) {
            panel.updateUIState(ui);
        }
    }

    get scene(): BasicScene {
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
