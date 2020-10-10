/* tslint:disable */
export class Logger {
  public isDebug: boolean = true;
  private static _instance: Logger;
  private mErrorList: string[];
  private mWarnList: string[];
  constructor() {
    this.mErrorList = [];
    this.mWarnList = [];
  }

  public static getInstance(): Logger {
    if (!Logger._instance) Logger._instance = new Logger();
    return Logger._instance;
  }
  fatal(message?: any, ...optionalParams: any[]) {
    return console.error(message, ...optionalParams);
    // }

    throw message;
  }
  log(message?: any, ...optionalParams: any[]) {
    if (this.isDebug)
      console.log(message, ...optionalParams);
  }

  error(message?: any, ...optionalParams: any[]) {
    if (this.isDebug)
      console.error(message, ...optionalParams);
    this.mErrorList.push(message);
  }

  warn(message?: any, ...optionalParams: any[]) {
    if (this.isDebug)
      console.warn(message, ...optionalParams);
    this.mWarnList.push(message);
  }

  debug(message?: any, ...optionalParams: any[]) {
    if (this.isDebug)
      console.log(message, ...optionalParams);
  }

  info(message?: any, ...optionalParams: any[]) {
    if (this.isDebug)
      console.info(message, ...optionalParams);
  }

  getErrorList(): string[] {
    return this.mErrorList;
  }

  getWarnList(): string[] {
    return this.mWarnList;
  }
}

export function log(message, ...optionalParams) {
  console.log(message, ...optionalParams);
}

export function error(message, ...optionalParams) {
  console.error(message, ...optionalParams);
}
