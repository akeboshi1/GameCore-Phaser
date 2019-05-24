export interface IMediator {
    setViewComponent(viewComponent: any): void;

    setParam( param: any ): void;
    readonly param: void;

    preRegister(): void;
    onRegister(): void;

    preBreakOff(): void;
    onBreakOff(): void;

    preRecover(): void;
    onRecover(): void;

    preRemove(): void;
    onRemove(): void;
}