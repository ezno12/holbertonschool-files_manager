import router from './routes/index';

const express = require('express')
const app = express()
const port = process.env.PORT || 5000

router(app)

app.listen(port, () => {
  console.log(`Example app listening on port ${PORT}`)
})