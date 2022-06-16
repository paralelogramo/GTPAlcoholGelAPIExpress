const express = require('express');
const cors = require('cors');
const db = require("./database")
const app = express();

app.use((express.urlencoded({ extended: true })))
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.post('/sendNotification', (req, res) => {
    const { room } = req.body;
    if (room){
        try {            
            db.promise().query(`INSERT INTO notification(fecha, sala) VALUES(now(), '${room}');`)
            res.status(201).send({
                confirm: true
            })   
        } catch (err) {
            res.status(400).send({
                confirm: false
            })   
            console.log("DATABASE LOGGER: " + err);
        }
    }
})

app.listen(3000, () => {
    console.log('Server is running on Port 3000');
})