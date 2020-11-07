import { Game } from "../../game";
import { BasicModel } from "./basic.model";

export interface IMediator {
    UIType: number;
    isShow(): boolean;
    tweenExpand(show: boolean);
    resize(wid, hei);
    createView(className: string);
    show(param?: any): void;
    update(param?: any): void;
    hide(): void;
    updateViewPos();
    destroy();
    isSceneUI(): boolean;
    setParam(param): void;
    getParam(): any;
}

export enum UIType {
    None, // 默认ui类型
    Scene, // 场景内常驻ui
    Normal, // 普通功能ui
    Pop, // 弹出型ui
    Tips, // tips型ui
    Monopoly, // 独占型ui
    Activity, // 热发布活动类型ui，便于单独刷新活动ui
}

export class BasicMediator implements IMediator {
    /**
     * 面板处于打开状态
     */
    protected mShow: boolean = false;
    protected mPanelInit: boolean = false;
    protected mParam: any;
    protected mUIType: number;
    protected mModel: BasicModel;
    protected mShowData: any;
    constructor(protected game: Game) {
    }

    public get UIType(): number {
        return this.mUIType;
    }

    createView(className: string) {
    }

    updateViewPos() {
    }

    tweenExpand(show: boolean) {
    }

    hide(): void {
        this.mShow = false;
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return this.mShow;
    }

    resize(width?: number, height?: number) {
    }

    show(param?: any): void {
        this.mShow = true;
        if (param) this.mShowData = param;
        if (!this.mPanelInit) {
            return;
        }
    }

    update(param?: any): void {
        if (param) this.mShowData = param;
    }

    setParam(param: any) {
        this.mParam = param;
        if (param) this.mShowData = param;
    }

    getParam(): any {
        return this.mParam;
    }

    destroy() {
        this.mShow = false;
        this.mPanelInit = false;
        this.mShowData = null;
        this.mParam = null;
        if (this.mModel) this.mModel.destroy();
        if (this.game && this.game.peer && this.game.peer.hasOwnProperty(this.constructor.name)) delete this.game.peer[this.constructor.name];
    }

    protected onPanelInitCallBack() {
        this.mPanelInit = true;
    }

    protected __exportProperty(callback?: () => any) {
        if (!this.game || !this.game.peer) {
            return;
        }
        return this.game.peer.exportProperty(this, this.game.peer, this.constructor.name).onceReady(callback);
    }
}
