export interface IAbstractPanel {
    destroy();
    close();
    show(param: any);
    resize();
    update(param: any);
}
