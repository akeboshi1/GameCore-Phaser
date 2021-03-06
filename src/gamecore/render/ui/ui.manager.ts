import { Logger, ValueResolver, SceneName } from "structure";
import { Render } from "../render";
import { BasePanel } from "./components/base.panel";
import { BasicScene } from "baseRender";
import { AlertView, Buttons } from "./components";
import { Panel } from "apowophaserui";
export class UiManager {
    protected mScene: BasicScene;
    protected mPanelMap: Map<string, BasePanel>;// key: "<ModelName>Panel"
    protected mBatchPanelList: Panel[] = [];
    /**
     * 前端触发显示ui缓存列表
     */
    protected mCache: any[] = [];
    protected mRemoteCache: Map<string, { resolver: ValueResolver<BasePanel>, param?: any }> = new Map();
    protected alertViewCache: any[] = [];
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
            if (this.alertViewCache) {
                this.alertViewCache.forEach((data) => {
                    this.showAlertView(data.text, data.ok, data.cancel, data.callBack);
                });
                this.alertViewCache.length = 0;
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
                if (panel.isShow()) panel.resize();
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
        this.mBatchPanelList.forEach((panel) => {
            panel.hide();
        });
        this.mPanelMap.forEach((med: BasePanel) => {
            med.destroy();
        });
        this.mBatchPanelList = [];
        this.mPanelMap.clear();
        this.mPanelMap = null;
    }

    public showErrorMsg(msg: string) {
        if (!this.mScene || this.mScene.scene.key !== SceneName.LOADING_SCENE) {
            return;
        }
        let str: string = msg;
        if (msg.length > 100) str = msg.slice(0, 99);
        (<any>this.mScene).showErrorMsg(str);
    }

    public showAlertView(text: string, ok: boolean, cancel: boolean = false, callBack?: Function) {
        if (!this.mScene || this.mScene.sceneDestroy() || !this.mScene.sceneInitialize() || this.mScene.sceneChange) {
            this.alertViewCache.push({ text, ok, cancel, callBack });
            return;
        }
        // let scene = this.mRender.game.scene.getScene(SceneName.MAINUI_SCENE);
        // const loadScene = this.mRender.game.scene.getScene(SceneName.LOADING_SCENE);
        // if (loadScene && loadScene.scene.isActive()) scene = loadScene;
        const alert = new AlertView(this.mScene, this);
        alert.show({
            text,
            callback: () => {
                if (callBack) callBack();
            },
            btns: Buttons.Ok
        });
        this.mBatchPanelList.push(alert);
    }

    public showTipsAlert(data) {
        // this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, data);
    }

    /**
     * 创建批量显示面板
     * @param type
     * @param param
     */
    public showBatchPanel(type: string, param?: any): BasePanel {
        if (!this.mScene) {
            return;
        }
        if (!this.mPanelMap) {
            this.mPanelMap = new Map();
        }
        const className: string = type + "Panel";
        const ns: any = require(`./${type}/${className}`);
        const panel = new ns[className](this);
        this.mBatchPanelList.push(panel);
        panel.show(param);
        return panel;
    }

    public clear() {
        this.clearPanel();
        this.clearCache();
    }

    public destroy() {
        this.clear();
        this.mRender = null;
        this.mScene = undefined;
    }

    public showPanel(type: string, param?: any): Promise<BasePanel> {
        if (this.mScene) {
            return new Promise<BasePanel>((resolve, reject) => {
                resolve(this._showPanel(type, param));
            });
        } else {
            this.mScene = this.render.game.scene.getScene(SceneName.MAINUI_SCENE) as BasicScene;
            if (!this.mScene) {
                const remoteCache = new ValueResolver<BasePanel>();
                this.mRemoteCache.set(type, { resolver: remoteCache, param });
                return remoteCache.promise(() => {
                });
            } else {
                return new Promise<BasePanel>((resolve, reject) => {
                    resolve(this._showPanel(type, param));
                });
            }
        }
    }

    public hidePanel(type: string) {
        const panel = this.hideBasePanel(type);
        if (panel) {
            panel.hide(true);
        }
    }

    /**
     * 客户端发起关闭界面
     * @param type
     */
    public hideBasePanel(type: string): BasePanel {
        if (!this.mPanelMap) {
            return;
        }
        const panel: BasePanel = this.mPanelMap.get(type);
        if (!panel) {
            Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        this.mPanelMap.delete(type);
        return panel;
    }

    /**
     * 关闭批量界面，因为批量界面class一致，无法通过服务器告知关闭，所以由客户端控制开关（由panel的hide发起方法调用）
     * @param panel
     */
    public hideBatchPanel(panel: Panel) {
        const len = this.mBatchPanelList.length;
        for (let i = 0; i < len; i++) {
            const tmpPanel = this.mBatchPanelList[i];
            if (tmpPanel === panel) {
                this.mBatchPanelList.splice(i, 1);
                return;
            }
        }
    }

    public closePanel(id: number) {
        if (this.render.mainPeer) this.render.mainPeer.closePanelHandler(id);
    }

    public updateUIState(type: string, ui: any) {
        if (!this.mPanelMap) {
            return;
        }
        const panel = this.mPanelMap.get(type);
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
        let panel = this.mPanelMap.get(type);
        if (!panel) {
            panel = new ns[className](this);
            this.mPanelMap.set(type, panel);
        }
        panel.show(param);
        return panel;
    }
}
