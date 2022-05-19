const express = require( 'express' );

require('./classroom');

const app = express();

//routes

app.use( require('./routes/google.routes'));

module.exports = app;
