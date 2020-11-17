import { Logger, ValueResolver } from "utils";
import { Render } from "../render";
import { BasePanel } from "./components/base.panel";
import { BasicScene } from "../scenes/basic.scene";

export class UiManager {
    protected mScene: BasicScene;
    protected mPanelMap: Map<string, BasePanel>;// key: "<ModelName>Panel"
    /**
     * 前端触发显示ui缓存列表
     */
    protected mCache: any[] = [];
    protected mRemoteCache: Map<string, { resolver: ValueResolver<BasePanel>, param?: any }> = new Map();
    private readonly mPanelClass = {
        "BaseMediator": BasePanel,
        // "LoginMediator": LoginPanel,
        // "Activity": ActivityPanel,
        // "Dialog": DialogPanel,
    };

    constructor(protected mRender: Render) {
    }

    public setScene(scene: BasicScene) {
        this.mScene = scene;
        if (scene) {
            if (this.mCache) {
                for (const tmp of this.mCache) {
                    this.showPanel(tmp.name, tmp.param);
                }
                this.mCache.length = 0;
            }

            if (this.mRemoteCache.size > 0) {
                this.mRemoteCache.forEach((value, key) => {
                    value.resolver.resolve(this._showPanel(key, value.param));
                });
            }
            this.mRemoteCache.clear();
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

    public showPanel(type: string, param?: any): Promise<BasePanel> {
        const scene = this.render.sceneManager.currentScene;
        if (this.mScene) {
            return new Promise<BasePanel>((resolve, reject) => {
                resolve(this._showPanel(type, param));
            });
        } else if (scene) {
            return new Promise<BasePanel>((resolve, reject) => {
                this.render.emitter.once("sceneCreated", () => {
                    if (this.mCache) {
                        for (const tmp of this.mCache) {
                            resolve(this._showPanel(tmp.name, tmp.param));
                        }
                        this.mCache.length = 0;
                    }
                }, this);
            });
        } else {
            const remoteCache = new ValueResolver<BasePanel>();
            this.mRemoteCache.set(type, { resolver: remoteCache, param });

            return remoteCache.promise(() => {
                //
            });
        }
    }

    public hidePanel(type: string) {
        if (!this.mPanelMap) {
            return;
        }
        // type = this.getPanelNameByAlias(type);
        const medName: string = `${type}Panel`;
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

    protected getPanelClass(type: string): any {
        const className = type + "Panel";
        return require(`./${type}/${className}`);
    }

    get scene(): BasicScene {
        return this.mScene;
    }

    get render(): Render {
        return this.mRender;
    }

    protected clearCache() {
        this.mCache = [];
    }

    protected _showPanel(type: string, param?: any): BasePanel {
        if (!this.mPanelMap) {
            this.mPanelMap = new Map();
        }
        const className: string = type + "Panel";
        const ns: any = require(`./${type}/${className}`);
        const panel = new ns[className](this);
        if (!panel) {
            Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        this.mPanelMap.set(type + "Panel", panel);
        panel.show(param);
        return panel;
    }
}
