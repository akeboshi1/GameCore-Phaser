import { Game } from "../../game";
import { BasicModel } from "./basic.model";
export interface IMediator {
    UIType: number;
    isShow(): boolean;
    tweenExpand(show: boolean): any;
    resize(wid: any, hei: any): any;
    createView(className: string): any;
    show(param?: any): void;
    update(param?: any): void;
    hide(): void;
    updateViewPos(): any;
    destroy(): any;
    isSceneUI(): boolean;
    setParam(param: any): void;
    getParam(): any;
}
export declare enum UIType {
    None = 0,
    Scene = 1,
    Normal = 2,
    Pop = 3,
    Tips = 4,
    Monopoly = 5,
    Activity = 6
}
export declare class BasicMediator implements IMediator {
    key: string;
    protected game: Game;
    /**
     * 面板处于打开状态
     */
    protected mShow: boolean;
    protected mPanelInit: boolean;
    protected mHasHide: boolean;
    protected mParam: any;
    protected mUIType: number;
    protected mModel: BasicModel;
    protected mShowData: any;
    protected mView: any;
    constructor(key: string, game: Game);
    get UIType(): number;
    createView(className: string): void;
    updateViewPos(): void;
    tweenExpand(show: boolean): void;
    hide(): void;
    isSceneUI(): boolean;
    isShow(): boolean;
    resize(width?: number, height?: number): void;
    show(param?: any): void;
    update(param?: any): void;
    setParam(param: any): void;
    getParam(): any;
    destroy(): void;
    protected _show(): void;
    protected panelInit(): void;
    protected mediatorExport(): void;
    protected __exportProperty(callback?: () => any): any;
}
