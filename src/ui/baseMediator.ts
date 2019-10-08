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
