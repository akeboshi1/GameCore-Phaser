import { Handler } from "structure";
export declare class HttpNetWork {
    static Get(url: any, compl?: Handler, error?: Handler): void;
    static Post(url: any, options: string[], compl?: Handler, error?: Handler, timeOut?: number): void;
    private static timeOut;
}
