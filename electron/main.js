const {setupTitlebar,attachTitlebarToWindow} = require('custom-electron-titlebar/main')
const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const express = require("express");
const { ipcMain } = require("electron/main");
const express_app = express();
const { exec } = require("node:child_process");

const fs = require("fs");
const axios = require("axios").default;
const chokidar = require("chokidar");

const AsyncMethods = require("./utils");

let mainWindow = null;
let redirectWindow = null;

//Initialize watcher for folder
const watcher = chokidar.watch(
  path.join(__dirname, "/mock/communication_folder"),
  {
    persistent: true,
  }
);

// setup the titlebar main process
setupTitlebar();

watcher
  .on("add", (path) => {
    console.log(`File ${path} has been added to the folder`);

    fs.readFile(path, (err, data) => {
      if (err) {
        console.error(
          `Error while reading new file added to the folder : ${err.message}`
        );
        return;
      }

      const parsed_data = JSON.parse(data);
      console.log("Dati parsati", parsed_data);
      const second_entity = {
        itemType: "entity",
        onMerge: "update",
        key: "00393282553163",
        type: "PhoneNumberANT",
        properties: { Numero: "3282553163" },
      };

      const link = {
        itemType: "link",
        label: "999",
        key: "LU:00393282553163-00393299897693",
        type: "Database Link",
        properties: {
          identityProperty: {
            value: "LU:00393282553163-00393299897693",
          },
        },
        key1: "00393299897693",
        type1: "PhoneNumberANT",
        type2: "PhoneNumberANT",
        key2: "00393282553163",
      };

      const items = [];

      items.push(parsed_data[0]);
      items.push(second_entity);
      items.push(link);
      console.log("items", items);
      console.log("items stringed", JSON.stringify(items));

      const payload = {
        datacart: {
          items: items,
        },
      };
      console.log(payload);

      sendDataCart("I'm trying to expand the entity", payload);

      // // try{

      // //   doPostRequest("http://localhost:5500/sendDataCart", payload);
      // //   mainWindow.webContents.send('consoleMessages', 'datacart sent')

      // // }catch(err){
      // //   mainWindow.webContents.send('consoleMessages', err.message)
      // //   console.error(err.message);
      // // }

      fs.unlink(path, (err) => {
        if (err) console.error("Error while deleting file", err.message);
      });
    });
  })
  .on("change", (path) => console.log(`File ${path} has been changed`))
  .on("unlink", (path) => console.log(`File ${path} has been removed`));

// crea la window electron
function createWindow() {
  const startUrl = isDev
    ? "http://localhost:3010"
    : `file://${path.join(__dirname, "../build/index.html")}`;

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    titleBarStyle: 'hidden',
    minHeight: 600,
    show: false,
    webPreferences: {
      // nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
      devTools: isDev,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(startUrl);

  // mainWindow.show();

  // Open the DevTools.
  mainWindow.webContents.openDevTools({ mode: "detach" });

  // attach fullscreen(f11 and not 'maximized') && focus listeners
  attachTitlebarToWindow(mainWindow);

  mainWindow.on("close", (e) => {
    e.preventDefault();
    dialog
      .showMessageBox(mainWindow, {
        type: "question",
        buttons: ["Yes", "No"],
        title: "Confirm",
        defaultId: 2,
        message: "Sicuro di voler uscire? Perderai tutti i dati",
      })
      .then((response) => {
        if (response.response == 0) {
          console.log("response === 0");
          mainWindow.destroy();
          app.quit();
        }
      });
  });
}

const testget = async () => {
  try {
    let res = await fetch("http://localhost:3990/api/");

    if (!res.error) {
      console.log(res.data);
    }
  } catch (error) {
    console.log("error : ", error.message);
  }
};

const testredirect = async () => {
  try {
    let res = await axios.get("http://localhost:3990/api/loginToADFS");

    if (!res.error) {
      console.log(res.headers.location);
      let redirectWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 600,
      });

      redirectWindow.loadURL(res.headers.location);
      redirectWindow.loadFile(res.headers.location);

      redirectWindow.show();
    }
  } catch (error) {
    console.log("error : ", error.message);
  }
};

