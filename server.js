const http = require("http");
const nodeStatic = require("node-static");

const port = process.env.PORT || 5000;

const fileServer = new nodeStatic.Server("./public");
http.createServer(function(req, res) {
    fileServer.serve(req, res);
}).listen(port);
