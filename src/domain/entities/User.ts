export default class User {
    public id: string;
    public name: string;
    public email: string;
    public token: string;
  
    constructor(id: string, name: string, email: string, token: string) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.token = token;
    }
  }