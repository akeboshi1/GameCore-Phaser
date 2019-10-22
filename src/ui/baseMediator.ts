import { IAbstractPanel } from "./abstractPanel";
import { WorldService } from "../game/world.service";
import { Panel } from "./components/panel";

export interface IMediator {
    readonly world: WorldService;
    setUiScale(val: number);
    isSceneUI(): boolean;
    isShow(): boolean;
    resize();
    getView(): IAbstractPanel;
    show(param?: any): void;
    update(param?: any): void;
    hide(): void;
    destroy();
}

export class BaseMediator implements IMediator {
    readonly world: WorldService;
    protected mView: Panel;
    constructor(world?: WorldService) {
        this.world = world;
    }

    setUiScale(value: number) {
        this.mView.scaleX = this.mView.scaleY = value;
    }

    getView(): IAbstractPanel {
        return this.mView;
    }

    hide(): void {
        const view = this.getView();
        if (view) view.hide();
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
        const view = this.getView();
        if (view && view.isShow()) view.resize();
    }

    show(param?: any): void {
        this.setUiScale(this.world.uiScale);
    }

    update(param?: any): void {
        const view = this.getView();
        if (view) view.update(param);
    }

    destroy() {
        let view = this.getView();
        if (view) {
            view.destroy();
            view = null;
        }
    }
}
