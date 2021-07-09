var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class HttpNetWork {
  static Get(url, compl, error) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.timeout = this.timeOut;
    xmlHttp.open("GET", url, true);
    xmlHttp.onreadystatechange = (ev) => {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
          if (compl)
            compl.runWith(xmlHttp);
        } else if (xmlHttp.status === 404) {
          if (error)
            error.runWith(xmlHttp.response);
        }
      }
    };
    xmlHttp.ontimeout = (ev) => {
      if (error)
        error.runWith(xmlHttp.response);
    };
    xmlHttp.send();
  }
  static Post(url, options, compl, error, timeOut = 15e3) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.timeout = timeOut;
    xmlHttp.open("POST", url, true);
    const formData = new FormData();
    for (let i = 0; i < options.length; i++) {
      const op = options[i];
      const arr = op.split(":");
      if (arr && arr.length === 2)
        formData.append(arr[0], arr[1]);
    }
    xmlHttp.onreadystatechange = (ev) => {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
          if (compl)
            compl.runWith(xmlHttp);
        } else if (xmlHttp.status === 404) {
          if (error)
            error.runWith(xmlHttp.response);
        }
      }
    };
    xmlHttp.ontimeout = (ev) => {
      if (error)
        error.runWith(xmlHttp.response);
    };
    xmlHttp.send(formData);
  }
}
__publicField(HttpNetWork, "timeOut", 15e3);
