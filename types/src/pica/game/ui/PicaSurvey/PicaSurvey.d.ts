import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaSurvey extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    private onSurveySuccessHandler;
    get connection(): ConnectionService;
}
