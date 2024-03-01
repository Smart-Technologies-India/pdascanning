const express = require("express");
const next = require("next");
const { parse } = require("url");
const fs = require("fs");

const port = parseInt(process.env.PORT, 8888) || 8888;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev: true });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use("/upload", express.static(__dirname + "/upload"));

  server.all("*", (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;

    if (pathname.startsWith("/file")) {
      try {
        const name = pathname.split("/").pop();
        const ext = ".pdf";
        const filepath = `F:/PDA DIGITIZATION/2024-03-01/${name}${ext}`;
        console.log("filepath", filepath);
        const stream = fs.createReadStream(filepath);
        res.setHeader("Content-disposition", 'inline; filename="output.pdf"');
        res.setHeader("Content-type", "application/pdf");

        stream.on("error", (err) => {
          if (err.code === "ENOENT") {
            // File not found error
            res.status(404).send("File not found");
            res.end();
          } else {
            // Some other error occurred
            console.error(err);
            res
              .status(500)
              .send("An error occurred while trying to access the file.");
            res.end();
          }
        });

        stream.pipe(res);
      } catch (e) {
        console.log("error", e);
        res
          .status(500)
          .send("An error occurred while trying to process the request.");
        res.end();
      }
    } else {
      return handle(req, res);
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
