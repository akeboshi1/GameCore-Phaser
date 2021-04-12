import { CamerasManager } from "./cameras.manager";
export declare class EditorCamerasManager extends CamerasManager {
    centerCameas(): void;
    offsetScroll(x: number, y: number): void;
    syncCameraScroll(): void;
}
