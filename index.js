import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

// APP SETUP
const appSettings = {
    databaseURL: "https://solo-project-champions-24347-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementsInDB = ref(database, "endorsements")

// DOM MANIPULATION
const textareaEl = document.getElementById("textarea")
const senderInputEl = document.getElementById("sender")
const receiverInputEl = document.getElementById("receiver")
const publishBtnEl = document.getElementById("publish-btn")
const endorsementsEl = document.getElementById("endorsements")

// LISTEN FOR CLICKS ON BUTTON AND PUSH VALUES
publishBtnEl.addEventListener("click", function() {
    let values = {
        textareaValue: textareaEl.value,
        senderInputValue: senderInputEl.value,
        receiverInputValue: receiverInputEl.value,
        likes: 0,
        isLiked: false
    }
    
    if (values.textareaValue === "") {
        alert("Please write your endorsement")
    }
    else if (values.senderInputValue === "") {
        alert("Who is endorsing?")
    }
    else if (values.receiverInputValue === "") {
        alert("Who are you endorsing?")
    }
    else {
        push(endorsementsInDB, values)
        clearTextElements()
    }
})

// CLEAR TEXT ELEMENTS
function clearTextElements() {
    textareaEl.value = ""
    senderInputEl.value = ""
    receiverInputEl.value = ""
}

// GET VALUES AND CALL APPEND FUNCTION
onValue(endorsementsInDB, function(snapshot) {
    if (snapshot.exists()) {
        let endorsementsArray = Object.entries(snapshot.val()).reverse()
    
        clearEndorsementsEl()
        
        for (let i = 0; i < endorsementsArray.length; i++) {
            let currentEndorsement = endorsementsArray[i]
            let currentEndorsementId = currentEndorsement[0]
            let currentEndorsementValue = currentEndorsement[1]
            
            appendEndorsementToEndorsementsEl(currentEndorsement)    
        }
        // EVENT LISTENER FOR LIKE FEATURE
        document.addEventListener("click", function(e) {
            if (e.target.dataset.like) {
                handleLikeClick(e.target.dataset.like, endorsementsArray)
            }
        })
    }
})

// CLEAR ENDORSEMENTS ELEMENT
function clearEndorsementsEl() {
    endorsementsEl.innerHTML = ""
}

// APPEND VALUES AND RENDER TO PAGE
function appendEndorsementToEndorsementsEl(endorsement) {
    let endorsementId = endorsement[0]
    let endorsementValue = endorsement[1]
    let endorsementText = endorsementValue.textareaValue
    let sender = endorsementValue.senderInputValue
    let receiver = endorsementValue.receiverInputValue
    let likeCount = endorsementValue.likes
    let newEl = document.createElement("li")
    
    newEl.innerHTML += `
        <p class="bold-text">To: ${receiver}</p>
        <p>${endorsementText}</p>
        <div class="bottom-text">
            <p class="bold-text">From: ${sender}</p>
            <div class="like-text">
                <button class="like-btn" data-like="${endorsementId}">❤</button>
                <p class="bold-text">${likeCount}</p>
            </div>
        </div>
    `
    
    endorsementsEl.append(newEl)
}

// ADD OR REMOVE LIKE ON CLICK
function handleLikeClick(endorsementId, endorsementsArray) {
    const targetObj = endorsementsArray.find(function(e) {
        return e[0] === endorsementId
    })
    
    let currentEndorsement = targetObj[1]
    
    if (currentEndorsement.isLiked) {
        currentEndorsement.likes--
    }
    else {
        currentEndorsement.likes++
    }
    
    currentEndorsement.isLiked = !currentEndorsement.isLiked
    
    set(ref(database, `endorsements/${endorsementId}/likes`),
    currentEndorsement.likes & currentEndorsement.isLiked)
}
