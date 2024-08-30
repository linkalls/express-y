import axios from "axios"
import express from "express"
const app = express()

app.set("view engine", "ejs")
app.set("views", "./views")
app.use(express.static("public"))

app.get("/",async(req,res)=>{
  const result = await axios.get("https://invidious.jing.rocks/api/v1/trending?region=JP")
  const domain = req.headers.host
  res.render("index",{result: result.data,domain})  
})  

app.get("/search",async(req,res)=>{
console.log(req.query)
  const result = await axios.get(`https://invidious.jing.rocks/api/v1/search?q=${req.query.q}&region=JP`)
  const domain = req.headers.host
  res.render("search", {result: result.data,domain})
})

app.get("/watch",(req,res)=>{
  const videoId = req.query.v
  res.render("pages", {videoId})
})

app.listen(3000, () => {
  console.log("hello")
})
