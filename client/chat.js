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

// function getMessages() {
//     axios.get(`${url}/message/get-messages`).then((res) => {
//         // console.log(res.data)
//         renderMessages(res.data)
//     }).catch((err) => {
//         console.log(err)
//     })
// }

let lastMessageId = localStorage.getItem('lastMessageId') || -1;
const MAX_MESSAGES = 1000;

function getMessages() {
    axios.get(`${url}/message/get-messages?lastmsgId=${lastMessageId}`).then((res) => {
        const messages = res.data;
        if (messages.length > 0) {

            lastMessageId = messages[messages.length - 1].id;

            localStorage.setItem('lastMessageId', lastMessageId);

            let storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
            if (storedMessages.length > 1000) {
                storedMessages.splice(0, storedMessages.length - MAX_MESSAGES)
            }
            localStorage.setItem('messages', JSON.stringify([...storedMessages, ...messages]));

            // Render messages
            renderMessages(JSON.parse(localStorage.getItem('messages')));
        }
    }).catch((err) => {
        console.log(err);
    });
}


function renderMessages(data) {
    console.log(data)

    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = ''


    data.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        if (message.name === username) {
            messageElement.classList.add('user-message');
            messageElement.innerHTML = `<span class="username">${message.name}</span><div class="user-message-content">${message.message}</div>`;
        } else {
            messageElement.classList.add('other-message');
            messageElement.innerHTML = `<span class="name">${message.name}</span><div class="message-content">${message.message}</div>`;
        }
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;

    });
}

setInterval(getMessages, 5000);
window.addEventListener('DOMContentLoaded', () => {
    token = localStorage.getItem('token')
    username = localStorage.getItem('user')
    const welcome = document.getElementById('welcome')
    welcome.innerHTML = `Start Messaging, ${username}`
    // checkPremium(localStorage.getItem('isPremium') === 'true')
    getLoggedInUsers()
    getMessages()
});