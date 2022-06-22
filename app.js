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
    // THIS POST IS ONLY FOR USER VIEW USE

    // make the selection of the existing classrooms
    // this prevent the url send notif.
    const { room } = req.body;
    if (room) {
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

app.get('/getNotifications', (req, res) => {
    // THIS GET IS ONLY FOR ADMIN VIEW USE

    // Get all notifications on the database
    // grouping by the room and add the count of the notifications.
    res.send('getNotifications Works!');
})

app.get('/getHistory', (req, res) => {
    // THIS GET IS ONLY FOR ADMIN VIEW USE

    // Get the history of actions maked on the admin view
    // like the repair of classrooms and the recharge of dispensers.
    res.send('getHistory Works!');
})

app.post('/postRR', (req, res) => {
    // THIS POST IS ONLY FOR ADMIN VIEW USE

    // Send to the database when completed an action
    // if anyone repair a classroom or recharge a dispenser
    // delete the notifications and add a new record on the
    // history table.
    res.send('postRR Works!');
})

app.get('/getClassrooms', (req, res) => {
    // THIS GET IS ONLY FOR ADMIN VIEW USE

    // Get all classroom to add to the classrooms view
    res.send('getClassrooms Works!');
})

app.post('/postClassroom', (req, res) => {
    // THIS POST IS ONLY FOR ADMIN VIEW USE

    // Post a new classroom to being added to the database
    res.send('postClassroom Works!');
})



app.listen(3000, () => {
    console.log('Server is running on Port 3000');
})