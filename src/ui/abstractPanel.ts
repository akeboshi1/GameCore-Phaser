export interface IAbstractPanel {
    isShow(): boolean;
    destroy();
    hide();
    show(param?: any);
    resize();
    update(param: any);
}
