const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
let users = [];
app.get('/users', (req, res) => {
    res.status(200).json(users);
});
app.post('/users', (req, res) => {
    const newUser = req.body;
    users.push(newUser);
    res.status(201).json({
        message: 'User added successfully',
        user: newUser
    });
});
app.put('/users/:index', (req, res) => {
    const index = parseInt(req.params.index);

    if (isNaN(index) || index < 0 || index >= users.length) {
        return res.status(404).json({
            message: 'User not found'
        });
    }
    users[index] = req.body;
    res.status(200).json({
        message: 'User updated successfully',
        user: users[index]
    });
});

/* DELETE - Delete a user */
app.delete('/users/:index', (req, res) => {
    const index = parseInt(req.params.index);

    if (isNaN(index) || index < 0 || index >= users.length) {
        return res.status(404).json({
            message: 'User not found'
        });
    }

    const deletedUser = users.splice(index, 1);

    res.status(200).json({
        message: 'User deleted successfully',
        user: deletedUser[0]
    });
});

/* Start the server */
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});