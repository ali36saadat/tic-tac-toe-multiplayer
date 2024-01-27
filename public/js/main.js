//SOCKET IO
const socket = io()

//VARIABLES
let name = "",
   myID = Math.random().toString(16).slice(2),
   round,
   myValue,
   myValueIcon,
   tip = 1,
   roomNumber = "",
   snackbarValue = false

const point = [0, 0]

//FUNCTIONS

//----  STEP 1  ----

//FIND PLAYER (REQUEST)
document.querySelector("#find").addEventListener("click", function () {
   name = document.querySelector("#nameInput").value

   if (name) {
      socket.emit("find", {
         name: name,
         id: myID,
      })
      document.getElementById("nameTitle").innerText = "Your Name"
      document.querySelector("#loadingGif").classList.remove("hidden")
      document.getElementById("find").style.display = "none"
      document.getElementById("nameInput").disabled = true
      document.querySelector("#changeForm").classList.add("hidden")
   }
})

//FIND PLAYER (RESPONSE)
socket.on("find", (e) => {
   activeRound()

   roomNumber = e.roomNumber
   document.querySelector(".entryName").classList.add("hidden")
   document.querySelector(".entryRound").classList.remove("hidden")
   document.querySelector("#loadingGif").classList.add("hidden")
   document.getElementById("chatSection").classList.remove("hidden")
   document.getElementById("playersStatusSection").classList.add("hidden")
   document.querySelector("#opponentName").textContent = e.opponentName
   let oppID
   let value

   oppID = e.id
   oppName = e.name
   value = e.value
   myValue = e.myValue
   myValueIcon = e.icon
})

//CREATE ROOM (REQUEST)
document.querySelector("#createRoomBtn").addEventListener("click", function () {
   name = document.querySelector("#nameInput").value
   if (name != "") {
      document.getElementById("nameTitle").innerText = "Your Name"
      document.querySelector("#loadingGif").classList.remove("hidden")
      document.getElementById("nameInput").disabled = true
      document.querySelector("#inviteForm").classList.add("hidden")
      document.querySelector("#changeForm").classList.add("hidden")

      socket.emit("createRoom", { name: name, id: myID })
   }
})

//CREATE ROOM (RESPONSE)
socket.on("createRoom", (e) => {
   document.querySelector("#ticketBox").classList.remove("hidden")
   document.querySelector("#roomCode").textContent = e.roomCode
})

//FIND ROOM (REQUEST)
document.querySelector("#joinRoomBtn").addEventListener("click", function () {
   name = document.querySelector("#nameInput").value
   if (name != "") {
      const searchRoomCode = document.querySelector("#roomCodeInput").value
      socket.emit("searchRoom", { name: name, id: myID, code: searchRoomCode })
   }
})

//CHANGE FORM BUTTON
document.querySelector(".changeForm").addEventListener("click", function () {
   const tagText = document.querySelector(".changeForm")
   document.querySelector("#inviteForm").classList.toggle("hidden")
   document.querySelector("#searchForm").classList.toggle("hidden")

   if (tagText.id == "Invite") {
      tagText.id = "Search"
      tagText.textContent = "SEARCH PLAYER"
      tagText.classList =
         "changeForm w-36 text-sm mx-auto mt-5 mb-1 border-2 border-black rounded text-center md:w-44 md:border-4 md:text-lg lg:w-52 mx-auto lg:text-xl"
   } else if (tagText.id == "Search") {
      tagText.id = "Invite"
      tagText.textContent = "JOIN/CREATE ROOM"
      tagText.classList =
         "changeForm w-40 text-sm mx-auto mt-5 mb-1 border-2 border-black rounded text-center md:w-56 md:border-4 md:text-lg lg:w-64 mx-auto lg:text-xl"
   }
})

//----  STEP 2  ----

//ACTIVE ROUND STEP
function activeRound() {
   activeChat()

   //ROUND (REQUEST)
   document.getElementById("ready").addEventListener("click", function () {
      let roundNumber = document.getElementById("roundInput").value
      if (roundNumber !== "") {
         document.getElementById("ready").style.display = "none"
         document.getElementById("roundInput").disabled = true
         document.querySelector("#waitGif").classList.remove("hidden")

         socket.emit("round", {
            round: roundNumber,
            roomNumber: roomNumber,
            myValue: myValue,
         })
      }
   })

   //ROUND (RESPONSE)
   socket.on("round", (e) => {
      activePlaying()

      if (e.round <= 0) {
         round = Infinity
      } else {
         round = e.round
      }

      if (name != "") {
         document.getElementById("roundsLeft").innerText = round
         document
            .querySelector(".playersPointsBoard")
            .classList.remove("hidden")
         document.querySelector(".entryRound").classList.add("hidden")
         document.getElementById("loadingGif").classList.add("hidden")
         document.getElementById("nameInput").style.display = "none"
         document.getElementById("find").style.display = "none"
         document.getElementById("nameInput").style.display = "none"
         document.getElementById("boardGame").classList.remove("hidden")
      }

      if (myValue === 1) {
         document.querySelector("#turnName").textContent = "You"
      } else {
         document.querySelector("#turnName").textContent = "Opponent"
      }
      turn()
   })
}

