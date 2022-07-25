
// const { ipcRenderer, contextBridge } = require("electron");

// const WINDOW_API = {
//   sendDatacart: (message) => ipcRenderer.send("sendDatacart", message),
//   registerClient:(message) => ipcRenderer.send("registerClient", message),
//   getFromMain: () => ipcRenderer.invoke("greet_main"),
//   onIncomingData: (callback) => {
//     ipcRenderer.once("incomingData", callback);
//   },
//   removeIncomingData : () => {
//     ipcRenderer.removeListener("incomingData");
//   },
//   testSend : () => {
//     ipcRenderer.send("testSend")
//   } 
// };



// contextBridge.exposeInMainWorld("ipc_renderer",WINDOW_API);

const { ipcRenderer, contextBridge } = require("electron");
// console.log("Sto eseguendo preload.js")
const WINDOW_API = {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  expandEntities: (payload) => ipcRenderer.send("sendDataCart", payload),
  receive: (channel, func) => {
    // Deliberately strip event as it includes `sender`
    const subscription = (event, ...args) => func(...args);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
  receiveOnce: (channel, func) => {
    // Deliberately strip event as it includes `sender`
    ipcRenderer.once(channel, (event, ...args) => func(...args));
  },
  removeAllListeners: (channel, func) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

contextBridge.exposeInMainWorld("ipc_renderer", WINDOW_API);

