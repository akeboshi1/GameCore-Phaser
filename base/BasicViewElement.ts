export class BasicViewElement extends Phaser.Sprite {
    private _isInitilized: boolean = false;

    public constructor(game: Phaser.Game, x: number = 0, y: number = 0) {
        super(game, x, y);
        this.events.onAddedToGroup.add(this.addToStageHandler, this);
    }

    public get initilized(): Boolean {
        return this._isInitilized;
    }

    protected onAddToStage(): void {
    }

    protected onInitialize(): void {
    }

    protected onRemoveFromStage(): void {
        this.events.onRemovedFromGroup.remove(this.removeFromStageHandler, this);
        this.events.onAddedToGroup.add(this.addToStageHandler, this);
    }

    //event handler
    private addToStageHandler(): void {
        this.events.onAddedToGroup.remove(this.addToStageHandler, this);
        this.events.onRemovedFromGroup.add(this.removeFromStageHandler, this)
        if (!this._isInitilized) {
            this._isInitilized = true;
            this.onInitialize();
        }
        this.onAddToStage();
    }

    private removeFromStageHandler(): void {
        this.onRemoveFromStage();
    }
}