//----  STEP 3  ----

//ACTIVE PLAYING STEP
function activePlaying() {
   //PLAYING (REQUEST)
   document.querySelectorAll(".btn").forEach((e) => {
      e.addEventListener("click", function () {
         if (tip == myValue) {
            lockBoard()
            e.classList.add("cursor-pointer")
            socket.emit("playing", {
               roomNumber: roomNumber,
               value: myValueIcon,
               id: e.id,
            })
         } else {
            e.classList.remove("cursor-pointer")
            snackFunc()
         }
      })
   })

   //PLAYING (RESPONSE)
   socket.on("playing", (e) => {
      const foundObject = e

      if (tip == 1) {
         p1id = foundObject.p1.p1move
         p2id = ""
      } else {
         p1id = ""
         p2id = foundObject.p2.p2move
      }

      if (p1id != "") {
         document.getElementById(`${p1id}`).innerHTML =
            '<img src="../public/img/O.png" alt="O" class="w-12 h-12 md:w-16 md:h-16 m-auto" />'
         document.getElementById(`${p1id}`).value = "O"
      }
      if (p2id != "") {
         document.getElementById(`${p2id}`).innerHTML =
            '<img src="../public/img/X.png" alt="X" class="w-12 h-12 md:w-16 md:h-16 m-auto" />'
         document.getElementById(`${p2id}`).value = "X"
      }

      p1id = ""
      p2id = ""
      foundObject.p1.p1move = ""
      foundObject.p2.p2move = ""
      foundObject.sum = 1

      turn()
      if (check(foundObject.sum)) {
         e.p1.p1move = ""
         e.p2.p2move = ""
         e.sum = 1
         foundObject.sum = 1
         p1id = ""
         p2id = ""
      }
   })

   //CHECK BOARD
   function check() {
      document.getElementById("btn1").value == ""
         ? (b1 = "a")
         : (b1 = document.getElementById("btn1").value)
      document.getElementById("btn2").value == ""
         ? (b2 = "b")
         : (b2 = document.getElementById("btn2").value)
      document.getElementById("btn3").value == ""
         ? (b3 = "c")
         : (b3 = document.getElementById("btn3").value)
      document.getElementById("btn4").value == ""
         ? (b4 = "d")
         : (b4 = document.getElementById("btn4").value)
      document.getElementById("btn5").value == ""
         ? (b5 = "e")
         : (b5 = document.getElementById("btn5").value)
      document.getElementById("btn6").value == ""
         ? (b6 = "f")
         : (b6 = document.getElementById("btn6").value)
      document.getElementById("btn7").value == ""
         ? (b7 = "g")
         : (b7 = document.getElementById("btn7").value)
      document.getElementById("btn8").value == ""
         ? (b8 = "h")
         : (b8 = document.getElementById("btn8").value)
      document.getElementById("btn9").value == ""
         ? (b9 = "i")
         : (b9 = document.getElementById("btn9").value)

      if (
         (b1 == b2 && b2 == b3) ||
         (b4 == b5 && b5 == b6) ||
         (b7 == b8 && b8 == b9) ||
         (b1 == b4 && b4 == b7) ||
         (b2 == b5 && b5 == b8) ||
         (b3 == b6 && b6 == b9) ||
         (b1 == b5 && b5 == b9) ||
         (b3 == b5 && b5 == b7)
      ) {
         finishGame(tip)
         return 1
      } else {
         let z = 0
         for (let i = 1; i <= 9; i++) {
            if (
               document.getElementById(`btn${i}`).value == "O" ||
               document.getElementById(`btn${i}`).value == "X"
            ) {
               z++
            }
         }
         if (z == 9) {
            finishGame(36)
            return 1
         }
      }
   }

   //FINISH GAME
   function finishGame(num) {
      round = Number(round) - 1
      document.querySelector("#roundsLeft").textContent = round
      if (num <= 2) {
         if (num == myValue) {
            point[0]++
            document.querySelector("#opponentPointNumber").textContent =
               point[0]
         } else {
            point[1]++
            document.querySelector("#MyPointNumber").textContent = point[1]
         }
      }

      if (round == 0) {
         document.querySelector("#boardGame").classList.add("hidden")
         document.querySelector("#lobbyButton").classList.remove("hidden")

         if (point[0] == point[1]) {
            document.querySelector("#roundsLeftTitle").innerText = "Draw"
            document.querySelector("#turnTitle").innerText =
               "draw is better than loss"
         } else if (point[0] < point[1]) {
            document.querySelector("#roundsLeftTitle").innerText = "YOU WIN"
            document.querySelector("#turnTitle").innerText = "You Are #1"
         } else {
            document.querySelector("#roundsLeftTitle").innerText = "You Lose"
            document.querySelector("#turnTitle").innerText = "try again and win"
         }
      }
      if (num == 3 || round != 0) {
         resetBoard()
         turn()
      }

      socket.emit("gameOverRoom", { roomNumber: roomNumber })
   }

   //RESET BOARD
   function resetBoard() {
      document.querySelectorAll(".btn").forEach((e) => {
         e.innerHTML = ""
         e.disabled = false
         e.value = ""
      })
   }

   //CHANGE TURN
   function turn() {
      tip == 1 ? (tip = 2) : (tip = 1)

      if (tip != myValue) {
         document.querySelector("#turnName").textContent = "Opponent"
         document.querySelectorAll(".btn").forEach((e) => {
            e.disabled = false
            e.classList.remove("cursor-pointer")
            e.classList.add("cursor-default")
         })
      } else {
         document.querySelector("#turnName").textContent = "You"
         document.querySelectorAll(".btn").forEach((e) => {
            e.classList.remove("cursor-default")
            e.classList.add("cursor-pointer")
            if (e.value != "") {
               e.classList.remove("cursor-pointer")
               e.classList.add("cursor-default")
               e.disabled = true
            }
         })
      }
   }

   //LOCK BOARD
   function lockBoard() {
      document.querySelectorAll(".btn").forEach((e) => {
         e.disabled = false
         e.classList.remove("cursor-pointer")
         e.classList.add("cursor-default")
      })
   }

   //SNACKBAR
   function snackFunc() {
      if (snackbarValue === false) {
         snackbarValue = true
         const x = document.getElementById("snackbar")
         x.className = "show"
         setTimeout(function () {
            snackbarValue = false
            x.className = x.className.replace("show", "")
         }, 2000)
      }
   }

   activeLobbyButton()
}

