export class CheckButton extends Phaser.Sprite {
    protected isSelect = false;
    protected signal: Phaser.Signal = new Phaser.Signal;
    constructor(game: Phaser.Game, x: number, y: number, key?: string) {
        super(game, x, y, key);
        this.init();
    }

    protected init(): void {
        this.select = false;
        this.inputEnabled = true;
        this.addInput();
    }

    public addInput() {
        this.events.onInputDown.add(this.handleDown, this);
    }

    public removeInput() {
        this.events.onInputDown.remove(this.handleDown, this);
    }

    public onCallBack(callback: Function, context?: any): void {
        if (this.signal) {
            this.signal.add(callback, context);
        }
    }

    public cancelCallBack(callback: Function, context?: any): void {
        if (this.signal) {
            this.signal.remove(callback, context);
        }
    }

    private handleDown(): void {
        this.select = !this.select;
        if (this.signal) {
            this.signal.dispatch(this.select);
        }
    }

    public set select(value: boolean) {
        this.isSelect = value;
        this.frame = value ? 0 : 1;
    }

    public get select(): boolean {
        return this.isSelect;
    }
}