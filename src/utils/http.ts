import {Logger} from "./log";

export function load(path: string, responseType: XMLHttpRequestResponseType): Promise<any> {
  return new Promise((resolve, reject) => {
    const http = new XMLHttpRequest();
    http.onload = (response: ProgressEvent) => {
      resolve(response.currentTarget);
    };
    http.onerror = () => {
      Logger.warn(`${path} load error`);
      reject(`${path} load error`);
    };
    http.open("GET", path);
    http.responseType = responseType || "";
    http.send();
  });
}
