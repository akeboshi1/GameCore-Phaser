export enum MainUIRedType {
    MAIL = 1,
    GALLERY = 2,
    PACKAGE = 3,
    ORDER = 4,
    TASK = 5,
    FRIEND = 6,
    DRESS = 7,
    MAIN = 8
}
export class RedEventType {
    /**
     * 主界面红点更新
     */
    public static MAIN_PANEL_RED = "MAIN_PANEL_RED";
    /**
     * 图鉴红点更新
     */
    public static GALLERY_PANEL_RED = "GALLERY_PANEL_RED";
    /**
     * 任务红点更新
     */
    public static TASK_PANEL_RED = "TASK_PANEL_RED";
}
