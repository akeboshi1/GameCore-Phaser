import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
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

  public removeDraw(value: DrawArea): void {
    if (value.graphics.parent) {
        value.graphics.parent.removeChild(value.graphics);
    }
    let idx = this.graphicsList.indexOf(value);
    if (idx !== -1) {
      this.graphicsList.splice(idx, 1);
    }
  }

  public onFrame(deltaTime: number): void {
    super.onFrame(deltaTime);
    let len: number = this.graphicsList.length;
    for (let i = 0; i < len; i++) {
      this.graphicsList[i].onFrame(deltaTime);
    }
  }

  public clear(): void {

  }
}
