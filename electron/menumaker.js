// const {app, Menu} = require('electron')

// const isMac = process.platform === 'darwin'

// const template = [{
//     label : 'File',
//     submenu : [
//         {
//             label : 'Open File',
//             click : async () => {
//                 // doOpenFile();
//             }
//         }
//     ]
// }]


// const portIsListening = (callback) => {
//     console.log("Inside port is listening");
//     tcpPortUsed.waitUntilUsed(5500, 500, 180000).then(
//       () => {
//         callback();
//       },
//       (err) => {
//         throw new Error("Error inside tcpPortUsed");
//       }
//     );
//   };
  
//   const registerClient = () => {
//     console.log("Inside register client");
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
//   };