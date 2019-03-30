import NineSliceCacheData = PhaserNineSlice.NineSliceCacheData;

export class NiceSliceButton extends Phaser.Group {
    protected mOverFrame: PhaserNineSlice.NineSlice;
    protected mOutFrame: PhaserNineSlice.NineSlice;
    protected mDownFrame: PhaserNineSlice.NineSlice;
    protected mText: Phaser.Text;
    protected signals: { [name: string]: Phaser.Signal } = {};
    protected m_Width: number;
    protected m_Height: number;

    constructor(game: Phaser.Game, x: number, y: number, key: string, overFrame: string, outFrame: string, downFrame: string, width: number, height: number, data?: NineSliceCacheData, text?: string, fontSize?: number) {
        super(game);
        this.x = x;
        this.y = y;
        this.m_Width = width;
        this.m_Height = height;

        this.inputEnableChildren = true;
        this.mOverFrame = new PhaserNineSlice.NineSlice(game, 0, 0, key, overFrame, width, height, data);
        this.mOverFrame.visible = false;
        this.mOutFrame = new PhaserNineSlice.NineSlice(game, 0, 0, key, outFrame, width, height, data);
        this.mOutFrame.visible = true;
        this.mDownFrame = new PhaserNineSlice.NineSlice(game, 0, 0, key, downFrame, width, height, data);
        this.mDownFrame.visible = false;
        this.add(this.mOverFrame);
        this.add(this.mOutFrame);
        this.add(this.mDownFrame);

        this.mText = this.game.make.text(0, 0, "", {fontSize: fontSize || 12, fill: "#000", boundsAlignH: "center", boundsAlignV: "middle"});
        this.add(this.mText);
        this.setText(text);

        this.init();
    }

    public get width(): number {
        return this.m_Width;
    }

    public get height(): number {
        return this.m_Height;
    }

    public setText(value: string): void {
        if (this.mText) {
            this.mText.text = value;
        }
        this.mText.x = (this.width - this.mText.width) >> 1;
        this.mText.y = (this.height - this.mText.height) >> 1;
    }

    public on(name: string, callback: Function, context?: any) {
        if (!this.signals[name]) {
            this.signals[name] = new Phaser.Signal();
        }

        this.signals[name].add(callback, context || this);
    }

    public once(name: string, callback: Function, context?: any) {
        if (!this.signals[name]) {
            this.signals[name] = new Phaser.Signal();
        }

        this.signals[name].addOnce(callback, context || this);
    }

    public emit(name: string, args?: any) {
        if (!this.signals[name]) {
            this.signals[name] = new Phaser.Signal();
        }

        this.signals[name].dispatch(args);
    }

    public cancel( name: string, callback: Function, context?: any) {
        if (this.signals[name]) {
            this.signals[name].remove( callback, context || this) ;
            if ( this.signals[name].getNumListeners() === 0 ) {
                this.signals[name].dispose();
                delete this.signals[name];
            }
        }
    }

    protected init(): void {
        this.addEvent();
    }

    protected addEvent(): void {
        this.onChildInputOver.add(this.handleOver, this);
        this.onChildInputOut.add(this.handleOut, this);
        this.onChildInputDown.add(this.handleDown, this);
        this.onChildInputUp.add(this.handleUp, this);
    }

    protected removeEvent(): void {
        this.onChildInputOver.remove(this.handleOver, this);
        this.onChildInputOut.remove(this.handleOut, this);
        this.onChildInputDown.remove(this.handleDown, this);
        this.onChildInputUp.remove(this.handleUp, this);
        for ( let name in this.signals ) {
            this.signals[name].dispose();
            delete this.signals[name];
        }
    }

    private handleOver(): void {
        this.mOverFrame.visible = true;
        this.mOutFrame.visible = false;
        this.mDownFrame.visible = false;
    }

    private handleOut(): void {
        this.mOverFrame.visible = false;
        this.mOutFrame.visible = true;
        this.mDownFrame.visible = false;
    }

    private handleDown(): void {
        this.mOverFrame.visible = false;
        this.mOutFrame.visible = false;
        this.mDownFrame.visible = true;
        this.emit("down");
    }

    private handleUp(): void {
        this.mOverFrame.visible = false;
        this.mOutFrame.visible = true;
        this.mDownFrame.visible = false;
        this.emit("up");
    }

    public destroy(destroyChildren?: boolean): void {
        this.removeEvent();
        if (this.mOverFrame) {
            this.mOverFrame.destroy(true);
        }
        this.mOverFrame = null;
        if (this.mOutFrame) {
            this.mOutFrame.destroy(true);
        }
        this.mOutFrame = null;
        if (this.mDownFrame) {
            this.mDownFrame.destroy(true);
        }
        this.mDownFrame = null;
        super.destroy(destroyChildren);
    }
}