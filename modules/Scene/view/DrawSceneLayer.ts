import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import {SceneInfo} from "../../../common/struct/SceneInfo";
import {ElementInfo} from "../../../common/struct/ElementInfo";
import {PlayerInfo} from "../../../common/struct/PlayerInfo";
import {DrawArea} from "../../../common/struct/DrawArea";

export class DrawSceneLayer extends BasicSceneLayer {
    private graphicsList: DrawArea[];
    public constructor(game: Phaser.Game) {
        super(game);
        this.graphicsList = [];
    }

    public addDraw(value: DrawArea): void {
      this.addChild(value.graphics);
      this.graphicsList.push(value);
    }

    public onFrame(deltaTime: number): void {
        super.onFrame(deltaTime);
        let len: number = this.graphicsList.length;
        for (let i = 0; i < len; i++) {
            this.graphicsList[i].onTick(deltaTime);
        }
    }
}
