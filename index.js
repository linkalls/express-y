import axios from "axios"
import express from "express"
import expressLayouts from "express-ejs-layouts"
const app = express()

app.set("view engine", "ejs")
app.set("views", "./views")
app.use(expressLayouts)
app.set("layout", "layout")
app.use(express.static("public"))
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.get("/", async (req, res) => {
  const result = await axios.get("https://invidious.jing.rocks/api/v1/trending?region=JP")
  const domain = req.headers.host
  res.render("index", { title: "ホーム", result: result.data, domain })
})

app.get("/search", async (req, res) => {
  console.log(req.query)
  const result = await axios.get(`https://invidious.jing.rocks/api/v1/search?q=${req.query.q}&region=JP`)
  const domain = req.headers.host
  res.render("search", { title: `検索結果: ${req.query.q}`, result: result.data, domain })
})
app.get("/watch", async (req, res) => {
  const videoId = req.query.v
  try {
    const result = await axios.get(`https://invidious.jing.rocks/api/v1/videos/${videoId}`)

    // 推奨事項とコメントを取得
    const recommendations = result.data.recommendedVideos || []
    const title = result.data.title
    const description = result.data.descriptionHtml

    

    res.render("watch", { title, videoId, recommendations, description })
  } catch (error) {
    console.error("Error fetching video details:", error)
    res.status(500).send("Error fetching video details")
  }
})

app.listen(3000, () => {
  console.log("hello")
})
