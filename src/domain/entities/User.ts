export default class User {
  userName: string
  name: string
  lastName: string
  locality: string
  gender: string
  age: number
  email: string

  constructor(userName: string, name: string, lastName: string, locality: string, gender: string, age: number, email: string) {
    this.userName = userName;
    this.name = name;
    this.lastName = lastName;
    this.locality = locality;
    this.gender = gender;
    this.age = age;
    this.email = email;
  }
  }