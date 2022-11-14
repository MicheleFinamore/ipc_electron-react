// const session = require('express-session')
// const groceriesRoute = require("./routes/groceries");
// const marketsRoute = require("./routes/markets");
const express = require("express");
const routes = require("./routes/routes");
const app = express(); // instance express application
const cors = require("cors");
const { getAllInstalledSoftware } = require("fetch-installed-software");
const PORT = 3990;

// getAllInstalledSoftware().then(data => {
//   data.forEach(elem => {if(elem.DisplayName) console.log(`elem: ${elem.DisplayName}`)});
// } )



// registra middleware. Sono funzioni che app invoca tra due "main operazioni" quindi ad esempio tra la richiesta //dell'utente e la risposta del server
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// custom middleware
app.use((req, res, next) => {
  console.log(`${req.method}: ${req.url}\n`);
  next();
});
app.use("/api", routes);
// app.use("/api", groceriesRoute);
// app.use("/api/supermarkets/", marketsRoute);

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
