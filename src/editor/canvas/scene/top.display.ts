import { TopDisplay } from "baseRender";

export class EditorTopDisplay extends TopDisplay {
    constructor(scene: Phaser.Scene, owner: any, dpr: number) {
        super(scene, owner, dpr, 1);
    }

    protected addToSceneUI(obj: any) {
        if (!this.mOwner || !obj) {
            return;
        }
        (<any>this.scene).layerManager.addToLayer("sceneUILayer", obj);
    }
}
