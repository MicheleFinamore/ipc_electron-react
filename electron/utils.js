const fetch = require("electron-fetch").default;
const tcpPortUsed = require("tcp-port-used");


exports.getAsync = async (endpoint) => {
  try {
    let response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`response is not ok`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`error in getAsync from endpoint ${endpoint}`, error.message);
  }
};

exports.postAsync = async (endpoint = "", data = {}) => {
  const response = await fetch(endpoint, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    referrerPolicy: "no-referrer",
    redirect: "manual",
  });
 

  const resp = await response.json();
  return resp;
};



exports.waitPortListening = (port, callback) => {
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


// module.exports = {
//     getAsync,
//     postAsync
// }
