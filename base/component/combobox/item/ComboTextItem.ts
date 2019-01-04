import {ListItemComponent} from "../../list/core/ListItemComponent";

export class ComboTextItem extends ListItemComponent {
    protected mLabel: Phaser.Text;
    protected mBg: Phaser.Graphics;
    protected mWidth: number;
    protected mHeight: number;
    constructor(game: Phaser.Game, width: number = 112, height: number = 26) {
        super(game);
        this.mWidth = width;
        this.mHeight = height;
        this.preInit();
    }

    public getHeight(): number {
        return this.mHeight;
    }

    public getWidth(): number {
        return this.mWidth;
    }

    protected preInit(): void {
        this.mLabel = this.game.make.text(0, 0, "", {fontSize: 12, fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"});
        this.mLabel.setTextBounds(0, 0, this.mWidth, this.mHeight);
        this.add(this.mLabel);
        this.mBg = this.game.make.graphics(0, 0);
        this.mBg.beginFill(0x00ffff, 0);
        this.mBg.drawRect(0, 0, this.mWidth, this.mHeight);
        this.mBg.endFill();
        this.add(this.mBg);
        this.mBg.inputEnabled = true;
        this.mBg.events.onInputUp.add(this.handleUp, this);
    }

    protected handleUp(): void {
        if (this.m_List) {
            this.m_List.onTriggerClick(this);
        }
    }

    protected render(): void {
        this.mLabel.text = this.data;
    }

    public onDispose(): void {
        this.onChildInputUp.remove(this.handleUp, this);
        this.mBg.inputEnabled = false;
        super.onDispose();
    }
}