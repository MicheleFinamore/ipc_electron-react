const fetch = require("electron-fetch").default;

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

  

  return response;
};

// module.exports = {
//     getAsync,
//     postAsync
// }
