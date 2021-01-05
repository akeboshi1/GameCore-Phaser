import { ILauncherConfig } from "./lanucher.config";

export interface GameMain {
    resize(newWidth, newHeight);
    onOrientationChange(oriation: number, newWidth: number, newHeight: number);
    scaleChange(scale: number);
    enableClick();
    disableClick();
    keyboardDidShow(height: number);
    keyboardDidHide(): void;
    startFullscreen(): void;
    stopFullscreen(): void;
    createGame(content?): void;
    setGameConfig(config): void;
    updatePalette(palett): void;
    onFocus();
    onBlur();
    updateMoss(moss): void;
    restart(config?: ILauncherConfig, callBack?: Function);
    destroy(): Promise<void>;
}
