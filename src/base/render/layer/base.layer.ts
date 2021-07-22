export class BaseLayer extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, public name: string, depth: number) {
        super(scene);
        this.setDepth(depth);
    }

    public destroy() {
        const list = this.list;
        list.forEach((gameobject) => {
            this.remove(gameobject, true);
        });
        super.destroy();
    }

    public sortLayer() {

    }
}
