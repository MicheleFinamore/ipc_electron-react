import "./App.css";
import { useState, useEffect, useCallback } from "react";
import ConsoleItem from "./components/console/ConsoleItem";

// import {ipcRender} from 'electron'

function App() {
  const [messages, setMessages] = useState(['Application Started...']);



  // gestisce i messaggi in arrivo da electron durante le operazioni e li aggiunge allo state messages per stamparli a video sulla console del client
  const consoleMessagesHandler = useCallback(
    (data) => {
      const currMessages = [...messages ];
      currMessages.push(data);
      setMessages(currMessages);
    },
    [messages]
  );

  useEffect(() => {
    const removeListener = window.ipc_renderer.receive(
      "consoleMessages",
      consoleMessagesHandler
    );

    return () => {
      if (removeListener) removeListener();
    };
  }, [consoleMessagesHandler]);

  // window.ipc_renderer.onIncomingData((event,data) => {
  //   // event.preventDefault()
  //   // event.stopImmediatePropagation()
  //   console.log(event);
  //   console.log("dati ricevuti dalla get", data);
  // } );

  const registerClient = () => {
    window.ipc_renderer.send("registerClient", "");
    const currMessages = [...messages ];
    currMessages.push("I'm registering the client");
    
    setMessages(currMessages);
  };

  const testDataCart = () => {
    console.log(`I'm sending ${JSON.stringify({ message: "datacart" })}`);
    const currMessages = [...messages ];
    currMessages.push(`I'm sending ${JSON.stringify({ message: "datacart" })} to electron`);
    setMessages(currMessages);
    window.ipc_renderer.send("sendDataCart", { message: "datacart" });
    // window.ipc_renderer.sendDatacart({ message: "datacart" });
  };

  const testConsole = () => {
    // const currMessages = [...messages]
    // currMessages.push('Test consoleeee')
    // setMessages(currMessages)
    setMessages(prevMessages =>([...prevMessages, 'Test Console']) )
  };

  return (
    <div className="App">
      <div className="app-content">
        <div className="commands">
          <button className="customButton" onClick={testDataCart}>
            Send DataCart
          </button>
          <button className="customButton" onClick={registerClient}>
            Register Client
          </button>
          <button className="customButton" onClick={testConsole}>
            Test Console
          </button>
          <button className="customButton" onClick={()=> setMessages([])}>
            Clear Console
          </button>
        </div>

        <div className="log-container">
          {messages.map((elem, index) => {
            return <ConsoleItem text={elem} key={index}></ConsoleItem>;
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
