const express = require('express');
const cors = require('cors');
const routerApi = require('./routes');
const { logErrors,
  errorHandler,
  sequelizeHandler,
  boomErrorHandler } = require('./middlewares/error.handler')

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cors());

require ('./utils/auth');

app.get('/api', (req, res) => {
  res.send('Express Server');
})

app.get('/status', (req, res) => {
    res.json({
        message: 'Microservicio funcionando correctamente USUARIOS',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

routerApi(app);

app.use(logErrors);
app.use(boomErrorHandler);
app.use(sequelizeHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}/`);
});

