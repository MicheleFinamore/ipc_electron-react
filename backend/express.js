const express = require('express')
let app = express()

let server = app.listen(5500)

app.get('/', (req,res) => {
  res.status(200).json({message : 'Dentro la get del server'})
})

// server.listen(PORT, () => console.log('Server listening on port 5500'));