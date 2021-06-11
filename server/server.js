import mongoose from mongoose
const Document = require("./Document");

// Connecting to DB
mongoose.connect("mongodb://localhost/collab-docs", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const PORT = 3001;
const defaultValue = "";

// SocketIO setup
const io = require("socket.io")(PORT, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


// ON -> (eventName, functionToBeExecuted)
// EMIT -> (eventName, dataToBeSent)

io.on("connection", (socket) => {

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
