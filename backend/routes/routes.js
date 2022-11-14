const { Router, request, response } = require("express");

const router = Router();

router.get("", (request, response) => {
  response.send("Risposta");
});

//////////
//* Chiamata per ottenere l'url dell'ADFS corrispondente all'APP_KEY passato come query param
/////////
router.get("/callAuthMain", (request, response) => {
  const { APP_KEY } = request.query;
  console.log("APP_KEY : ", APP_KEY);
  setTimeout(() => {
    response.status(200).send({
      message: "Response from callAuthMain",
      APP_KEY,
      ADFS_URL: "http://localhost:3990/api/callADFS",
      ADFS_METHOD: "POST",
    });
  }, 3000);
});

//////////
//* Chiamata all'ADFS che una volta terminata risponderà con la redirect alla pagina di login
/////////
router.get("/callADFS", (request, response) => {
    setTimeout(() => {
        response.redirect("http://127.0.0.1:5501/login%20form/index.html");
      }, 1500);
});

//////////
//* Chiamata Login, risponde con una redirect ok + il Token di autenticazione
/////////
router.post("/loginToADFS", (request, response) => {
  setTimeout(() => {
    response.redirect("http://example.com");
  }, 1500);
});

router.get("/jwt",(request,response) => {
    // response.setHeader('Authorization', 'Bearer 123')
    setTimeout(() => {
      
        
        response.status(200).send({message : 'endpoint jwt response'})
    }, 1500);
})

router.get('/redirectToElectron',(request,response) => {
  response.redirect('http://localhost:5600/token?token=12345')
})

//////////
//* Chiamata Server Smart ANT autenticazione, legge il token e risponde con autenticato
/////////
router.post("/smartAntAuthentication",(req,response) => {
    const {token} = req.body

    if(token){
      console.log('token received', token);
        response.status(200).send({message : 'AUTH',token})
    }
})


module.exports = router;
