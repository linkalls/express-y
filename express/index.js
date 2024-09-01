import axios from "axios";
import express from "express";
import expressLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverIp = '192.168.11.38'; // 固定IPアドレス

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");
app.use(express.static(path.join(__dirname, "public")));


app.get("/", async (req, res) => {
  try {
    const result = await axios.get(`http://${serverIp}:8080/api/v1/trending?region=JP`);
    const domain = req.headers.host;
    res.render("index", { title: "ホーム", result: result.data, domain,serverIp });
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    res.status(500).send("Error fetching trending videos");
  }
});

app.get("/search", async (req, res) => {
  const query = req.query.q;
  const page = parseInt(req.query.page) || 1;
  const domain = req.headers.host;

  try {
    const result = await axios.get(`http://${serverIp}:8080/api/v1/search`, {
      params: {
        q: query,
        page: page,
        region: 'JP'
      }
    });

    res.render("search", { 
      title: `${query} の検索結果`, 
      result: result.data, 
      query: query, 
      page: page, 
      domain: domain ,
      serverIp
    });
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).send("Error fetching search results");
  }
});

app.get("/watch", async (req, res) => {
  const videoId = req.query.v;

  try {
    const result = await axios.get(`http://${serverIp}:8080/api/v1/videos/${videoId}`);

    const recommendations = result.data.recommendedVideos || [];
    const title = result.data.title;
    const description = result.data.descriptionHtml;

    res.render("watch", { title, videoId, recommendations, description ,serverIp});
  } catch (error) {
    console.error("Error fetching video details:", error);
    res.status(500).send("Error fetching video details");
  }
});

app.listen(3000, () => {
  console.log(`Server is running on http://${serverIp}:3000`);
});