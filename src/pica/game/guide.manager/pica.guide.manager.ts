import { GuideManager } from "gamecore";
import { PicaGame } from "../pica.game";

export class PicaGuideManager extends GuideManager {
    constructor(protected game: PicaGame) {
        super(game);
    }
}
