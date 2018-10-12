import BaseSingleton from "../../base/BaseSingleton";
import {Images} from "../../Assets";

export class Res extends BaseSingleton {
    private game: Phaser.Game = null;
    private soundKeys: string[] = [];

    public loadAllAssets(game: Phaser.Game, onComplete?: Function, onCompleteContext?: any) {
        this.game = game;

        if (onComplete) {
            this.game.load.onLoadComplete.addOnce(onComplete, onCompleteContext);
        }

        this.loadImages();
        this.loadAtlases();

        if ((this.game.load as any)._fileList.length === 0) {
            this.game.load.onLoadComplete.dispatch();
        }
    }

    public waitForSoundDecoding(onComplete: Function, onCompleteContext?: any) {
        if (this.soundKeys.length > 0) {
            this.game.sound.setDecodedCallback(this.soundKeys, onComplete, onCompleteContext);
        } else {
            onComplete.call(onCompleteContext);
        }
    }

    private loadImages(): void {
        this.game.load.image(Images.ImagesTile.getName(), Images.ImagesTile.getPNG());
    }

    private loadAtlases(): void {

    }
}