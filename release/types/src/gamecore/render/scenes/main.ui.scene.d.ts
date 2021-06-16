import { RoomScene } from "./room.scene";
export declare class MainUIScene extends RoomScene {
    static readonly LAYER_UI = "uiLayer";
    static readonly LAYER_DIALOG = "dialogLayer";
    static readonly LAYER_TOOLTIPS = "toolTipsLayer";
    static readonly LAYER_MASK = "maskLayer";
    private timeOutID;
    private timeOutCancelMap;
    private timeOutCallerList;
    private timeOutTimeMap;
    private fps;
    constructor();
    init(data: any): void;
    create(): void;
    setTimeout(caller: any, time: any): number;
    clearTimeout(id: any): void;
    updateFPS(): void;
    getKey(): string;
    protected onPointerDownHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]): void;
    private checkSize;
    private loadRaomVideos;
}
