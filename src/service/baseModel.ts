export interface IBaseModel {
    initialize: boolean;
    getInitialize(): boolean;
    register();
    unRegister();
    destroy();
}
