import { Handler } from "./Handler";
export declare class TimerCountDown {
    private timerid;
    private callback;
    private interval;
    constructor(callback: Handler);
    executeText(interval: number): void;
    executeTime(interval: number): void;
    clear(): void;
    private getDataFormat;
    private stringFormat;
}
