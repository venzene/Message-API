// const path= require('path');
// const express = require('express');
// const bodyParser = require('body-parser');
// const mongoose= require('mongoose');
// const multer = require('multer');

// const feedRoutes = require('./routes/feed');
// const authRoutes = require('./routes/auth');

// const app = express();

// const fileStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'images');
//     },
//     filename: (req, file, cb) => {
//         cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     if (
//       file.mimetype === 'image/png' ||
//       file.mimetype === 'image/jpg' ||
//       file.mimetype === 'image/jpeg'
//     ) {
//       cb(null, true);
//     } else {
//       cb(null, false);
//     }
// };

// app.use(bodyParser.json()); // application/json
// app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
// app.use('/images', express.static(path.join(__dirname, 'images')));

// app.use((req, res, next)=>{
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// })

// app.use('/feed', feedRoutes);
// app.use('/auth', authRoutes);

// app.use((error, req, res, next)=> {
//     console.log(error);
//     const status = error.statusCode || 500;
//     const message = error.message;
//     const data = error.data;
//     res.status(status).json({message: message, data: data});
// });

// mongoose.connect('mongodb+srv://mangal:mangalprasad@cluster0.xutnbhc.mongodb.net/messages?retryWrites=true&w=majority&appName=Cluster0')
// .then(result => {
//     const server = app.listen(8080);
//     console.log('Connected!!');
//     const io = require('socket.io')(server);
//     io.on('connection', socket => {
//         console.log('Client connected!!');
//     });
// })
// .catch(err => console.log(err));


const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const http = require('http');


const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware for file storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json()); // application/json
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

// CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Routes
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// MongoDB connection and server setup
mongoose.connect('mongodb+srv://mangal:mangalprasad@cluster0.xutnbhc.mongodb.net/messages?retryWrites=true&w=majority&appName=Cluster0')
  .then(result => {
    // Use http to create server
    const server = http.createServer(app);
    
    // const io = require('socket.io')(server, {
    //   cors: {
    //     origin: "*", // Adjust this to your client's origin
    //     methods: ["GET", "POST"]
    //   }
    // });
    const io = require('./socket').init(server);

    io.on('connection', socket => {
      console.log('Client connected!!');
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    server.listen(8080, () => {
      console.log('Server is running on port 8080');
      console.log('Connected to MongoDB');
    });
  })
  .catch(err => console.log(err));
