const { app, BrowserWindow, webContents, Menu } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const express = require("express");
const { ipcMain } = require("electron/main");
const express_app = express();
const tcpPortUsed = require("tcp-port-used");
const { execFile, exec } = require("node:child_process");
const { stdout, stdin } = require("process");
const fs = require("fs");
const axios = require("axios").default;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

function createWindow() {
  const startUrl = isDev
    ? "http://localhost:3001"
    : `file://${path.join(__dirname, "../build/index.html")}`;

  const preloadUrl = isDev
    ? path.join(__dirname, "preload.js")
    : path.join(__dirname, "preload.js");

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // nodeIntegration: true,
      preload: preloadUrl,
      devTools: isDev,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(startUrl);
  // mainWindow.loadFile("./electron/index.html");
  mainWindow.show();

  Menu.setApplicationMenu(null);

  // Open the DevTools.
  mainWindow.webContents.openDevTools({ mode: "detach" });
}

app.on("ready", () => {
  createWindow();

  startKL();

  // // express_app.use(express.json())
  // // express_app.use(express.urlencoded({extended:false}))

  // // express_app.post("/test", (req, res) => {
  // //   const {name,user} = req.body
  // //   console.log(`sono dentro la get e ti sto mandando dei dati: name ${name} user ${user} `);
  // //   mainWindow.webContents.send("incomingData", {
  // //     message: "ti ho inviato dei dati dal main",
  // //   });

  // //   res.status(200).json({ message: "Dentro la get del server" });
  // // });

  // // express_app.listen(5500, () => console.log("Server started on port 5500"));
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("sendDatacart", (event, args) => {
  console.log("Send Data Cart ...");
  console.log(args);
  // const payload = {datacart : 'datacart from ipc-electron-react'}

  let datacart_mock = fs.readFileSync(
    path.join(__dirname, "/mock/datacart_mock.json")
  );

  const payload = { datacart: JSON.parse(datacart_mock) };

  doPostRequest("http://localhost:5500/sendDataCart", payload);
});

ipcMain.handle("greet_main", (event, args) => {
  return "ciao sono il main";
});

const startKL = () => {
  // isRunning("DesktopViewer.exe", "", "").then((running) => {
  //   if (running) {
  //     waitPortListening(5500, registerClient);
  //     // aspetta che la porta sia aperta
  //     // tcpPortUsed.waitUntilUsed(5500, 500, 1800000).then(
  //     //   () => {
  //     //     console.log(
  //     //       "Port 5500 is now listening... I'm sending the register request"
  //     //     );
  //     //     console.log("Get DMX ...");

  //     //     let datamodel_conf_raw = fs.readFileSync(
  //     //       path.join(__dirname, "/mock/custom_datamodel.json")
  //     //     );
  //     //     const pack = {
  //     //       dmx: JSON.parse(datamodel_conf_raw),
  //     //       type: "REGISTER",
  //     //       // dmx: datamodel_conf_raw,
  //     //     };
  //     //     console.log("Parsed DMX ...");
  //     //     console.log(pack);
  //     //     console.log("Sending the request...");

  //     //     doPostRequest("http://localhost:5500/register", pack);
  //     //   },
  //     //   (err) => {
  //     //     console.error("Error on waitUntilused:", err.message);
  //     //   }
  //     // );
  //   } else {
  //     // start KL
  //     execFile(
  //       "C:/Users/mfinamore/AppData/Local/Programs/DesktopViewer/DesktopViewer.exe",
  //       (error, stdout, stderr) => {
  //         if (error) {
  //           console.log(`error : ${error}`);
  //           return;
  //         }
  //         if (stderr) {
  //           console.log(`stderr ${stderr}`);
  //           return;
  //         }
  //         console.log(stdout);
  //       }
  //     );
  //     waitPortListening(5500, registerClient);

  //     // tcpPortUsed.waitUntilUsed(5500, 500, 1800000).then(
  //     //   () => {
  //     //     console.log(
  //     //       "Port 5500 is now listening... I'm sending the register request"
  //     //     );
  //     //     console.log("Get DMX ...");

  //     //     let datamodel_conf_raw = fs.readFileSync(
  //     //       path.join(__dirname, "/mock/custom_datamodel.json")
  //     //     );
  //     //     const pack = {
  //     //       dmx: JSON.parse(datamodel_conf_raw),
  //     //       type: "REGISTER",
  //     //       // dmx: datamodel_conf_raw,
  //     //     };
  //     //     console.log("Parsed DMX ...");
  //     //     console.log(pack);
  //     //     console.log("Sending the request...");

  //     //     doPostRequest("http://localhost:5500/register", pack);
  //     //   },
  //     //   (err) => {
  //     //     console.error("Error on waitUntilused:", err.message);
  //     //   }
  //     // );
  //   }
  // });
  try {
    waitPortListening(5500, registerClient);
  } catch (error) {
    console.error('Error inside startkl ', error);
  }
  
  // tcpPortUsed.waitUntilUsed(5500, 500, 1800000).then(
  //   () => {
  //     console.log(
  //       "Port 5500 is now listening... I'm sending the register request"
  //     );
  //     console.log("Get DMX ...");

  //     let datamodel_conf_raw = fs.readFileSync(
  //       path.join(__dirname, "/mock/custom_datamodel.json")
  //     );
  //     const pack = {
  //       dmx: JSON.parse(datamodel_conf_raw),
  //       type: "REGISTER",
  //       // dmx: datamodel_conf_raw,
  //     };
  //     console.log("Parsed DMX ...");
  //     console.log(pack);
  //     console.log("Sending the request...");

  //     doPostRequest("http://localhost:5500/register", pack);
  //   },
  //   (err) => {
  //     console.error("Error on waitUntilused:", err.message);
  //   }
  // );
};

const waitPortListening = (port, callback) => {
  tcpPortUsed.waitUntilUsed(port, 500, 1800000).then(
    () => {
      console.log(
        "Port 5500 is now listening... I'm sending the register request"
      );
      console.log("Get DMX ...");
      callback();

      // let datamodel_conf_raw = fs.readFileSync(
      //   path.join(__dirname, "/mock/custom_datamodel.json")
      // );
      // const pack = {
      //   dmx: JSON.parse(datamodel_conf_raw),
      //   type: "REGISTER",
      //   // dmx: datamodel_conf_raw,
      // };
      // console.log("Parsed DMX ...");
      // console.log(pack);
      // console.log("Sending the request...");

      // doPostRequest("http://localhost:5500/register", pack);
    },
    (err) => {
      console.error("Error on waitUntilused:", err.message);
    }
  );
};

const registerClient = () => {
  console.log("Inside register client");
  let datamodel_conf_raw = fs.readFileSync(
    path.join(__dirname, "/mock/custom_datamodel.json")
  );
  let action_conf_raw = fs.readFileSync(path.join(__dirname, "/mock/my_actionconf.json"));

  const pack = {
    dmx: JSON.parse(datamodel_conf_raw),
    acx : JSON.parse(action_conf_raw),
    type: "REGISTER",
    // dmx: datamodel_conf_raw,
  };
  console.log("Parsed DMX ...");
  console.log(pack);
  console.log("Sending the request...");

  doPostRequest("http://localhost:5500/register", pack);
};

async function doPostRequest(endpoint, payload) {
  try {
    let res = await axios.post(endpoint, payload);

    if (res.status < 200 || res.status > 299) {
      throw new Error("Invalid response");
    }
    let data = res.data;
    console.log("I got response... ", data);
  } catch (error) {
    throw new Error(`error for POST to : ${endpoint} : ${error}`);
    // console.error(`error for POST to : ${endpoint} : ${error}`);
  }
}

function isRunning(win, mac, linux) {
  return new Promise(function (resolve, reject) {
    const plat = process.platform;
    const cmd =
      plat == "win32"
        ? "tasklist"
        : plat == "darwin"
        ? "ps -ax | grep " + mac
        : plat == "linux"
        ? "ps -A"
        : "";
    const proc =
      plat == "win32"
        ? win
        : plat == "darwin"
        ? mac
        : plat == "linux"
        ? linux
        : "";
    if (cmd === "" || proc === "") {
      resolve(false);
    }
    exec(cmd, function (err, stdout, stderr) {
      resolve(stdout.toLowerCase().indexOf(proc.toLowerCase()) > -1);
    });
  });
}
