const input = document.getElementById('input')
const messages = document.getElementById('messages')
const overflow = document.querySelector('.overflow')
const sendButton = document.getElementById('send')
let myWord = document.getElementById('form-control')
let userName = localStorage.getItem('user_name')

let userColor, socket, reflect
let oddMessage = true
let autoScroll = true

let word

function setup(){
	socket = io.connect('http://localhost:3000')

	socket.on('connect', ()=>{
		console.log(`socket chat id: ${socket.id}`)
	})

	socket.on('print_word',()=>{
		console.log(word)
		myWord.value = "You have to draw:  " + word;  
	})

	socket.on('send', (data)=>{

		addMessage(data)
		
		if (autoScroll) {
    		overflow.scrollTop = overflow.scrollHeight - overflow.clientHeight;
  		}
	})

	socket.on('get_changed_word', (wrd)=>{
		word = wrd;
		myWord.value = "";
		// console.log(word)
	})
}


// Respond to user input
function sendMessage(message) {
	  if (!message) return
	  
  	input.value = ''
	if (!userName) {
		userName = message
		sendButton.innerHTML = 'Chat'
		socket.emit('username', message)
		reflect = {
			name: userName,
			joined: true
		}
		addMessage(reflect)
		socket.emit('send', reflect)
		return
	}

	reflect = {
		sender: userName,
		message: message
	}
	if(message == word){
		reflect.guessed = true
		reflect.name = userName
		socket.emit('guess')
	}
	addMessage(reflect)
  	socket.emit('send', reflect)

  // The first message will be the user's name
  	
}

input.addEventListener('keydown', (e) => {
	if (e.keyCode === 13) {
		sendMessage(e.target.value)    	
	}
})


sendButton.addEventListener('click', (e) => {
	const input = document.getElementById('input')
	sendMessage(input.value)
})

function addMessage(data) {
	const newMsg = document.createElement('div')

	if (data.guessed){
		newMsg.innerHTML = `
			<span id="guess">${data.name} guessed the message!!</span>
		`
	}else if(data.joined){
		newMsg.innerHTML = `
			<span id="join">${data.name} joined the game!!</span>
		`
	}else{
		newMsg.innerHTML = `
			<span id="data">${data.sender}: ${data.message}</span>
		`
	}
  
	
	messages.insertBefore(newMsg, messages.childNodes[0])
	messages.appendChild(newMsg)
}



overflow.addEventListener('scroll', (e) => {
  autoScroll = false
  const overflow = e.target
  if (overflow.scrollTop === overflow.scrollHeight - overflow.clientHeight) {
    autoScroll = true
  }
})