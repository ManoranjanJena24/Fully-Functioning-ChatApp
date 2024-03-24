const toggleButton = document.querySelector('.dark-light');
const colors = document.querySelectorAll('.color');

colors.forEach(color => {
    color.addEventListener('click', (e) => {
        colors.forEach(c => c.classList.remove('selected'));
        const theme = color.getAttribute('data-color');
        document.body.setAttribute('data-theme', theme);
        color.classList.add('selected');
    });
});

toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

let url = "http://localhost:3000"
let username
let groupId
let groupName

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



document.getElementById('send-btn').addEventListener('click', function (event) {
    // event.preventDefault();
    const messageData = {
        message: document.getElementById('messageInput').value,
    };
    document.getElementById('messageInput').value = ''
    sendMessage(messageData);
});

function sendMessage(data) {
    axios.post(`${url}/message/add-message?groupId=${groupId}`, data, { headers: { "Authorization": token } }).then((res) => {
        console.log(res)
        getMessages()
    }).catch((err) => {
        console.log(err)
    })
}


let lastMessageId = localStorage.getItem('lastMessageId') || -1;
const MAX_MESSAGES = 1000;

function getMessages() {
    console.log('get msgs called')
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


    // const chatContainer = document.getElementById('chat-container');
    // chatContainer.innerHTML = ''


    data.forEach(message => {
        // console.log(message.groupId,"gorup id")
        if (message.groupId === groupId) {
            console.log(message)
            //     const messageElement = document.createElement('div');
            // messageElement.classList.add('message');

            // if (message.name === username) {
            //     messageElement.classList.add('user-message');
            //     messageElement.innerHTML = `<span class="username">${message.name}</span><div class="user-message-content">${message.message}</div>`;
            // } else {
            //     messageElement.classList.add('other-message');
            //     messageElement.innerHTML = `<span class="name">${message.name}</span><div class="message-content">${message.message}</div>`;
            // }
            // chatContainer.appendChild(messageElement);
            // chatContainer.scrollTop = chatContainer.scrollHeight;
        }


    });
}


// chat.js

function toggleCreateGroupForm() {
    const createGroupFormContainer = document.getElementById('createGroupFormContainer');
    createGroupFormContainer.classList.toggle('hidden');
}

// document.getElementById('createGroupForm').addEventListener('submit', function (event) {
//     event.preventDefault();
//     console.log('button')
//     const groupName = document.getElementById('groupNameInput').value;
//     createGroup(groupName);
// });
const createGroupForm = document.getElementById("createGroupForm");
const overlay = document.getElementById("overlay");
const createGroupButton = document.getElementById("createGroupButton");

createGroupForm.addEventListener("click", function () {

    overlay.style.display = "block";
});

createGroupButton.addEventListener("click", function () {
    console.log('Group created');
    const groupName = document.getElementById('groupName').value;
    createGroup(groupName)
    overlay.style.display = "none";
});

function createGroup(groupName) {
    console.log('Inside create group')
    axios.post(`${url}/group/create`, { groupName }, { headers: { "Authorization": token } })
        .then((res) => {
            console.log(res.data);
            // Refresh group list
            getGroups();
            // Hide the form
            toggleCreateGroupForm();
            // Clear input field
            document.getElementById('groupName').value = '';
        })
        .catch((err) => console.error(err));
}

function getGroups() {
    axios.get(`${url}/group/get-groups`, { headers: { "Authorization": token } })
        .then((res) => {
            const groups = res.data;
            renderGroups(groups);
        })
        .catch((err) => console.error(err));
}

// function renderGroups(groups) {
//     console.log(groups)
//     const groupArea=document.getElementById('groupArea')
//     groups.forEach((group)=>{
//         const groupDiv=document.createElement('div')
//         groupDiv.className='msg' //todo-className=msg active if that particular group is selected
//         const msgDiv=document.createElement('div')
//         msgDiv.className='msg-detail'
//         const username=document.createElement('div')
//         username.className='msg-username'
//         username.innerHTML=group.groupName

//         const contentDiv=document.createElement('div')
//         contentDiv.className='msg-content'

//         const lastMsg=document.createElement('span')
//         lastMsg.className='msg-message'
//         lastMsg.innerHTML='This is the last message' //todo

//         const lastMsgDate=document.createElement('span')
//         lastMsgDate.className='msg-date'
//         lastMsgDate.innerHTML='20m' //todo

//         contentDiv.appendChild(lastMsg)
//         contentDiv.appendChild(lastMsgDate)
//         msgDiv.appendChild(username)
//         msgDiv.appendChild(contentDiv)
//         groupDiv.appendChild(msgDiv)
//         groupArea.appendChild(groupDiv)
//     })

// }

function renderGroups(groups) {
    console.log(groups)
    const groupArea = document.getElementById('groupArea');
    groupArea.innerHTML = ''
    groups.forEach((group) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'msg';
        groupDiv.addEventListener('click', () => {

            groupId = group.id
            groupName = group.groupName
            document.getElementById('currentGroupNameId').innerHTML = groupName
            document.getElementById('currentGroupName').innerHTML = groupName
            console.log('group selected id', groupId)
            console.log('groupName', groupName)

            const allGroups = document.querySelectorAll('.msg.active');
            allGroups.forEach((g) => g.className = 'msg');
            let storedMessages = JSON.parse(localStorage.getItem('messages'))

            groupDiv.className = 'msg active'
            renderMessages(storedMessages)

        });

        const msgDiv = document.createElement('div');
        msgDiv.className = 'msg-detail';
        const username = document.createElement('div');
        username.className = 'msg-username';
        username.innerHTML = group.groupName;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'msg-content';

        const lastMsg = document.createElement('span');
        lastMsg.className = 'msg-message';
        lastMsg.innerHTML = 'This is the last message'; //todo

        const lastMsgDate = document.createElement('span');
        lastMsgDate.className = 'msg-date';
        lastMsgDate.innerHTML = '20m'; //todo

        contentDiv.appendChild(lastMsg);
        contentDiv.appendChild(lastMsgDate);
        msgDiv.appendChild(username);
        msgDiv.appendChild(contentDiv);
        groupDiv.appendChild(msgDiv);
        groupArea.appendChild(groupDiv);
    });

}


setInterval(getMessages, 5000);
window.addEventListener('DOMContentLoaded', () => {

    token = localStorage.getItem('token')
    username = localStorage.getItem('user')
    const welcome = document.getElementById('welcome')
    welcome.innerHTML = `Start Messaging, ${username}`
    document.getElementById("overlay").style.display = 'none';
    // checkPremium(localStorage.getItem('isPremium') === 'true')
    groupId = -1
    getLoggedInUsers()
    getMessages()
    getGroups();
});