const express = require('express');
const fs = require('fs');
const cors = require('cors');
const db = require("./database")
const app = express();

var logger = async function (req, res, next) {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    fs.writeFile('logger.txt', ip+'\n', { flag: 'a+' }, err => {});
}

app.use((express.urlencoded({ extended: true })))
app.use(cors());
// app.use(logger)

app.get('/', (req, res) => {
    res.send('Hello World');
})

// --- START GET LIST ---

// Status: COMPLETED
// Description: Get the total count of rooms.
app.get('/getTotalRooms', async (req, res) => {
    try {
        const query = 'SELECT COUNT(*) as total FROM ROOM';
        db.query(query, (err, rows, fields) => {
            if (!err){
                res.send(rows[0]);
            }
            else{
                console.log(err)
            }
        })

    } catch (err) {
        
    }
})

// Status: COMPLETED
// Description: Get the total count of notified rooms.
app.get('/getNotifiedRooms', async (req, res) => {
    try {
        const query = 'SELECT count(*) as count FROM notification GROUP BY ref_room';
        db.query(query, (err, rows, fields) => {
            if (!err) {
                res.send({count:rows.length})
            } else {
                console.log(err)
            }
        })
    } catch (err) {
        
    }
})

// Status: COMPLETED
// Description: Get the most notified room in the database
app.get('/getMostNotifiedRoom', async (req, res) => {
    try {
        const query = 'SELECT room.room_name as name, count(*) as count FROM notification, room WHERE notification.ref_room = room.room_id GROUP BY ref_room ORDER BY count DESC LIMIT 1';
        db.query(query, (err, rows, fields) => {
            if (!err) {
                res.send(rows[0])
            } else {
                console.log(err)
            }
        })
    } catch (err) {
        
    }
})

// Status: COMPLETED
// Description: Get the count of recharges and repairs that have been made in the day 
app.get('/getCountOfRR', async (req, res) => {
    try {
        const query = "SELECT COUNT(*) as count FROM history WHERE history_date = DATE_FORMAT(NOW(),'%d/%m/%Y')";
        db.query(query, (err, rows, fields) => {
            if (!err) {
                res.send(rows[0])
            } else {
                console.log(err)
            }
        })
    } catch (err) {
        
    }
})

