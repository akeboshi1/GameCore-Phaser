export declare class EventDispatcher {
    private _events;
    hasListener(type: string): Boolean;
    emit(type: string, ...data: any[]): Boolean;
    on(type: string, listener: Function, caller: any, args?: any[]): EventDispatcher;
    once(type: string, listener: Function, caller: any, args?: any[]): EventDispatcher;
    /**
     *
     */
    off(type: string, listener: Function, caller: any, onceOnly?: Boolean): EventDispatcher;
    offAll(type?: string): EventDispatcher;
    offAllCaller(caller: any): EventDispatcher;
    destroy(): void;
    private _createListener;
    private _recoverHandlers;
}
