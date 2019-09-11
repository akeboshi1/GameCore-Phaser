/* tslint:disable */
export namespace Logger {
  export function log(message?: any, ...optionalParams: any[]) {
    console.log(message, optionalParams);
  }

  export function error(message?: any, ...optionalParams: any[]) {
    console.error(message, optionalParams);
  }

  export function warn(message?: any, ...optionalParams: any[]) {
    console.warn(message, optionalParams)
  }

  export function debug(message?: any, ...optionalParams: any[]) {
    console.log(message, optionalParams);
  }

  export function info(message?: any, ...optionalParams: any[]) {
    console.info(message, optionalParams);
  }
}
