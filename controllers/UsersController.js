import sha1 from 'sha1';
import DBClient from '../utils/db';

class UsersController {
  static async postNew(request, response) {
    const userEmail = response.body.email;
    if (!userEmail) {
      return response.status(400).send({ error: 'Missing email' });
    }
    const userPassword = response.body.password;
    if (!userPassword) {
      return response.status(400).send({ error: 'Missing password' });
    }

    const existedUser = await DBClient.db.collection('users').find({ email: userEmail });
    if (existedUser) { return response.status(400).send({ error: 'Already exist' }); }

    const hashedPassword = sha1(userPassword);
    const addNewUser = await DBClient.db.collection.insertOne({
      email: userEmail, password: hashedPassword,
    });

    return response.status(201).send({ id: addNewUser.insertedId, email: userEmail });
  }
}

module.exports = UsersController;
