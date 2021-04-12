import { IRoomService } from "..";
import { IElement } from "../element/element";
import { BaseStateManager } from "./state.manager";
export declare class ElementStateManager extends BaseStateManager {
    private element;
    constructor(element: IElement, room: IRoomService);
    execAllState(): void;
    protected init(): void;
}
