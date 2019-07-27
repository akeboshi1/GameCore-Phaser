export interface IModuleContext {
    dispose(): void;
    start(): void;
    setParam( param: any ): void;
    breakOff(): void;
    recover(): void;
    update(param: any): void;
}