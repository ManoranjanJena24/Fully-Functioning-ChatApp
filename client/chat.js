let url = "http://localhost:3000"
let username

let token;
function logout() {
    console.log(token)
    axios.get(`${url}/user/logout`, { headers: { "Authorization": token } }).then((res) => {
        console.log(res)
        localStorage.clear()
        alert(res.data)
        window.location.href = 'login.html'
    }).catch(err => console.log(err))
}

function getLoggedInUsers() {
    axios.get(`${url}/user/online`).then((res) => {
        console.log(res.data.users)
    })
}

document.getElementById('messageForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const messageData = {
        message: document.getElementById('messageInput').value,
    };
    this.reset();
    sendMessage(messageData);
});

function sendMessage(data) {
    axios.post(`${url}/message/add-message`, data, { headers: { "Authorization": token } }).then((res) => {
        console.log(res)
        getMessages()
    }).catch((err) => {
        console.log(err)
    })
}

function getMessages() {
    axios.get(`${url}/message/get-messages`).then((res) => {
        // console.log(res.data)
        renderMessages(res.data)
    }).catch((err) => {
        console.log(err)
    })
}

function renderMessages(data) {
    console.log(data)
    data.forEach(message => {
        displayMessage(message.message, message.name, message.name === username)
    });
}

function displayMessage(message, name, isUserMessage) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    if (isUserMessage) {
        messageElement.classList.add('user-message');
        messageElement.innerHTML = `<span class="username">${name}</span><div class="user-message-content">${message}</div>`;
    } else {
        messageElement.classList.add('other-message');
        messageElement.innerHTML = `<span class="name">${name}</span><div class="message-content">${message}</div>`;
    }
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
window.addEventListener('DOMContentLoaded', () => {
    token = localStorage.getItem('token')
    username = localStorage.getItem('user')
    const welcome = document.getElementById('welcome')
    welcome.innerHTML = `Start Messaging, ${username}`
    // checkPremium(localStorage.getItem('isPremium') === 'true')
    getLoggedInUsers()
    getMessages()
});