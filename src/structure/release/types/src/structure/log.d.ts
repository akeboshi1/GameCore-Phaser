import { ChatCommandInterface } from "./chat.command";
export declare class Logger implements ChatCommandInterface {
    isDebug: boolean;
    private static _instance;
    constructor();
    static getInstance(): Logger;
    fatal(message?: any, ...optionalParams: any[]): void;
    /**
     * 正常输出
     * @param message
     * @param optionalParams
     */
    log(message?: any, ...optionalParams: any[]): void;
    /**
     * 调试输出
     * @param message
     * @param optionalParams
     */
    debug(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
    debugError(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    v(): void;
    q(): void;
}
export declare function log(message: any, ...optionalParams: any[]): void;
export declare function error(message: any, ...optionalParams: any[]): void;
