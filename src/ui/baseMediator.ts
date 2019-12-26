import { IAbstractPanel } from "./abstractPanel";
import { WorldService } from "../game/world.service";
import { Panel } from "./components/panel";
import { World } from "../game/world";
import { UIType } from "./ui.manager";

export interface IMediator {
    readonly world: WorldService;
    setUiScale(val: number);
    isSceneUI(): boolean;
    isShow(): boolean;
    showing(): boolean;
    tweenView(show: boolean);
    resize();
    getView(): IAbstractPanel;
    getUIType(): number;
    show(param?: any): void;
    update(param?: any): void;
    setParam(param): void;
    getParam(): any;
    hide(): void;
    destroy();
}

export class BaseMediator implements IMediator {
    readonly world: WorldService;
    protected mView: Panel;
    protected isShowing: boolean = false;
    protected mParam: any;
    protected mUIType: number;
    constructor(world?: WorldService) {
        this.world = world;
        this.mUIType = UIType.NoneUIType;
        this.world.emitter.on(World.SCALE_CHANGE, this.scaleChange, this);
    }

    tweenView(show: boolean) {
    }

    setUiScale(value: number) {
        this.mView.scaleX = this.mView.scaleY = value;
    }

    getView(): IAbstractPanel {
        return this.mView;
    }

    getUIType(): number {
        return this.mUIType;
    }

    hide(): void {
        this.isShowing = false;
        const view = this.getView();
        if (view) view.hide();
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    showing(): boolean {
        return this.isShowing;
    }

    resize() {
        const view = this.getView();
        if (view && view.isShow()) view.resize();
    }

    show(param?: any): void {
        this.isShowing = true;
        this.setUiScale(this.world.uiScale);
    }

    update(param?: any): void {
        const view = this.getView();
        if (view) view.update(param);
    }

    setParam(param: any) {
        this.mParam = param;
    }

    getParam(): any {
        return this.mParam;
    }

    destroy() {
        this.isShowing = false;
        this.mParam = null;
        if (this.world && this.world.emitter) this.world.emitter.off(World.SCALE_CHANGE, this.scaleChange, this);
        let view = this.getView();
        if (view) {
            view.destroy();
            view = null;
        }
    }

    protected scaleChange() {
        this.setUiScale(this.world.uiScale);
    }
}
