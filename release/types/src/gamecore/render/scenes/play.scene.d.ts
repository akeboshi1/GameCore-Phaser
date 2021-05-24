/// <reference types="phaser" />
import { RoomScene } from "./room.scene";
import { PlaySceneLoadState } from "structure";
import { MotionManager } from "../input/motion.manager";
export declare class PlayScene extends RoomScene {
    protected motion: MotionManager;
    protected mLoadState: PlaySceneLoadState;
    private cameraMovable;
    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig);
    preload(): void;
    get motionMgr(): MotionManager;
    create(): void;
    update(time: number, delta: number): void;
    getKey(): string;
    snapshot(): Promise<void>;
    get loadState(): PlaySceneLoadState;
    set loadState(val: PlaySceneLoadState);
    onRoomCreated(): void;
    pauseMotion(): void;
    resumeMotion(): void;
    enableCameraMove(): void;
    disableCameraMove(): void;
    protected initMotion(): void;
    protected initListener(): void;
    protected onPointerDownHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]): void;
    protected onPointerUpHandler(pointer: Phaser.Input.Pointer): void;
    protected addPointerMoveHandler(): void;
    protected removePointerMoveHandler(): void;
    protected onPointerMoveHandler(pointer: Phaser.Input.Pointer): void;
    protected onGameOutHandler(): void;
}
