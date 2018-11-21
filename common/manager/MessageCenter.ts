/**
 * author aaron
 */
import BaseSingleton from "../../base/BaseSingleton";

export class MessageCenter extends BaseSingleton {
    private signals: { [name: string]: Phaser.Signal } = {};

    public constructor() {
        super();
    }
    // Event-related
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
}

