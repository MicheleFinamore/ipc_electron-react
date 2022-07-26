import "./App.css";
import { useState, useEffect, useCallback } from "react";
import ConsoleItem from "./components/console/ConsoleItem";
import CustomButton from "./components/Ui/CustomButton";

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

    setMessages(prevMessages =>([...prevMessages, 'Test Console']) )
  };

  return (
    <div className="App">
      <div className="app-content">
        <div className="commands">
          <CustomButton handler={registerClient} text={'Register Client'} />
          <CustomButton handler={testDataCart} text={'Send DataCart'} />
          <CustomButton handler={()=> setMessages([])} text={'Clear Console'} />
          <CustomButton handler={testConsole} text={'Test Console'} />
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
