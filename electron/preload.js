
const { ipcRenderer, contextBridge } = require("electron");

const WINDOW_API = {
  sendDatacart: (message) => ipcRenderer.send("sendDatacart", message),
  getFromMain: () => ipcRenderer.invoke("greet_main"),
  onIncomingData: (callback) => {
    ipcRenderer.once("incomingData", callback);
  },
  removeIncomingData : () => {
    ipcRenderer.removeListener("incomingData");
  }
};



contextBridge.exposeInMainWorld("ipc_renderer",WINDOW_API);
