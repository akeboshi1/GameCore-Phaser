import BasicSprite from "../display/BasicSprite";

export class BasicViewElement extends BasicSprite {
    private _isInitilized: boolean = false;

    public constructor() {
        super();
        // this.onAddedToGroup.addOnce(this.addToStageHandler, this);
    }

    public get initilized(): Boolean {
        return this._isInitilized;
    }

    protected onAddToStage(): void {
    }

    protected onInitialize(): void {
    }

    protected onRemoveFromStage(): void {
    }

    //event handler
    private addToStageHandler(): void {
        // this.events.onRemovedFromWorld.addOnce(this.removeFromStageHandler, this)
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
