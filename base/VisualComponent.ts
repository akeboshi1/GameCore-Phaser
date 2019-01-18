import {IDisposeObject} from "./object/interfaces/IDisposeObject";

export class VisualComponent extends Phaser.Group implements IDisposeObject {
    protected signals: { [name: string]: Phaser.Signal } = {};

    constructor(game: Phaser.Game, parent?: PIXI.DisplayObjectContainer) {
        super(game, parent || null);
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

    public onClear(): void {
    }

    public onDispose(): void {
        for ( let name in this.signals ) {
            this.signals[name].dispose();
            delete this.signals[name];
        }
    }
}
