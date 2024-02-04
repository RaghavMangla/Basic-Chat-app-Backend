import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from "path";

const app = express();
//-----------------Deployment----------------
// const __dirname = path.resolve();

// app.use(express.static(path.join(__dirname, "/client/dist")));

// app.get("*",(req,res)=>{
//     res.sendFile(path.join(__dirname,"client","dist","index.html"));
// })

//------------------Deployment----------------



const port = process.env.PORT || 3000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const secretKeyJWT = "cvsbdfgbsvcaxavavj";

app.get("/", (req, res) => {
  res.send("Hello bhai raghav, kaisa hai");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "aasdfdsvwbhrevadvb" }, secretKeyJWT);

  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({
      message: "Login success",
    });
});

//just like express middleware jo bhi mujhe calculation ya check karna hai wo mai kar sakta hun
io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;

    if (!token) return next(new Error("Authentication error"));

    const decoded = jwt.verify(token, secretKeyJWT);

    next();
  });
  //jab mai next ko call karunga kisi cndtn mei sirf tabhi jake niche wala code run hoga
});

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  socket.on("message", ({ message, room }) => {
    console.log(message);
    socket.to(room).emit("receive-message", message);
  });

  socket.on("join-room", (roomName) => {
    socket.join(roomName);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
