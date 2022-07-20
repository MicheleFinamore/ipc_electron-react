async function postData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", 
    mode: "cors", 
    cache: "no-cache", 
    credentials: "same-origin", 
    headers: {
      "Content-Type": "application/json",
      
    },
    redirect: "follow", 
    referrerPolicy: "no-referrer", 
    body: JSON.stringify(data), 
  });
  
  if(response.status >= 200 && response.status <= 299){
    return await response.json()
    
  }else {
    throw Error({message : response.statusText})
  }

}

module.exports = {
  postData : postData
}