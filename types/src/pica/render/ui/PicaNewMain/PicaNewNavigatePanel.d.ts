import { Button } from "apowophaserui";
import { Handler } from "utils";
export declare class PicaNewNavigatePanel extends Phaser.GameObjects.Container {
    exploreButton: Button;
    homeButton: Button;
    bagButton: Button;
    makeButton: Button;
    private dpr;
    private key;
    private bg;
    private friendButton;
    private avatarButton;
    private sendHandler;
    private buttons;
    constructor(scene: Phaser.Scene, key: string, dpr: number, scale: number);
    init(): void;
    getIllustredPos(): {
        x: number;
        y: number;
    };
    tweenButton(index: number): void;
    addListen(): void;
    removeListen(): void;
    updateUIState(datas: any): void;
    setHandler(send: Handler): void;
    protected LayoutButton(): void;
    private onBagHandler;
    private onFriendHandler;
    private onAvatarHandler;
    private onMakeHandler;
    private onExploreHandler;
    private onHomeHandler;
    private createButton;
    private get isZh_CN();
    private getButton;
}
