export class BaseLayer extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, public name: string, depth: number) {
        super(scene);
        this.setDepth(depth);
    }

    public sortLayer() {

    }
}
