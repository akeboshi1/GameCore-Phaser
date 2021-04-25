import { EventDispatcher } from "structure";
import { Game } from "../game";
export declare class BaseHandler {
    protected game: Game;
    protected mEvent: EventDispatcher;
    constructor(game: Game, event: EventDispatcher);
    clear(): void;
    destroy(): void;
    on(event: string, fn: Function, context?: any): void;
    off(event: string, fn: Function, context?: any): void;
    emit(event: string, data?: any): void;
    get Event(): EventDispatcher;
}
