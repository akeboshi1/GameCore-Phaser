import { IAbstractPanel } from "./abstractPanel";
import { WorldService } from "../game/world.service";
import { Panel } from "./components/panel";
import { World } from "../game/world";

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
        this.world.emitter.on(World.SCALE_CHANGE, this.scaleChange, this);
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
        this.world.emitter.off(World.SCALE_CHANGE, this.scaleChange, this);
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
