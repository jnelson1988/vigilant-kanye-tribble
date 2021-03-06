const express  = require('express')
const request  = require('request')
const mysql    = require('mysql')
const app      = express()
const port     = 3000
const KanyeURL = 'http://api.kanye.rest'
let currentQuote = ''

const con      = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'kanye'
})
con.connect(err => console.log(err))


const getKanyeWrapper = (wisdom) => `
<h1>${wisdom}</h1>
<button onClick="addWisdom()">
  Add
</button>
<script>function addWisdom(){ fetch('/add') }</script>
`

const getKanyeQuoteCallback = (response) => (err, res, body) => {
    if(err) return console.log(err)
    currentQuote = body.quote
    response.send(getKanyeWrapper(body.quote))
}

const kanyeFetcher = (req, response) => {
    const KanyeCallback = getKanyeQuoteCallback(response)

    return request(KanyeURL, {json: true}, KanyeCallback)
}

const addQuote = (quote) => {
    const queryString = `insert into quotes(quote,created_at) values("${quote}", now());`
    con.query(queryString, (err, results, fields) => {
    if(err) console.log(err)
    })
}

const getBest = (req, res) => {
    con.query('select * from quotes where deleted_at is null order by created_at desc;', (err, results, fields)=>{
        if(err) console.log(err)
        res.send(`<h1>${results[0].quote}</h1>`)
    })
}

app.get('/', kanyeFetcher)

app.get('/add', (req,res) => {
    addQuote(currentQuote)
    res.sendStatus(200)
})

app.get('/best', getBest)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))