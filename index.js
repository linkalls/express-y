import axios from "axios"
import express from "express"
import expressLayouts from "express-ejs-layouts"
import { exec } from "child_process"
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

async function getBestFormat(videoId) {
  return new Promise((resolve, reject) => {
    exec(`yt-dlp -F "https://www.youtube.com/watch?v=${videoId}"`, (error, stdout) => {
      if (error) {
        return reject(error)
      }
      const formats = stdout
        .split("\n")
        .slice(4)
        .map((line) => line.trim().split(/\s+/))
      const videoFormats = formats.filter((format) => format[1] === "mp4" && format[2] !== "audio")
      const bestFormat = videoFormats.reduce((best, current) => {
        const bestResolution = parseInt(best[2].split("x")[1], 10)
        const currentResolution = parseInt(current[2].split("x")[1], 10)
        return currentResolution > bestResolution ? current : best
      }, videoFormats[0])
      resolve(bestFormat[0])
    })
  })
}

async function getVideoAndAudioUrls(videoId, userAgent) {
  return new Promise((resolve, reject) => {
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const format = isIOS 
      ? 'best[ext=mp4][height<=1080]'
      : 'bestvideo[ext=webm][height<=1080]+bestaudio[ext=m4a]/best[ext=webm]/best';

    exec(`yt-dlp -f "${format}" --get-url "https://www.youtube.com/watch?v=${videoId}"`, (error, stdout) => {
      if (error) {
        return reject(error);
      }
      const urls = stdout.trim().split('\n');
      const videoUrl = urls[0];
      const audioUrl = isIOS ? null : urls[1];
      resolve({ videoUrl, audioUrl });
    });
  });
}

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
  const userAgent = req.headers['user-agent'];
  console.log(videoId);
  try {
    const result = await axios.get(`https://invidious.jing.rocks/api/v1/videos/${videoId}`);
    const { videoUrl, audioUrl } = await getVideoAndAudioUrls(videoId, userAgent);

    const recommendations = result.data.recommendedVideos || [];
    const title = result.data.title;
    const description = result.data.descriptionHtml;

    res.render("watch", { title, videoId, recommendations, description, videoUrl, audioUrl });
  } catch (error) {
    console.error("Error fetching video details:", error);
    res.status(500).send("Error fetching video details");
  }
});

app.listen(3000, () => {
  console.log("hello")
})
