const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var db = mysql.createPool({
    host: 'localhost',  
    user: 'root',       
    password: '', 
    database: 'oxinus'
});


// Create a basic route
app.post('/create-account', async (req, res) => {
    let { first_name, last_name, email, phone, password, birthday } = req.body;

    if (!first_name) {
        return res.status(400).json({ error: 'First name is required' });
    }
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [results] = await db.query('INSERT INTO account SET ?', {
            first_name,
            last_name,
            email,
            phone,
            password: hashedPassword,
            birthday
        });

        return res.status(201).json({ 
            status: true, 
            message: "Data created successfully", 
            data: { id: results.insertId } 
        });
    } catch (error) {
        console.error('Error in database operation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a basic route
app.get('/get-all-account', async (req, res) => {
    try {
        const data = await db.query('select * from account');
        let result = data[0];
        return res.status(200).json({ 
            status: true, 
            message: "Data fetch successfully", 
            data: result 
        });
    } catch (error) {
        console.error('Error -', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/* update endpint */
app.put('/update-account/:id', async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, phone, password, birthday } = req.body;

    try {
        // Check if the account exists
        const [existingUser] = await db.query('SELECT * FROM account WHERE id = ?', [id]);
        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        let updateData = { first_name, last_name, email, phone, birthday };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await db.query('UPDATE account SET ? WHERE id = ?', [updateData, id]);

        return res.status(200).json({
            status: true,
            message: "Account updated successfully"
        });
    } catch (error) {
        console.error('Error - ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


/* Delete account endpoint */
app.delete('/delete-account/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the account exists
        const [existingUser] = await db.query('SELECT * FROM account WHERE id = ?', [id]);
        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        await db.query('DELETE FROM account WHERE id = ?', [id]);

        return res.status(200).json({
            status: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error('Error - ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


