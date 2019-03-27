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
        this.mBg.inputEnabled = true;
        this.mBg.beginFill(0x00ffff, 0);
        this.mBg.drawRect(0, 0, this.mWidth, this.mHeight);
        this.mBg.endFill();
        this.add(this.mBg);
    }

    protected addEvent(): void {
        this.mBg.events.onInputOver.add(this.handleOver, this);
        this.mBg.events.onInputOut.add(this.handleOut, this);
        this.mBg.events.onInputDown.add(this.handleDown, this);
        this.mBg.events.onInputUp.add(this.handleUp, this);
    }

    protected removeEvent(): void {
        this.mBg.events.onInputOver.remove(this.handleOver, this);
        this.mBg.events.onInputOut.remove(this.handleOut, this);
        this.mBg.events.onInputDown.remove(this.handleDown, this);
        this.mBg.events.onInputUp.remove(this.handleUp, this);
    }

    protected handleOver(): void {
        if (this.m_List) {
            this.m_List.onTriggerOver(this);
        }
    }

    protected handleOut(): void {
        if (this.m_List) {
            this.m_List.onTriggerOut(this);
        }
    }

    protected handleDown(): void {
        if (this.m_List) {
            this.m_List.onTriggerDown(this);
        }
    }

    protected handleUp(): void {
        if (this.m_List) {
            this.m_List.onTriggerUp(this);
        }
    }

    protected render(): void {
        this.mLabel.text = this.data;
    }

    public onDispose(): void {
        this.mBg.inputEnabled = false;
        super.onDispose();
    }
}