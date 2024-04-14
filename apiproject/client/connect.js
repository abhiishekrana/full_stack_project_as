// const express = require('express');
// const app = express();
// const axios = require('axios');
// // Importing module
// const mysql = require('mysql2')

// const connection = mysql.createConnection({
// 	host: "localhost",
// 	user: "root",
// 	password: "Abhi@123",
// 	database: "quadbtech"
// })

// // Connecting to database
// connection.connect(function (err) {
// 	if (err) {
// 		console.log("Error in the connection")
// 		console.log(err)
// 	}
// 	else {
// 		console.log(`Database Connected`)
// 	}
// })


//2
const express = require('express');
const app = express();
const axios = require('axios');
const mysql = require('mysql2');
const cors = require('cors');
app.use(cors());

// Create MySQL connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Abhi@123",
    database: "quadbtech"
});

// Connecting to the database
connection.connect(function (err) {
    if (err) {
        console.error("Error in the connection:", err.message);
    } else {
        console.log(`Database Connected`);
    }
});

// Fetch data from the API
async function fetchData() {
    try {
        const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
        if (Array.isArray(response.data)) {
            // If response.data is an array, return it directly
            return response.data.slice(0, 10); // Slice to get only the first 10 objects
        } else {
            // If response.data is not an array, handle it accordingly
            console.error('Unexpected API response format:', typeof(response.data));
            return [];
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return [];
    }
}


// Insert data into the database
async function insertData(data) {
    const insertQuery = `INSERT INTO crypto_table (base_unit, quote_unit, low, high, last, type, open, volume, sell, buy, at, name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    for (let item of data) {
        try {
            await connection.promise().execute(insertQuery, [item.base_unit, item.quote_unit, item.low, item.high, item.last, item.type, item.open, item.volume, item.sell, item.buy, item.at, item.name]);
            console.log('Data inserted successfully.');
        } catch (error) {
            console.error('Error inserting data:', error.message);
        }
    }
}

// Define routes
app.get('/fetch-and-insert', async (req, res) => {
    const data = await fetchData();
    await insertData(data);
    res.send('Data fetched and inserted successfully.');
});

//best price api
app.get('/crypto_data',  async(req, res) => {
        const [rows, fields] =  await connection.promise().execute('SELECT MAX(SELL) as bestprice FROM crypto_table');
        const bestPrice = rows[0].bestprice; // Extract the best price from the first row of the result
        console.log("Best price:", bestPrice);
        res.json({ "data" : {bestPrice} });

});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

