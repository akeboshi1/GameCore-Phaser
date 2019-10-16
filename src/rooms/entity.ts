export interface IEntity {
    initialize(): boolean;
    register();
    unRegister();
    destroy();
}
