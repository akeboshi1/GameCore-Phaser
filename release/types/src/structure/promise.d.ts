declare type PromiseResolver<T> = (value?: T) => void;
export declare class ValueResolver<T> {
    static create<T>(): ValueResolver<T>;
    private resolver;
    private rejecter;
    set: (resolver: PromiseResolver<T>, reject?: (reason?: any) => void) => void;
    promise: (work?: () => void) => Promise<T>;
    resolve: (value?: T) => void;
    reject: (reason?: any) => void;
}
export {};
