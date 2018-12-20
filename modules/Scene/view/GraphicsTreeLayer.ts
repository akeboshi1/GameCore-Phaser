import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import {QuadTreeTest} from "../../../base/ds/QuadTreeTest";

export class GraphicsTreeLayer extends BasicSceneLayer {
  public addGraphics(): void {
    // this.addChild(value.graphicsNode);
    // this.addChild(value.graphicsTree);
  }

  public initialize(): void {
    this.add(QuadTreeTest.graphicsTree);
    this.add(QuadTreeTest.graphicsNode);
    this.add(QuadTreeTest.graphicsRetrieve);
  }

  public onFrame(deltaTime: number): void {
    super.onFrame(deltaTime);
    // let len: number = this.treeList.length;
    // for (let i = 0; i < len; i++) {
      // this.graphicsList[i].x = this.scene.x;
      // this.graphicsList[i].y = this.scene.y;
    // }
  }

  public clear(): void {

  }
}
