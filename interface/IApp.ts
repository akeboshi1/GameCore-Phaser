/**
 * 单例基类
 * author aaron
 */
module Core {
    export interface IAPP {
        startApp(): void;
        readonly Http: Core.HttpMod;
    }
}