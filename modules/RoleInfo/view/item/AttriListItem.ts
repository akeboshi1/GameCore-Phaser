import "phaser-ce";
import {UI} from "../../../../Assets";
import {SlotInfo} from "../../../../common/struct/SlotInfo";
import {ListItemComponent} from "../../../../base/component/list/core/ListItemComponent";

export class AttriListItem extends ListItemComponent {
    private bar: Phaser.Graphics;
    constructor(game) {
        super(game);
    }

    public getHeight(): number {
        return 20;
    }

    public getWidth(): number {
        return 134;
    }

    protected init(): void {
        this.game.add.nineSlice(0, 0, UI.ProgressBg.getName(), null, 138, 26, this);
        this.bar = this.game.make.graphics(0, 0);
        this.addChild(this.bar);
        this.game.add.nineSlice(0, 0, UI.ProgressFill.getName(), null, 138, 26, this);
        super.init();
    }

    protected render(): void {
        let slot: SlotInfo = this.data;
        this.bar.clear();
        let color: any = "0x" + slot.color.substr(1);
        this.bar.beginFill(color, 0.8);
        this.bar.drawRect(2, 2, 134 , 20);
        let prec = slot.bondAttrCur / slot.bondAttrMax;
        this.bar.scale.x = prec;
    }
}