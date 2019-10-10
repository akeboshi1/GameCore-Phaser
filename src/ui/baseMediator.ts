import { IAbstractPanel } from "./abstractPanel";
import { WorldService } from "../game/world.service";

export interface IMediator {
    readonly world: WorldService;
    isSceneUI(): boolean;
    isShow(): boolean;
    resize();
    getView(): IAbstractPanel;
    show(param?: any): void;
    update(param?: any): void;
    hide(): void;
}

export class BaseMediator implements IMediator {
    readonly world: WorldService;

    constructor(world?: WorldService) {
        this.world = world;
    }

    getView(): IAbstractPanel {
        return undefined;
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
        if (view) view.resize();
    }

    show(param?: any): void {
        const view = this.getView();
        if (view) view.show(param);
    }

    update(param?: any): void {
        const view = this.getView();
        if (view) view.update(param);
    }

}
