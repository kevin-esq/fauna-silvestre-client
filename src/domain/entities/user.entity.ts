export default class User {
  id: string
  UserName: string
  name: string
  lastName: string
  locality: string
  gender: string
  age: number
  email: string
  token: string
  role: string

  constructor(id: string, UserName: string, name: string, lastName: string, locality: string, gender: string, age: number, email: string, token: string, role: string) {
    this.id = id;
    this.UserName = UserName;
    this.name = name;
    this.lastName = lastName;
    this.locality = locality;
    this.gender = gender;
    this.age = age;
    this.email = email;
    this.token = token;
    this.role = role
  }
}