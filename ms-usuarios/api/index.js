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
/*Para que cualquier cliente/dominio
pueda hacer peticiones a nuestra API*/
// const whitelist = ['http//localhost:8080'];//para permitir el acceso a dominios especificos
// const corsOptions = {
//   origin: (origin, callback) => {
//     if(whitelist.includes(origin) || !origin){
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }
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

