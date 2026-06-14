interface UserLoginResponse {
  id: string
  name: string
  profile_picture: string
}

export function saveLoginData(token: string, user: UserLoginResponse) {
  localStorage.setItem("token", token)
  localStorage.setItem("user", JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  window.location.href = "/"
}
