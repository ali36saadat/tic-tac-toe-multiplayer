const express = require("express")
const app = express()

const http = require("http")
const { re } = require("mathjs")
const path = require("path")
const { Server } = require("socket.io")

const server = http.createServer(app)

const io = new Server(server)
app.use(express.static(path.resolve("")))
let rounds = []
let arrID = []
let arr = []
let playingArray = []

io.on("connection", (socket) => {
   socket.on("round", (e) => {
      if (e.round != null) {
         rounds.push(e.round)

         if (rounds.length >= 2) {
            let roundNumber
            if (rounds[0] == rounds[1]) {
               roundNumber = rounds[0]
            } else {
               roundNumber = 0
            }
            console.log(roundNumber)
            rounds.splice(0, 2)

            io.emit("round", { round: roundNumber })
         }
      }
   })

   socket.on("find", (e) => {
      if (e.name != null) {
         arr.push(e.name)
         arrID.push(e.id)

         if (arr.length >= 2) {
            let p1obj = {
               player1ID: arrID[0],
               playerNumber: 1,
               p1name: arr[0],
               p1value: "X",
               p1move: "",
            }
            let p2obj = {
               player2ID: arrID[1],
               playerNumber: 2,
               p2name: arr[1],
               p2value: "O",
               p2move: "",
            }

            let obj = {
               roomNumber: playingArray.length,
               p1: p1obj,
               p2: p2obj,
               sum: 1,
            }
            playingArray.push(obj)

            arr.splice(0, 2)
            arrID.splice(0, 2)

            io.emit("find", { allPlayers: playingArray })
         }
      }
   })

   socket.on("playing", (e) => {
      if (e.value === "X") {
         let objToChange = playingArray.find(
            (obj) => obj.p1.player1ID == e.playerID
         )

         objToChange.p1.p1move = e.id
         objToChange.sum++
      } else if (e.value === "O") {
         let objToChange = playingArray.find(
            (obj) => obj.p2.player2ID == e.playerID
         )

         objToChange.p2.p2move = e.id
         objToChange.sum++
      }

      io.emit("playing", { allPlayers: playingArray })
   })
})

app.get("/", (req, res) => {
   res.sendFile(path.join(__dirname, "index.html"))
})

server.listen(3000, () => {
   console.log(`Server is running at http://localhost:3000`)
})
