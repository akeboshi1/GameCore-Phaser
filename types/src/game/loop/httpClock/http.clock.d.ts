import { Game } from "../../game";
/**
 * 每5min发送一次心跳包
 */
export declare class HttpClock {
    private game;
    private readonly interval;
    private mTimestamp;
    private httpService;
    private mEnable;
    private mGameId;
    constructor(game: Game);
    update(time: number, delta: number): void;
    allowLogin(callback: () => void): Promise<unknown>;
    fetch(): Promise<any>;
    sync(): void;
    private allowedPeriod;
    private checkTimeAllowed;
    private showAlert;
    set enable(val: boolean);
    set gameId(val: string);
}