app.on("ready", () => {
  createWindow();
  // testget();
  // testredirect();

  const endpoint = new URL("http://localhost:3990/api/callAuthMain");
  endpoint.searchParams.set("APP_KEY", "u54983ds9");

  AsyncMethods.getAsync(endpoint)
    .then((data) => {
      // console.log('data retrieved from callAuthMain', data);
      const { ADFS_URL } = data;

     redirectWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 600,
      });

      redirectWindow.loadURL(ADFS_URL);
      // redirectWindow.loadFile(res.headers.location);

      redirectWindow.show();

    })
    .catch((error) => console.error("error catched in main.js", error));

  // startKL();
  express_app.use(express.json());
  express_app.use(express.urlencoded({ extended: false }));

  express_app.get("/token", (req, res) => {
   const {token} = req.query
   console.log('token',token);
    res.status(200).send("<html> <head>server Response</head><body><h1> Login OK</p></h1></body></html>");

    setTimeout(() => {
      AsyncMethods.postAsync('http://localhost:3990/api/smartAntAuthentication', {token :token}).then(resp => {
        redirectWindow.close()
        mainWindow.show()
        mainWindow.webContents.send(
          "consoleMessages",
          `I got the token : ${resp.token}`
        );

      })
    },3000)
  });

  express_app.listen(5600, () => console.log("Server started on port 5600"));
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

// handler per invio datacart
ipcMain.on("sendDataCart", (event, args) => {
  console.log("Send Data Cart inside electron handler...");
  // console.log(args);
  // const payload = {datacart : 'datacart from ipc-electron-react'}

  let datacart_mock = fs.readFileSync(
    path.join(__dirname, "/mock/tetras_datacart.json")
  );

  const payload = { datacart: JSON.parse(datacart_mock) };
  sendDataCart("I'm trying to send the dataCart through axios...", payload);
  // console.log('payload', payload)

  // doPostRequest("http://localhost:5500/sendDataCart", payload);
});

// handler per registrazione client
ipcMain.on("registerClient", (event, data) => {
  registerClient();
});

ipcMain.on("loadTest", () => {
  console.log("Load Test inside electron handler...");
  // console.log(args);
  // const payload = {datacart : 'datacart from ipc-electron-react'}

  let datacart_mock = fs.readFileSync(
    path.join(__dirname, "/mock/generate.json")
  );

  const payload = { datacart: JSON.parse(datacart_mock) };
  sendDataCart(
    "I'm trying to send the load test dataCart through axios...",
    payload
  );
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
    AsyncMethods.waitPortListening(5500, registerClient);
  } catch (error) {
    console.error("Error inside startkl ", error);
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

const registerClient = async () => {
  console.log("Inside register client function");

  let datamodel_conf_raw = fs.readFileSync(
    path.join(__dirname, "/mock/TetrasDataModel.json")
  );

  let action_conf_raw = fs.readFileSync(
    path.join(__dirname, "/mock/ActionConfTetras.json")
  );

  const pack = {
    dmx: JSON.parse(datamodel_conf_raw),
    acx: JSON.parse(action_conf_raw),
    type: "REGISTER",
    // dmx: datamodel_conf_raw,
  };
  // console.log("Parsed DMX ...");
  // console.log(pack);
  console.log("Sending the register request...");
  mainWindow.webContents.send(
    "consoleMessages",
    "Sending the register request through axios..."
  );

  try {
    // let response = doPostRequest("http://localhost:5500/register", pack);
    let res = await axios.post("http://localhost:5500/register", pack);
    if (res.status < 200 || res.status > 299) {
      throw new Error("Invalid response");
    }
    let data = res.data;
    console.log("data ", data);
    let consoleMessage = "I got register response --> " + data.message;
    mainWindow.webContents.send("consoleMessages", consoleMessage);
  } catch (error) {
    console.log("error in registerclient call : " + error.message);
    mainWindow.webContents.send(
      "consoleMessages",
      "Error while registering the client --> " + error.message
    );
  }
};

const sendDataCart = async (message, payload) => {
  mainWindow.webContents.send("consoleMessages", message);

  try {
    // let response = doPostRequest("http://localhost:5500/register", pack);
    let res = await axios.post("http://localhost:5500/sendDataCart", payload);
    if (res.status < 200 || res.status > 299) {
      throw new Error("Invalid response in sendDataCart");
    }
    let data = res.data;
    let consoleMessage = "I got sendDataCart response -->" + data.message;
    mainWindow.webContents.send("consoleMessages", consoleMessage);
  } catch (error) {
    console.log("error in sendatacart call : " + error.message);
    mainWindow.webContents.send(
      "consoleMessages",
      "Error while sending the dataCart --> " + error.message
    );
  }
};

const loadTest = () => {};

async function doPostRequest(endpoint, payload) {
  try {
    let res = await axios.post(endpoint, payload);

    if (res.status < 200 || res.status > 299) {
      throw new Error("Invalid response");
    }
    let data = res.data;
    console.log("I got response... ", data);
    return data;
  } catch (error) {
    throw new Error(`error for POST to ${endpoint} : ${error.message}`);
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
