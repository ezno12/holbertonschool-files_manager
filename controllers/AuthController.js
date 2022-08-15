import uuid4 from 'uuid';
import DBClient from '../utils/db';
import RedisClient from '../utils/redis';

const sha1 = require('sha1');

class AuthController {
  static async getConnect(request, response) {
    const [authType, userPass] = request.headers.authorization.split(' ');
    if (authType !== 'Basic') {
      response.status(500).json({ error: 'Invalid auth type' });
    } else {
      const decode = (baseStr) => {
        const buff = Buffer.from(baseStr, 'base64');
        return buff.toString('utf-8');
      };
      const [email, password] = decode(userPass).split(':', 2);
      const dataBase = await DBClient.connection;
      const user = await dataBase.connection('ussers').findOne(
        {
          email,
          password: sha1(password),
        },
      );

      if (!user) response.status(401).json({ erro: 'Unauthorized' });
      else {
        const userToken = uuid4();
        const key = `auth_${userToken}`;
        await RedisClient.set(key, user._id.toString(), 24 * 60 * 60);
        response.status(200).json({ userToken });
      }
    }
  }

  static async getDisconnect(request, response) {
    const token = request.headers['x-token'] || null;
    if (!token) return response.status(401).send({ error: 'Unauthorized' });

    const key = `auth_${token}`;
    const redisToken = await RedisClient.get(key);
    if (!redisToken) response.status(401).json({ error: 'Unauthorized' });
    else {
      await RedisClient.del(key);
      response.status(401).send();
    }
    return response.status(204).send();
  }
}

module.exports = AuthController;
