const sha1 = require('sha1');
import DBClient from '../utils/db';

class UsersController {
  static async postNew(request, response) {
    const userEmail = request.body.email;
    if (!userEmail) {
      return response.status(400).send({ error: 'Missing email' });
    }
    const userPassword = request.body.password;
    if (!userPassword) {
      return response.status(400).send({ error: 'Missing password' });
    }

    const existedUser = await DBClient.db.collection('users').find({ email: userEmail });
    if (existedUser) { return response.status(400).send({ error: 'Already exist' }); }

    const hashedPassword = sha1(userPassword);
    const addNewUser = await DBClient.db.collection('users').insertOne({
      email: userEmail, password: hashedPassword
    });

    return response.status(201).send({ id: addNewUser.insertedId, email: userEmail });
  }
}

module.exports = UsersController;