// Status: COMPLETED
// Description: Get all notifications grouped by room
app.get('/getNotifications', async (req, res) => {
    const query = 'SELECT b.building_name as building, r.room_name as room, n.notification_reason as reason, COUNT(*) as count FROM notification n, building b, room r WHERE n.ref_room = r.room_id AND r.ref_building = b.building_id GROUP BY r.room_name, n.notification_reason;'
    db.query(query, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
})

// Status: COMPLETED
// Description: Get all rooms of a build
app.get('/getRooms', async (req, res) => {
    let id = req.query.building_id;
    try {
        const query = 'SELECT * FROM room WHERE ref_building = ' + id;
        db.query(query, (err, rows, fields) => {
            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    } catch (err) {
     
    }
})

// Status: COMPLETED
// Description: Get a specific room by name
app.get('/getRoomByName', async (req, res) => {
    let name = req.query.room_name
    try {
        const query = "SELECT * FROM room WHERE room_name = '" + name + "';";
        db.query(query, (err, rows, fields) => {
            if (!err) {
                res.send(rows[0])
            } else {
                console.log(err)
            }
        })
    } catch (err) {
     
    }
})

// Status: COMPLETED
// Description: Get all builds
app.get('/getBuilds', async (req, res) => {
    try {
        const query = 'SELECT * FROM building';
        db.query(query, (err, rows, fields) => {
            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    } catch (err) {
        
    }
})

// Status: COMPLETED
// Description: Get all rooms
app.get('/getBuildsName', async (req, res) => {
    try {
        const query = 'SELECT building_name as name FROM building';
        db.query(query, (err, rows, fields) => {
            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    } catch (err) {
        
    }
})

// Status: COMPLETED
// Description: Get complete history
app.get('/getHistory', async (req, res) => {
    try {
        const query = "SELECT history_building as build, history_room as room, CONCAT(history_date, ' ', history_time) as datetime, history_action as reason, history_count as count FROM history";
        db.query(query, (err, rows, fields) => {
            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    } catch (err) {
        
    }
})

// Status: COMPLETED
// Description: Get name, lastname and img avatar 
app.get('/getUser', async (req, res) => {
    const email = req.query.email;
    try {
        const query = "SELECT user_name as name, user_lastname as lastname, user_icon_url as url FROM user WHERE user_email = '" + email + "'"
        db.query(query, (err, rows, fields) => {
            if (!err) {
                res.send(rows[0])
            } else {
                console.log(err)
            }
        })
    } catch (err) {
        
    }
})

app.post('/getIdRoom', async (req, res) => {
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
// --- END GET LIST ---

// --- START POST LIST ---
app.post('/sendNotification', async (req, res) => {
    const { room, action, comment } = req.body;
    if (room && action) {
        try {
            const query = `INSERT INTO notification (notification_date,notification_time,notification_comment,notification_reason,ref_room)VALUES(DATE_FORMAT(NOW(),'%d/%m/%Y'),DATE_FORMAT(NOW(),'%H:%i:%s'),'${comment}','${action}',(SELECT room_id FROM room WHERE room_name = '${room}'))`;
            db.promise().query(query)
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
    else{
        res.status(400).send({
            confirm: false,
            comment: 'You need to add a room'
        })
    }
})

app.post('/postRR', async (req, res) => {
    let { build, room, date, time, reason, count, room_id } = req.body;
    if (build && room && date && time && reason && count && room_id) {
        try {
            const query = "DELETE FROM notification WHERE notification_reason = '" + reason + "' AND ref_room = " + room_id +";";
            db.promise().query(query);
    
            const query2 = "INSERT INTO history (history_building, history_room, history_date, history_time, history_action, history_count) VALUES ('" + build + "', '" + room + "', '" + date + "', '" + time + "', '" + reason + "', '" + count + "')";
            db.promise().query(query2);
            res.status(200).send({
                confirm: true
            })
        } catch (error) {
            res.status(400).send({
                confirm: false
            })
        }
    } else {
        res.status(400).send({
            confirm: false
        })
    }
    
    // Hay que deletear y luego agregar con la misma info
})

// Status: COMPLETED
// Description: Post a new Room 
app.post('/postRoom', async (req, res) => {
    const { name, capacity, refBuild } = req.body;
    if (name && capacity && refBuild) {
        try {
            const query = "INSERT INTO room (room_name, room_capacity, ref_building) VALUES ('"+ name +"', "+ capacity +", "+ refBuild +");";
            db.promise().query(query)
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
    else{
        res.status(400).send({
            confirm: false,
            comment: 'You need to select a building name and nickname'
        })
    }
})

// Status: COMPLETED
// Description: Post a new Build 
app.post('/postBuilding', async (req, res) => {
    const { name, nick } = req.body;
    if (name && nick) {
        try {
            const query = "INSERT INTO building (building_name, building_nick) VALUES ('"+ name +"', '"+ nick +"');";
            db.promise().query(query)
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
    else{
        res.status(400).send({
            confirm: false,
            comment: 'You need to select a building name and nickname'
        })
    }
})
// --- END POST LIST ---

// --- START PATCH LIST ---
app.patch('/editBuilding', async (req, res) => {
    const { id, name, nick } = req.body;
    if (id && name && nick) {
        try {
            const query = "UPDATE building SET building_name = '" + name + "', building_nick = '" + nick + "' WHERE building_id = '" + id + "'";
            db.promise().query(query)
            res.status(200).send({
                confirm: true
            })
        } catch (err) {
            res.status(400).send({
                confirm: false
            })
            console.log("DATABASE LOGGER: " + err);
        }
    }
    else{
        res.status(400).send({
            confirm: false,
            comment: 'You need to select a building name and nickname'
        })
    }
})

app.patch('/editRoom', async (req, res) => {
    const { id, name, capacity, refBuild } = req.body;
    if (id && name && capacity && refBuild) {
        try {
            const query = "UPDATE room SET room_name = '" + name + "', room_capacity = " + capacity + ", ref_building = " + refBuild + " WHERE room_id = '" + id + "'";
            db.promise().query(query)
            res.status(200).send({
                confirm: true
            })
        } catch (err) {
            res.status(400).send({
                confirm: false
            })
            console.log("DATABASE LOGGER: " + err);
        }
    }
    else{
        res.status(400).send({
            confirm: false,
            comment: 'You need to select a building name and nickname'
        })
    }
})
// --- END PATCH LIST ---

// --- START DELETE LIST ---
app.delete('/deleteBuilding', async (req, res) => {
    const id = req.query.id;
    if (id) {
        try {
            const query = "DELETE FROM building WHERE building_id = " + id + ';';
            db.promise().query(query)
            res.status(200).send({
                confirm: true
            })
        } catch (err) {
            res.status(400).send({
                confirm: false
            })
            console.log("DATABASE LOGGER: " + err);
        }
    }
    else{
        res.status(400).send({
            confirm: false,
            comment: 'You need to select a building name and nickname'
        })
    }
})

app.delete('/deleteRoom', async (req, res) => {
    const id = req.query.id;
    if (id) {
        try {
            const query = "DELETE FROM room WHERE room_id = " + id + ';';
            db.promise().query(query)
            res.status(200).send({
                confirm: true
            })
        } catch (err) {
            res.status(400).send({
                confirm: false
            })
            console.log("DATABASE LOGGER: " + err);
        }
    }
    else{
        res.status(400).send({
            confirm: false,
            comment: 'You need to select a building name and nickname'
        })
    }
})
// --- END DELETE LIST ---

app.listen(3000, () => {
    console.log('Server is running on Port 3000');
})