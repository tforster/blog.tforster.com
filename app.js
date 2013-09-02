"strict mode"

var express = require("express")
   , http = require("http")
   , path = require("path")
   , url = require("url")
   , Poet = require("poet")
   , Config = require("./config.json")

var settings = {}
   , port = parseInt(3000)
   , app = express();


var poet = Poet(app, {
   posts: "./_posts/",
   postsPerPage: 5,
   metaFormat: "json"
});


poet.watch(function () {
   console.log("poet watcher reloaded");
}).init().then(function () {
   console.log("poet watcher initialized");
});


poet.init().then(function () {
   console.log("poet initialized");
});


app.get("/", function (req, res) {
   // Grab top 5 posts 
   var posts = poet.helpers.getPosts(0, 5);
   res.render("page", {
      "posts": posts
   })
});


app.get("/rss", function (req, res) {
   // Only get the latest 5 posts
   var posts = poet.helpers.getPosts(0, 5);
   res.setHeader("Content-Type", "application/rss+xml");
   res.render("rss", { posts: posts });
});


app.get("/json", function (req, res) {
   // Only get the latest 5 posts for now, add page/offset later
   var posts = poet.helpers.getPosts(0, 5);
   res.setHeader("Content-Type", "application/json");
   res.json({ posts: posts });
});


app.get("/json/random", function (req, res) {
   // Short-term measure to supply random projects to tforster.com
   var posts = poet.helpers.postsWithCategory("projects");
   // Shuffle the array
   posts.sort(function () { return 0.5 - Math.random() });

   res.setHeader("Content-Type", "application/json");
   res.json({ posts: posts.splice(0, 3) });
});


app.configure(function () {
   if (Config.port) {
      app.set("port", parseInt(Config.port));
   }
   app.use(express.favicon());
   app.use(express.logger("dev"));
   app.use(express.bodyParser());
   app.use(express.methodOverride());
   app.set("view engine", "jade");
   app.set("views", __dirname + "/views");
   app.use(app.router);
   app.use(express.static(path.join(__dirname, "public")));
});


http.createServer(app).listen(app.get("port"), function () {
   console.log("Express server listening on port " + app.get("port"));
});