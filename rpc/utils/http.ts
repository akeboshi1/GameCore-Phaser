export function load(path: string, responseType: XMLHttpRequestResponseType): Promise<any> {
  return new Promise((resolve, reject) => {
    const http = new XMLHttpRequest();
    http.onload = (response: ProgressEvent) => {
      resolve(response.currentTarget);
    };
    http.onerror = () => {
     // Logger.getInstance().warn(`${path} load error`);
      reject(`${path} load error`);
    };
    http.open("GET", path);
    http.responseType = responseType || "";
    http.send();
  });
}

export function checkIsFriend(uids: number[]): Promise<Response> {
  const data = {
    body: JSON.stringify({ uids }),
    method: "POST",
    headers: {
      "X-Pixelpai-TK": ""
    }
  };
  return fetch(`${CONFIG.api_root}/user/check_followed`, data);
}

function get(input: RequestInfo, init?: RequestInit) {
  return fetch(input, init);
}
