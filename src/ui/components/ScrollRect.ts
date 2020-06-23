import { GridLayoutGroup, AxisType } from "./GridLayoutGroup";

export class ScrollRect extends Phaser.GameObjects.Zone {
    public content: GridLayoutGroup;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.content = new GridLayoutGroup(scene, x, y);
    }

    public setParent(parent: Phaser.GameObjects.Container) {
        parent.add(this);
        parent.add(this.content);
    }

    public setPosition(x, y) {
        super.setPosition(x, y);
        return this;
    }

    public addItem(item: any) {
        this.content.add(item);
    }

    public sort() {
        this.content.Layout();
        if (this.content.startAxis === AxisType.Horizontal) {

        } else {

        }
    }

    private onMove(pointer: Phaser.Input.Pointer) {
    }
}
