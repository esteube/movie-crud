var routes = require('routes')(),
  fs = require('fs'),
  qs = require('qs'),
  view = require('mustache'),
  mime = require('mime'),
  db = require('monk')('localhost/movies'),
  movies = db.get('movies');

  routes.addRoute('/movies', function(req, res, url){
  if (req.method === 'GET') {
      res.setHeader('Content-Type', 'text/html');
        movies.find({}, function (err, docs) {
          var file = fs.readFileSync('movies/index.html');
          var template = view.render(file.toString(), { movies: docs });
          res.end(template);
        });
      }
  if(req.method === 'POST') {
    var data = '';
    req.on('data', function(chunk){
      data += chunk;

    });

    req.on('end', function(){
      var movie = qs.parse(data);
      movies.insert(movie, function(err, doc){
        if (err) res.end('oops');
        res.writeHead(302, {'Location':'/movies'});
        res.end();
      });
    });
}
});
  routes.addRoute('/movies/new', function (req, res, url) {
    res.setHeader('Content-Type', 'text/html');
    if(req.method === 'GET') {
      res.setHeader('Content-Type', 'text/html');
    var file = fs.readFileSync('movies/new.html');
    var template = view.render(file.toString(), {});
    res.end(template);
    }
  });

  routes.addRoute('/movies/:id', function (req, res, url) {
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        url = url.params.id;
          movies.findOne({_id: url}, function (err, docs) {
            var file = fs.readFileSync('movies/show.html');
            var template = view.render(file.toString(), docs);
            res.end(template);
          });

    }

  });
  routes.addRoute('/public/*', function(req, res, url){
    res.setHeader('Content-Type', mime.lookup(req.url));
    fs.readFile('.' + req.url, function(err, file){
      if (err){
        res.setHeader('Content-Type', 'text/html');
        res.end('404');
      }
      res.end(file);
    });
  });
  routes.addRoute('/movies/:id/edit', function (req, res, url) {
    if (req.method === 'GET'){
    movies.findOne({_id: url.params.id}, function (err, docs) {
      var file = fs.readFileSync('movies/edit.html');
      var template = view.render(file.toString(), docs);
      res.end(template);
    });
  }
});
  routes.addRoute('/movies/:id/update', function (req, res, url) {
    if (req.method === 'POST'){
    var data = '';
    req.on('data', function (chunk) {
      data += chunk;
    });

    req.on('end', function() {
      var movie = qs.parse(data);
      movies.update({_id: url.params.id}, movie, function(err, doc) {
        if (err) throw err;
        res.writeHead(302, {'Location': '/movies'});
        res.end();

      });
    });
  }

});

  routes.addRoute('/movies/:id/delete', function (req, res, url) {
  if (req.method === 'POST') {
    res.setHeader('Content-Type', 'text/html');
    movies.remove({_id: url.params.id}, function(err, doc) {
      if (err) throw err;
      res.writeHead(302, {'Location': '/movies'});
      res.end();
    });
  }
});


module.exports = routes;
