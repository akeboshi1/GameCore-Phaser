import { IPos } from "structure";
interface IAccountData {
    accessToken: string;
    refreshToken: string;
    expire: number;
    fingerprint: string;
    id: string;
    gateway?: {
        host: string;
        port: number;
    };
}
export declare class Account {
    gameId: string;
    virtualWorldId: string;
    sceneID: number;
    loc: IPos;
    spawnPointId: number;
    accountData: IAccountData;
    worldId: string;
    constructor();
    getAccountData(): IAccountData;
    setAccount(val: any): void;
    refreshToken(data: any): void;
    saveLocalStorage(): void;
    clear(): void;
    destroy(): void;
    enterGame(gameId: string, virtualWorldId: string, sceneId: number, loc: any, spawnPointId: any, worldId?: string): void;
    get gameID(): string;
    get sceneId(): number;
}
export {};
