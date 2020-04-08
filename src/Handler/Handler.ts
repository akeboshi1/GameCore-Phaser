
export class Handler {
    /**
     * 从对象池内创建一个Handler，默认会执行一次并立即回收，如果不需要自动回收，设置once参数为false。
     * @param	caller 执行域(this)。
     * @param	method 回调方法。
     * @param	args 携带的参数。
     * @param	once 是否只执行一次，如果为true，回调后执行recover()进行回收，默认为true。
     * @return  返回创建的handler实例。
     */
    public static create(caller: any, method: Function, args: any[] = null, once: Boolean = true): Handler {
        if (Handler._pool.length) return Handler._pool.pop().setTo(caller, method, args, once);
        return new Handler(caller, method, args, once);
    }

    /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
    private static _pool: any[] = [];
    private static _gid: number = 1;
    public caller: any;
    public method: Function;
    public args: any[];
    public once: Boolean = false;
    protected _id: number = 0;

    /**
     * 根据指定的属性值，创建一个 <code>Handler</code> 类的实例。
     * @param	caller 执行域。
     * @param	method 处理函数。
     * @param	args 函数参数。
     * @param	once 是否只执行一次。
     */
    public constructor(caller: any = null, method: Function = null, args: any[] = null, once: Boolean = false) {
        this.setTo(caller, method, args, once);
    }

    /**
     * 设置此对象的指定属性值。
     * @param	caller 执行域(this)。
     * @param	method 回调方法。
     * @param	args 携带的参数。
     * @param	once 是否只执行一次，如果为true，执行后执行recover()进行回收。
     * @return  返回 handler 本身。
     */
    public setTo(caller: any, method: Function, args: any[], once: Boolean): Handler {
        this._id = Handler._gid++;
        this.caller = caller;
        this.method = method;
        this.args = args;
        this.once = once;
        return this;
    }

    /**
     * 执行处理器。
     */
    public run() {
        if (this.method == null) return null;
        const id: number = this._id;
        const result = this.method.apply(this.caller, this.args);
        // tslint:disable-next-line: no-unused-expression
        this._id === id && this.once && this.recover();
        return result;
    }

    /**
     * 执行处理器，携带额外数据。
     * @param	data 附加的回调数据，可以是单数据或者Array(作为多参)。
     */
    public runWith(data: any) {
        if (this.method == null) return null;
        const id: number = this._id;
        if (data == null)
            // tslint:disable-next-line: no-var-keyword
            var result = this.method.apply(this.caller, this.args);
        /*[IF-FLASH]*/
        else if (!this.args && !(data instanceof Array)) result = this.method.call(this.caller, data);
        // tslint:disable-next-line: comment-format
        //[IF-JS] else if (!args && !data.unshift) result= method.call(caller, data);
        else if (this.args) result = this.method.apply(this.caller, this.args.concat(data));
        else result = this.method.apply(this.caller, data);
        // tslint:disable-next-line: no-unused-expression
        this._id === id && this.once && this.recover();
        return result;
    }

    /**
     * 清理对象引用。
     */
    public clear(): Handler {
        this.caller = null;
        this.method = null;
        this.args = null;
        return this;
    }

    /**
     * 清理并回收到 Handler 对象池内。
     */
    public recover(): void {
        if (this._id > 0) {
            this._id = 0;
            Handler._pool.push(this.clear());
        }
    }
}
