export interface IAbstractPanel {
    isShow: boolean;
    destroy();
    hideUI();
    showUI(param: any);
    resize();
    update(param: any);
}
