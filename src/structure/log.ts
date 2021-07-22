import { ChatCommandInterface } from "./chat.command";

/* tslint:disable */
export class Logger implements ChatCommandInterface {
  public isDebug: boolean = false;
  private static _instance: Logger;
  // private mErrorList: string[];
  // private mWarnList: string[];
  constructor() {
    // this.mErrorList = [];
    // this.mWarnList = [];
  }

  public static getInstance(): Logger {
    if (!Logger._instance) Logger._instance = new Logger();
    return Logger._instance;
  }
  fatal(message?: any, ...optionalParams: any[]) {
    // return console.error(message, ...optionalParams);
    throw message;
  }

  /**
   * 正常输出
   * @param message 
   * @param optionalParams 
   */
  log(message?: any, ...optionalParams: any[]) {
    if (Logger._instance.isDebug)
      console.log(message, ...optionalParams);
  }

  /**
   * 调试输出
   * @param message 
   * @param optionalParams 
   */
  debug(message?: any, ...optionalParams: any[]) {
    if (Logger._instance.isDebug)
      console.log(message, ...optionalParams);
  }

  error(message?: any, ...optionalParams: any[]) {
    // if (Logger._instance.isDebug)
    console.error(message, ...optionalParams);
    // this.mErrorList.push(message);
  }

  debugError(message?: any, ...optionalParams: any[]) {
    if (Logger._instance.isDebug)
      console.error(message, ...optionalParams);
    // this.mErrorList.push(message);
  }

  warn(message?: any, ...optionalParams: any[]) {
    if (Logger._instance.isDebug)
      console.warn(message, ...optionalParams);
    // this.mWarnList.push(message);
  }

  info(message?: any, ...optionalParams: any[]) {
    if (Logger._instance.isDebug)
      console.info(message, ...optionalParams);
  }

  // getErrorList(): string[] {
  //   return this.mErrorList;
  // }

  // getWarnList(): string[] {
  //   return this.mWarnList;
  // }

  v() {
    Logger._instance.isDebug = true;
  }
  q() {
    Logger._instance.isDebug = false;
  }
}

export function log(message, ...optionalParams) {
  console.log(message, ...optionalParams);
}

export function error(message, ...optionalParams) {
  console.error(message, ...optionalParams);
}
