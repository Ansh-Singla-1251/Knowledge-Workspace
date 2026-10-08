const AUTH_KEY = "knowledgeWorkspaceUsers";
const SESSION_KEY = "knowledgeWorkspaceSession";

export function getUsers(){
    return JSON.parse(
        localStorage.getItem(AUTH_KEY) || "[]"
    );
}

export function signupUser(name,email,password){
    const users = getUsers();

    const existingUser = users.find(
        user => user.email === email
    );

    if(existingUser){
        return {
            success: false,
            message: "An account with this email already exists."
        };
    }

    users.push({
        id: Date.now(),
        name: name,
        email: email,
        password: password
    });

    localStorage.setItem(
        AUTH_KEY,
        JSON.stringify(users)
    );

    return {
        success: true
    };
}

export function loginUser(email,password,rememberMe = false){
    const users = getUsers();

    const user = users.find(
        user =>
            user.email === email &&
            user.password === password
    );

    if(!user){
        return {
            success: false,
            message: "Invalid email or password."
        };
    }

    const session = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    const storage =
        rememberMe ? localStorage : sessionStorage;

    storage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );

    return {
        success: true,
        user: session
    };
}

export function getCurrentUser(){
    const session =
        sessionStorage.getItem(SESSION_KEY) ||
        localStorage.getItem(SESSION_KEY);

    return session ?
        JSON.parse(session) :
        null;
}

export function logoutUser(){
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(){
    return getCurrentUser() !== null;
}

export function requireLogin(){
    if(!isLoggedIn()){
        window.location.href = "login.html";
    }
}