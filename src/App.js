import "./App.css";
import { useState, useEffect } from "react";

// import {ipcRender} from 'electron'

function App() {
  const [showP, setShowP] = useState(false);
  
  useEffect(() => {
    console.log("ciao sono useEffect")
    window.ipc_renderer.onIncomingData((event,data) => {
      console.log("Ho ricevuto dati dal server", data)
    })
  },[])


  // window.ipc_renderer.onIncomingData((event,data) => {
  //   // event.preventDefault()
  //   // event.stopImmediatePropagation()
  //   console.log(event);
  //   console.log("dati ricevuti dalla get", data);
  // } );

  const mainMessage = async ( ) => {
    const message = await window.ipc_renderer.getFromMain()
    console.log(message);
  }

  const handleClick = () => {
    console.log(`I'm sending ${JSON.stringify({message : 'datacart'})}`);
    let temp = showP;
    setShowP(prevShow => !prevShow);
    window.ipc_renderer.sendDatacart({message : 'datacart'});
    
  };

  return (
    <div>
      <button onClick={handleClick}>Test send electron</button>
      {showP && <p>Ho inviato un payload al main </p>}
      <button onClick={mainMessage}>Get message from main</button>
    </div>
  );
}

export default App;
