console.log("SignUp Init");

const SERVER_URL = "http://localhost:8080"

function newUserData() {
    const userName = document.querySelector('#username').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    signUp(userName, email, password);
}

async function signUp(userName, email, password) {
    
    const response = await fetch(`${SERVER_URL}/users/`, {
        method: 'POST',
        body: JSON.stringify({
            name: userName,
            email: email,
            password: password
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const json = await response.json()

    if (json.status == 1) return document.querySelector('#signup-out').innerHTML = "Sign up failed";

    document.querySelector('#signup-out').innerHTML = "Sign up succesfull";
}

document.querySelector('#signup-btn').addEventListener('click', newUserData);