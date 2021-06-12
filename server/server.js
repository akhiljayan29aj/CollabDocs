const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Document = require("./Document");

dotenv.config({ path: "./config.env" });

const PASSWORD = process.env.PASSWORD;

// Connecting to DB
mongoose.connect(
  `mongodb+srv://akhiljayan29aj:${PASSWORD}@cluster0.embjk.mongodb.net/collab-docs?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
);

const PORT = process.env.PORT || 3001;
const defaultValue = "";

// SocketIO setup
const io = require("socket.io")(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ON -> (eventName, functionToBeExecuted)
// EMIT -> (eventName, dataToBeSent)

io.on("connection", (socket) => {
  console.log("Server is up and running");
  socket.on("get-document", async (documentId) => {
    const doc = await findOrCreateDoc(documentId);
    socket.join(documentId);
    socket.emit("load-document", doc.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("recieve-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

const findOrCreateDoc = async (id) => {
  if (id == null) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
};
