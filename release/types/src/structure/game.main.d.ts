import { ILauncherConfig } from "./lanucher.config";
export interface GameMain {
    resize(newWidth: any, newHeight: any): any;
    onOrientationChange(oriation: number, newWidth: number, newHeight: number): any;
    scaleChange(scale: number): any;
    enableClick(): any;
    disableClick(): any;
    keyboardDidShow(height: number): any;
    keyboardDidHide(): void;
    startFullscreen(): void;
    stopFullscreen(): void;
    createGame(content?: any): void;
    setGameConfig(config: any): void;
    updatePalette(palett: any): void;
    onFocus(): any;
    onBlur(): any;
    updateMoss(moss: any): void;
    restart(config?: ILauncherConfig, callBack?: Function): any;
    destroy(): Promise<void>;
}
