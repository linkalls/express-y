import axios from "axios"
import express from "express"
import expressLayouts from "express-ejs-layouts"
import { exec } from "child_process"
import path from "path"
import { fileURLToPath } from "url"
const app = express()

// __dirnameの代わりにfileURLToPathとimport.meta.urlを使用
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

async function getVideoUrl(videoId) {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, 'python/x.py');
    exec(`python "${pythonScriptPath}" ${videoId}`, (error, stdout, stderr) => {
      if (error) {
        reject(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (parseError) {
        reject(`JSON parse error: ${parseError.message}`);
      }
    });
  });
}

app.get("/watch", async (req, res) => {
  const videoId = req.query.v;
  try {
    const { video_url, audio_url, error } = await getVideoUrl(videoId);
    if (error) {
      throw new Error(error);
    }
    // 取得したURLをコンソールに表示
    console.log(`Video URL: ${video_url}`);
    console.log(`Audio URL: ${audio_url}`);
    res.render('watch', { videoUrl: video_url, audioUrl: audio_url, title: 'Video Title' });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(3000, () => {
  console.log("hello")
})
