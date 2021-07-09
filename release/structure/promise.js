var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class ValueResolver {
  constructor() {
    __publicField(this, "resolver", null);
    __publicField(this, "rejecter", null);
    __publicField(this, "set", (resolver, reject = null) => {
      if (this.resolver) {
        const error = new Error("Resolver already exists");
        if (reject) {
          return reject(error);
        } else {
          throw error;
        }
      }
      this.resolver = resolver;
      this.rejecter = reject;
    });
    __publicField(this, "promise", (work) => new Promise((resolve, reject) => {
      this.set(resolve, reject);
      if (work) {
        try {
          work();
        } catch (error) {
          this.reject(error);
        }
      }
    }));
    __publicField(this, "resolve", (value) => {
      if (!this.resolver) {
        const error = "No Resolver";
        if (this.rejecter) {
          return this.rejecter(error);
        } else {
          return;
        }
      }
      this.resolver(value);
      this.resolver = null;
      this.rejecter = null;
    });
    __publicField(this, "reject", (reason) => {
      if (this.rejecter) {
        this.rejecter(reason);
      } else {
        throw reason;
      }
      this.resolver = null;
      this.rejecter = null;
    });
  }
  static create() {
    return new ValueResolver();
  }
}
