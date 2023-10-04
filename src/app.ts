import express from 'express'

const app = express()
const PORT = 3003

app.get('/', () => {})

app.listen(PORT, () => {
  console.log('App running')
})
