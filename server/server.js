var app = require('express')();
var http = require('http').createServer(app);

var MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/socketChatRoom";

var io = require('socket.io')(http);

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    //Write databse Insert/Update/Query code here..
    console.log('mongodb is running!');
    db.close(); //關閉連線
});

app.get('/', (req, res) => res.send('hello!'));
app.get('/historycomment', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var msg = Array()
    MongoClient.connect(url, function (err, client) {
        if (err) throw err;
        const db = client.db("msgData");
        const collection = db.collection('datas');
        collection.find({}).toArray(function (err, comments) {
            if (comments && comments.length > 0) {
                res.end(JSON.stringify(comments));
            }
            return true;
        })
        client.close(); //關閉連線
    });
    res.end(JSON.stringify(msg));
});

io.on('connection', (socket) => {
    console.log(socket.id, 'connected');
    socket.on('message', (msg) => {
        const sessionID = socket.id;
        const address = socket.handshake.address.toString();
        const totalmsg = "[" + address + "]：" + msg;
        socket.broadcast.emit('MSGSEND', totalmsg);
        console.log(sessionID, address, msg, 'are sned!');
        insertMsg(totalmsg, address);
    });
});

function insertMsg(userMsg) {
    MongoClient.connect(url, function (err, client) {
        if (err) throw err;
        //Write databse Insert/Update/Query code here..
        const db = client.db("msgData");
        const collection = db.collection('datas');
        collection.insertOne(
            { msg: userMsg }
        )
        client.close(); //關閉連線
    });
}

http.listen(3000, () => {
    console.log('listening on *:3000');
});