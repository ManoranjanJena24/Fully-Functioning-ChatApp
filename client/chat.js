let url = "http://localhost:3000"

let token;
function logout() {
    localStorage.clear()
    window.location.href='login.html'

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


window.addEventListener('DOMContentLoaded', () => {
    token = localStorage.getItem('token')
    checkPremium(localStorage.getItem('isPremium') === 'true')
   
});