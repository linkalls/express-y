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
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


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
  const videoId = req.query.v;
  const result = await axios.get(`https://invidious.jing.rocks/api/v1/videos/${videoId}`);
  // console.log(result.data);

  // MP4形式の最高画質の動画URLを取得
  const highestQualityVideo = result.data.adaptiveFormats
    .filter((format) => format.type.includes("video/mp4"))
    .reduce((prev, current) => {
      return parseInt(prev.qualityLabel) > parseInt(current.qualityLabel) ? prev : current;
    });

  // AAC形式の音声URLを取得
  const audioFormat = result.data.adaptiveFormats.find((format) => format.type.includes("audio/mp4"));

  const videoUrl = highestQualityVideo ? highestQualityVideo.url : null;
  const audioUrl = audioFormat ? audioFormat.url : null;
  const title = result.data.title;

  console.log('Video URL:', videoUrl);
  console.log('Audio URL:', audioUrl);

  res.render("watch", { title, videoId, videoUrl, audioUrl });
});

app.listen(3000, () => {
  console.log("hello")
})
