import { TopDisplay } from "base";

export class EditorTopDisplay extends TopDisplay {
    constructor(scene: Phaser.Scene, owner: any, dpr: number) {
        super(scene, owner, dpr);
    }

    protected addToSceneUI(obj: any) {
        if (!this.mOwner || !obj) {
            return;
        }
        (<any>this.scene).layerManager.addToLayer("sceneUILayer", obj);
    }
}
