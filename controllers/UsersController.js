import DBClient from '../utils/db';
import RedisClient from '../utils/redis';

const sha1 = require('sha1');

const { ObjectId } = require('mongodb');

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
      email: userEmail, password: hashedPassword,
    });

    return response.status(201).send({ id: addNewUser.insertedId, email: userEmail });
  }

  static async getMe(request, response) {
    const token = request.header('X-Token') || null;
    const key = `auth_${token}`;
    if (!token) return response.status(401).send({ error: 'Unauthorized' });
    const redisToken = await RedisClient.get(key);
    if (!redisToken) return response.status(401).send({ error: 'Unauthorized' });

    const user = await DBClient.db.collection('users')
      .findOnr({ _id: ObjectId(redisToken) });
    if (!user) return response.status(401).send({ error: 'Unauthorized' });
    delete user.password;

    return response.status(200).send({ id: user._id, email: user.email });
  }
}

module.exports = UsersController;
