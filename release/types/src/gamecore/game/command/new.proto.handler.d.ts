import { Game } from "../game";
export declare class NewProtoHandler {
    protected game: Game;
    constructor(game: Game);
    clear(): void;
    destroy(): void;
    emit(event: string, data?: any): void;
    protected addPackListener(): void;
    protected removePackListener(): void;
    protected onAddListener(): void;
    protected onRemoveListener(): void;
    get emitter(): import("../../..").EventDispatcher;
    get proto(): any;
}
