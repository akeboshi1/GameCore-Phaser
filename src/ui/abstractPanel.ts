export interface IAbstractPanel {
    isShow: boolean;
    destroy();
    close();
    show(param: any);
    resize();
    update(param: any);
}