//ACTIVE CHAT
function activeChat() {
   document.querySelector("#chatBtn").addEventListener("click", function () {
      document.querySelector("#chatBox").classList.remove("hideBox")
      document.querySelector("#chatContainer").classList.remove("hidden")
      document.querySelector("#chatBox").classList.add("showBox")
      document.querySelector("#chatBtn").classList.add("hidden")
   })

   document
      .querySelector("#closeChatBtn")
      .addEventListener("click", function () {
         document.querySelector("#chatBox").classList.remove("showBox")
         document.querySelector("#chatBox").classList.add("hideBox")

         setTimeout(function () {
            document.querySelector("#chatContainer").classList.add("hidden")
            document.querySelector("#chatBtn").classList.remove("hidden")
         }, 450)
      })

   //SEND MY MESSAGE
   document.querySelector("#SendBtn").addEventListener("click", function () {
      const inputText = document.querySelector("#messageInput").value
      const message = `<div class="max-w-56 bg-gray-100 mr-2 p-1 rounded-lg rounded-br-none mb-2 self-end">${inputText}</div>`
      document
         .getElementById("messages")
         .insertAdjacentHTML("beforeend", message)
      socket.emit("sendMessage", {
         text: inputText,
         myValue: myValue,
         roomNumber: roomNumber,
      })
      document.querySelector("#messageInput").value = ""
   })

   //RECEIVE OPPONENT MESSAGE
   socket.on("sendMessage", (e) => {
      const message = `<div class="max-w-56 bg-gray-100 ml-2 p-1 rounded-lg rounded-bl-none mb-2 self-start">${e}</div>`

      document
         .getElementById("messages")
         .insertAdjacentHTML("beforeend", message)
   })
}

//ACTIVE LOBBY BUTTON FUNCTION
function activeLobbyButton() {
   //BACK TO LOBBY BUTTON
   document
      .querySelector("#lobbyButton")
      .addEventListener("click", function () {
         location.reload()
      })
}

//STOP GAME (DISCONNECT)
socket.on("stopGame", () => {
   document.querySelector("#boardGame").classList.add("hidden")
   document.querySelector("#entryRound").classList.add("hidden")
   document.querySelector("#entryName").classList.add("hidden")
   document.querySelector("#lobbyButton").classList.remove("hidden")
   document.querySelector(".playersPointsBoard").classList.remove("hidden")
   document.querySelector(".rightPointBoard").classList.add("hidden")
   document.querySelector(".leftPointBoard").classList.add("hidden")
   document.querySelector(".centerPointBoard").classList.remove("hidden")
   document.querySelector("#chatSection").classList.add("hidden")
   document.querySelector("#roundsLeftTitle").innerText = "You Win"
   document.querySelector("#turnTitle").innerText =
      "The Opponent Was Disconnected"
   activeLobbyButton()
})

//----  CONNECTION  ----

//SEND MY DISCONNECT MESSAGE
window.addEventListener("beforeunload", function (e) {
   socket.emit("clientDisconnect", {
      ID: myID,
      name: name,
      roomNumber: roomNumber,
   })
   socket.emit("gameOverRoom", { roomNumber: roomNumber })
})

//RECEIVE NUMBER OF CONNECTED CLIENTS
socket.on("clientsNumber", (e) => {
   document.querySelector("#onlinePlayersNumber").textContent = e.clientOnline
})

//SEND MY CONNECT MESSAGE
socket.on("connect", () => {
   socket.emit("clientConnect", myID)
})

//RECEIVE NUMBER OF MATCHES
socket.on("matchesNumber", (e) => {
   document.querySelector("#matchesNumber").textContent = e.matchesNumber
})
