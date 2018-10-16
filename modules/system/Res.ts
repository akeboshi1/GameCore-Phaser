import BaseSingleton from "../../base/BaseSingleton";
import Globals from "../../Globals";
import * as Assets from "../../Assets";

export class Res extends BaseSingleton {
    private soundKeys: string[] = [];

    public loadAllAssets(onComplete?: Function, onCompleteContext?: any) {

        if (onComplete) {
            Globals.game.load.onLoadComplete.addOnce(onComplete, onCompleteContext);
        }

        this.loadImages();
        this.loadJsons();

        if ((Globals.game.load as any)._fileList.length === 0) {
            Globals.game.load.onLoadComplete.dispatch();
        }
    }

    public waitForSoundDecoding(onComplete: Function, onCompleteContext?: any) {
        if (this.soundKeys.length > 0) {
            Globals.game.sound.setDecodedCallback(this.soundKeys, onComplete, onCompleteContext);
        } else {
            onComplete.call(onCompleteContext);
        }
    }

    private loadImages(): void {
        Globals.game.load.image(Assets.Images.ImagesTile.getName(), Assets.Images.ImagesTile.getPNG());
    }

    private loadJsons(): void {
        for(let i of Assets.Jsons.JsonMap.getLoadList()) {
            Globals.game.load.json(i+"_json",Assets.Jsons.JsonMap.getJSON(i));
        }
    }

    private loadAtlases(): void {

    }
}