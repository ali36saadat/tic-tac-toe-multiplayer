document.getElementById("loading").style.display = "none"
document.getElementById("userCont").style.display = "none"
document.getElementById("oppNameCont").style.display = "none"
document.getElementById("valueCont").style.display = "none"
document.getElementById("whoTurn").style.display = "none"
const socket = io()

let name,
   myID,
   round,
   myValue,
   tip = 1,
   roomNumber,
   snackbarValue = false

const point = [0, 0]
let allPlayersArr

document.querySelector("#lobbyButton").addEventListener("click", function () {
   location.reload()
})

document.querySelector("#find").addEventListener("click", function () {
   name = document.querySelector("#nameInput").value

   if (name) {
      myID = Math.random().toString(16).slice(2)
      socket.emit("find", {
         name: name,
         id: myID,
      })
      document.getElementById("nameTitle").innerText = "Your Name"
      document.querySelector("#loading").style.display = "block"
      document.getElementById("find").style.display = "none"
      document.getElementById("nameInput").disabled = true
   }
})

socket.on("find", (e) => {
   allPlayersArr = e.allPlayers
   roomNumber = e.allPlayers.at(-1).roomNumber

   document.querySelector(".enterName").classList.add("hidden")
   document.querySelector(".enterRound").classList.remove("hidden")
   document.querySelector("#loading").style.display = "none"
})

document.getElementById("ready").addEventListener("click", function () {
   let roundNumber = document.getElementById("roundInput").value

   if (true) {
      document.getElementById("ready").style.display = "none"
      document.getElementById("roundInput").disabled = true

      socket.emit("round", { round: roundNumber })
   }
})

socket.on("round", (e) => {
   if (e.round <= 0) {
      round = Infinity
   } else {
      round = e.round
   }

   if (name != "") {
      document.getElementById("roundsLeft").innerText = round
      document.querySelector(".playersBoard").classList.remove("hidden")
      document.querySelector(".enterRound").classList.add("hidden")
      document.getElementById("loading").style.display = "none"
      document.getElementById("nameInput").style.display = "none"
      document.getElementById("find").style.display = "none"
      document.getElementById("nameInput").style.display = "none"
      document.getElementById("bigCont").classList.remove("hidden")
   }
   let oppName
   let oppID
   let value
   const foundObject = allPlayersArr.find(
      (obj) => obj.p1.player1ID == `${myID}` || obj.p2.player2ID == `${myID}`
   )
   if (foundObject.p1.player1ID == `${myID}`) {
      oppID = foundObject.p2.player2ID
      oppName = foundObject.p2.p2name
      value = foundObject.p1.p1value
      myValue = 1
   } else {
      oppID = foundObject.p1.player1ID
      oppName = foundObject.p1.p1name
      value = foundObject.p2.p2value
      myValue = 2
   }

   if (myValue === 1) {
      document.querySelector("#turnName").textContent = "You"
   } else {
      document.querySelector("#turnName").textContent = "Opponent"
   }
   document.getElementById("opponentName").innerText = oppName
   document.getElementById("value").innerText = value
   turn()
})

document.querySelectorAll(".btn").forEach((e) => {
   e.addEventListener("click", function () {
      if (tip == myValue) {
         e.classList.remove("cursor-default")
         e.classList.add("cursor-pointer")

         let value = document.getElementById("value").innerText
         e.innerText = value
         socket.emit("playing", { value: value, id: e.id, playerID: myID })
      } else {
         e.classList.add("cursor-default")
         e.classList.remove("cursor-pointer")
         snackFunc()
      }
   })
})

socket.on("playing", (e) => {
   const foundObject = e.allPlayers[roomNumber]

   if (tip == 1) {
      p1id = foundObject.p1.p1move
      p2id = ""
   } else {
      p1id = ""
      p2id = foundObject.p2.p2move
   }

   if (p1id != "") {
      document.getElementById(`${p1id}`).innerHTML =
         '<img src="../img/X.png" alt="X" class="w-16 h-16 m-auto" />'
      document.getElementById(`${p1id}`).value = "X"
      // document.getElementById(`${p1id}`).disabled = true
      // document.getElementById(`${p1id}`).style.color = "black"
   }
   if (p2id != "") {
      document.getElementById(`${p2id}`).innerHTML =
         '<img src="../img/O.png" alt="O" class="w-16 h-16 m-auto" />'
      document.getElementById(`${p2id}`).value = "O"
      // document.getElementById(`${p2id}`).disabled = true
      // document.getElementById(`${p2id}`).style.color = "black"
   }

   p1id = ""
   p2id = ""
   foundObject.p1.p1move = ""
   foundObject.p2.p2move = ""
   foundObject.sum = 1

   turn()
   if (check(foundObject.sum)) {
      e.allPlayers[roomNumber].p1.p1move = ""
      e.allPlayers[roomNumber].p2.p2move = ""
      e.allPlayers[roomNumber].sum = 1
      foundObject.sum = 1
      p1id = ""
      p2id = ""
   }
})
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

function finishGame(num) {
   round = Number(round) - 1
   document.querySelector("#roundsLeft").textContent = round
   if (num <= 2) {
      if (num == myValue) {
         point[0]++
         document.querySelector("#opponentPointNumber").textContent = point[0]
      } else {
         point[1]++
         document.querySelector("#MyPointNumber").textContent = point[1]
      }
   }

   if (round == 0) {
      document.querySelector("#bigCont").classList.add("hidden")
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
         document.querySelector("#turnTitle").innerText = ""
      }
   }
   if (num == 3 || round != 0) {
      // setTimeout(() => {
      //    resetBoard()
      // }, 2000)
      resetBoard()
      turn()
   }
}

function resetBoard() {
   document.querySelectorAll(".btn").forEach((e) => {
      e.innerHTML = ""
      e.disabled = false
      e.value = ""
   })
}

function turn() {
   tip == 1 ? (tip = 2) : (tip = 1)

   if (tip != myValue) {
      document.querySelector("#turnName").textContent = "Opponent"
      document.querySelectorAll(".btn").forEach((e) => {
         e.disabled = false
      })
   } else {
      document.querySelector("#turnName").textContent = "You"
      document.querySelectorAll(".btn").forEach((e) => {
         if (e.value != "") {
            e.disabled = true
         }
      })
   }
}

function snackFunc() {
   if (snackbarValue === false) {
      snackbarValue = true
      const x = document.getElementById("snackbar")
      x.className = "show"
      setTimeout(function () {
         snackbarValue = false
         x.className = x.className.replace("show", "")
      }, 3000)
   }
}
