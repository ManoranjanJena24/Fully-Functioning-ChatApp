let url = "http://localhost:3000"

let token;

document.getElementById('messageForm').addEventListener('submit', function (event) {
    event.preventDefault();
   

    const messageData = {
        message: document.getElementById('messageInput').value,
        
    };

    this.reset();
    sendMessage(messageData);
});

function sendMessage(data) {
    axios.post(`${url}/message/add-message`,data, { headers: { "Authorization": token } }).then((res) => {
        console.log(res)
        getMessages()
    })
}

function getMessages() {
    //TODO
}



// function checkPremium(value) {

//     const button = document.getElementById('razoorpay-button');
//     const text = document.getElementById('premium-text')
//     const leaderBoard = document.getElementById("leaderBoard-button")
//     const salaryForm = document.getElementById('salary-form')
//     // console.log(token)
//     const reportBtn = document.getElementById('report-button');
//     if (!value) {
//         button.style.display = "inline-block";  //make the button visible
//         text.style.display = "none";
//         leaderBoard.style.display = "none"
//         salaryForm.style.display = "none"
//         reportBtn.style.display = "none"
//     }
//     else {
//         button.style.display = "none";  //Hide the button
//         text.style.display = "inline-block";
//         leaderBoard.style.display = "inline-block"
//         salaryForm.style.display = "inline-block"
//         reportBtn.style.display = "inline-block"

//     }
// }

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



window.addEventListener('DOMContentLoaded', () => {
    token = localStorage.getItem('token')
    // checkPremium(localStorage.getItem('isPremium') === 'true')
    getLoggedInUsers();


});