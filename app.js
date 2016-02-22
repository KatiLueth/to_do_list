var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
// pg module
var pg = require('pg');
var connectionString = '';
if(process.env.DATABASE_URL != undefined) {
    connectionString = process.env.DATABASE_URL + 'ssl';
} else {
    connectionString = 'postgres://localhost:5432/To-Do';
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// post data
app.post('/new', function(req, res) {
    var addTask = {
        new_task: req.body.new_task,
        do_by_time: req.body.do_by_time,
        do_by_date: req.body.do_by_date,
        complete: req.body.complete
    };
    pg.connect(connectionString, function(err, client, done) {
        client.query('INSERT INTO tasks (task, goal_time, goal_date, complete) VALUES ($1, $2, $3, $4) RETURNING id',
        [addTask.new_task, addTask.do_by_time, addTask.do_by_date, addTask.complete],
        function (err, result) {
            done();
            if(err) {
                console.log("Error inserting data: ", err);
                res.send(false);
            } else {
                res.send(result);
            }
        });
    });
});
// update database :: delete/complete
app.post('/delete', function(req, res) {
    //console.log(req.body);
    var updateTask = {
        id: req.body.id
    };
    pg.connect(connectionString, function(err, client, done) {
        client.query('DELETE FROM tasks WHERE id = ($1);',
            [updateTask.id],
            function (err, result) {
                done();
                if(err) {
                    console.log("Error inserting data: ", err);
                    res.send(false);
                } else {
                    res.send(result);
                }
            });
    });
});
// update database :: delete/complete
app.post('/complete', function(req, res) {
    console.log(req.body);
    var updateTask = {
        complete: req.body.complete
    };
    pg.connect(connectionString, function(err, client, done) {
        client.query('UPDATE tasks SET complete = TRUE WHERE id = ($1)',
            [updateTask.complete],
            function (err, result) {
                done();
                if(err) {
                    console.log("Error updating data: ", err);
                    res.send(false);
                } else {
                    res.send(result);
                }
            });
    });
});





// get data
app.get('/new', function(req, res) {
    var results = [];
    pg.connect(connectionString, function (err, client, done) {
        var query = client.query('SELECT*FROM tasks ORDER BY goal_date ASC, goal_time ASC');

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // close connection
        query.on('end', function () {
            done();
            return res.json(results);
        });

        if (err) {
            console.log(err);
        }
    });
});












app.set('port', process.env.PORT || 5000);

app.listen(app.get('port'), function() {
    console.log('Listening on port: ', app.get('port'));
});


app.get('/*', function(req, res) {
    var file = req.params[0] || '/views/index.html';
    res.sendFile(path.join(__dirname, './public', file));
});
