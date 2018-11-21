export class ModuleViewBase extends Phaser.Group {
    private signals: { [name: string]: Phaser.Signal } = {};

    constructor(game: Phaser.Game) {
        super(game);
        this.preInit();
        this.init();
        this.onResize();
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

    public onDispose(): void {
        for ( let name in this.signals ) {
            this.signals[name].dispose();
            delete this.signals[name];
        }
    }

    public onResize(): void {}

    protected preInit(): void {}

    protected init(): void {}
}