import { Handler } from "utils";
export declare class TimerCountDown {
    private timerid;
    private callback;
    private interval;
    constructor(callback: Handler);
    execute(interval: number): void;
    clear(): void;
    private getDataFormat;
    private stringFormat;
}
