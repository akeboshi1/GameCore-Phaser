import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaRename extends BasicModel {
    private mEvent;
    constructor(game: Game);
    register(): void;
    unregister(): void;
    get connection(): ConnectionService;
    on(type: string, listener: Function, context?: any): void;
    once(type: string, listener: Function, context?: any): void;
    off(type: string, listener: Function): void;
    onRandomNameHandler(): void;
    onSubmitHandler(name: string): void;
    private onCreateErrorHandler;
    private onGenerateNameHandler;
}
