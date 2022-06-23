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
    const { cdf, ctf, id } = req.body;
    if (id) {
        try {
            db.promise().query(`INSERT INTO notification(notification_date, notification_time, ref_room) VALUES('${cdf}', '${ctf}', ${id});`)
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
    db.query('SELECT b.building_name as building, r.room_name as room, n.notification_reason as reason, COUNT(*) as count FROM notification n, building b, room r WHERE n.ref_room = r.room_id AND r.ref_building = b.building_id GROUP BY r.room_name, n.notification_reason;', (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
})

app.post('/getIdRoom', (req, res) => {
    // THIS GET IS ONLY FOR ADMIN VIEW USE

    // Get all notifications on the database
    // grouping by the room and add the count of the notifications.
    const { room } = req.body;
    let query = "SELECT room_id FROM room WHERE room.room_name = '" + room + "';";
    db.query(query, (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]);
        } else {
            console.log(err);
        }
    });
})

app.get('/getHistory', (req, res) => {
    // THIS GET IS ONLY FOR ADMIN VIEW USE

    // Get the history of actions maked on the admin view
    // like the repair of classrooms and the recharge of dispensers.
    res.send('getHistory Works!');
})

app.get('/getClassrooms', (req, res) => {
    // THIS GET IS ONLY FOR ADMIN VIEW USE

    // Get all classroom to add to the classrooms view
    db.query('SELECT * FROM room;', (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
})

app.get('/getBuildings', (req, res) => {
    // THIS GET IS ONLY FOR ADMIN VIEW USE

    // Get all classroom to add to the classrooms view
    db.query('SELECT * FROM building;', (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
})

app.post('/postClassroom', (req, res) => {
    // THIS POST IS ONLY FOR ADMIN VIEW USE

    // Post a new classroom to being added to the database
    res.send('postClassroom Works!');
})

app.post('/postBuilding', (req, res) => {
    // THIS POST IS ONLY FOR ADMIN VIEW USE

    // Post a new classroom to being added to the database
    res.send('postClassroom Works!');
})

app.post('/postRR', (req, res) => {
    // THIS POST IS ONLY FOR ADMIN VIEW USE

    // Send to the database when completed an action
    // if anyone repair a classroom or recharge a dispenser
    // delete the notifications and add a new record on the
    // history table.
    res.send('postRR Works!');
})


app.listen(3000, () => {
    console.log('Server is running on Port 3000');
})