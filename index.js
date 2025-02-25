import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());

const players = [];

class Player {
  constructor(id) {
    this.id = id;
  }
}

app.get("/join", (req, res) => {
  const id = `${Math.random()}`;
  const player = new Player(id);
  players.push(player);
  res.send({ id });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
