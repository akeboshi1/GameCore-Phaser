import { IAbstractPanel } from "./abstractPanel";
import { WorldService } from "../game/world.service";

export interface IMediator {
    readonly world: WorldService;
    getView(): IAbstractPanel;
    setView(val: IAbstractPanel): void;
    showUI(param: any): void;
    update(param: any): void;
    hideUI(): void;
}
