const server = require('./server.js')
const process = require('process');

const APP_PORT = process.env.PORT || 8080

// Start Server
server.listen(APP_PORT, () => console.log(`Server started on ${APP_PORT}`));