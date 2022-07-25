const { app, BrowserWindow, webContents, Menu } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const express = require("express");
const { ipcMain } = require("electron/main");
const express_app = express();
const tcpPortUsed = require("tcp-port-used");
const { execFile, exec } = require("node:child_process");

const fs = require("fs");
const axios = require("axios").default;
const chokidar = require("chokidar");
const os = require("os");

console.log(`CURRENT USERNAME : ${os.userInfo().username}`);

let mainWindow = null;

//Initialize watcher for folder
const watcher = chokidar.watch(
  path.join(__dirname, "/mock/communication_folder"),
  {
    persistent: true,
  }
);

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
    ? "http://localhost:3001"
    : `file://${path.join(__dirname, "../build/index.html")}`;

  const preloadUrl = isDev
    ? path.join(__dirname, "preload.js")
    : path.join(__dirname, "preload.js");

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 600,
    webPreferences: {
      // nodeIntegration: true,
      preload: preloadUrl,
      devTools: isDev,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(startUrl);

  mainWindow.show();

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

// handler per invio datacart
ipcMain.on("sendDataCart", (event, args) => {
  console.log("Send Data Cart ...");
  console.log(args);
  // const payload = {datacart : 'datacart from ipc-electron-react'}

  let datacart_mock = fs.readFileSync(
    path.join(__dirname, "/mock/datacart_mock.json")
  );

  const payload = { datacart: JSON.parse(datacart_mock) };
  sendDataCart("I'm trying to send the dataCart", payload);
  // console.log('payload', payload)

  // doPostRequest("http://localhost:5500/sendDataCart", payload);
});

// handler per registrazione client
ipcMain.on("registerClient", (event, data) => {
  registerClient();
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
      throw new Error(`Error in waitingUntilUse : ${err.message}`);
    }
  );
};

const registerClient = async () => {
  console.log("Inside register client");

  let datamodel_conf_raw = fs.readFileSync(
    path.join(__dirname, "/mock/custom_datamodel.json")
  );

  let action_conf_raw = fs.readFileSync(
    path.join(__dirname, "/mock/my_actionconf.json")
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
    "Sending the register request..."
  );

  try {
    // let response = doPostRequest("http://localhost:5500/register", pack);
    let res = await axios.post("http://localhost:5500/register", pack);
    if (res.status < 200 || res.status > 299) {
      throw new Error("Invalid response");
    }
    let data = res.data;
    console.log('data ', data)
    let consoleMessage = "I got register response --> " + data.message;
    mainWindow.webContents.send("consoleMessages", consoleMessage);
  } catch (error) {
    // console.log('error in register : '+ error.message);
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
    // console.log('error in register : '+ error.message);
    mainWindow.webContents.send(
      "consoleMessages",
      "Error while sending the dataCart --> " + error.message
    );
  }
};

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
