export interface IAbstractPanel {
    isShow(): boolean;
    destroy();
    hide();
    show(param?: any);
    resize(wid: number, hei: number);
    update(param: any);
}
