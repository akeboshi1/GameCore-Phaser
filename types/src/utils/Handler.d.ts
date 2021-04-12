export declare class Handler {
    /**
     * 从对象池内创建一个Handler，默认会执行一次并立即回收，如果不需要自动回收，设置once参数为false。
     * @param	caller 执行域(this)。
     * @param	method 回调方法。
     * @param	args 携带的参数。
     * @param	once 是否只执行一次，如果为true，回调后执行recover()进行回收，默认为true。
     * @return  返回创建的handler实例。
     */
    static create(caller: any, method: Function, args?: any[], once?: Boolean): Handler;
    private static _pool;
    private static _gid;
    caller: any;
    method: Function;
    args: any[];
    once: Boolean;
    protected _id: number;
    /**
     * 根据指定的属性值，创建一个 <code>Handler</code> 类的实例。
     * @param	caller 执行域。
     * @param	method 处理函数。
     * @param	args 函数参数。
     * @param	once 是否只执行一次。
     */
    constructor(caller?: any, method?: Function, args?: any[], once?: Boolean);
    /**
     * 设置此对象的指定属性值。
     * @param	caller 执行域(this)。
     * @param	method 回调方法。
     * @param	args 携带的参数。
     * @param	once 是否只执行一次，如果为true，执行后执行recover()进行回收。
     * @return  返回 handler 本身。
     */
    setTo(caller: any, method: Function, args: any[], once: Boolean): Handler;
    /**
     * 执行处理器。
     */
    run(): any;
    /**
     * 执行处理器，携带额外数据。
     * @param	data 附加的回调数据，可以是单数据或者Array(作为多参)。
     */
    runWith(data: any): any;
    /**
     * 清理对象引用。
     */
    clear(): Handler;
    /**
     * 清理并回收到 Handler 对象池内。
     */
    recover(): void;
}
