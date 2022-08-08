

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

