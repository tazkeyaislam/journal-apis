const request = require('supertest');
const app = require('../../index');  // Update the path accordingly
const sequelize = require('../../config/database'); // Adjust this path to where your Sequelize instance is initialized
beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset database before tests
});

describe('Authentication Tests', () => {
    test('Successful Signup', async () => {
        const res = await request(app)
            .post('/appuser/signup') // Adjusted path to match route mounting
            .send({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe("Successfully Registered");
    });

    test('Signup with Existing Email', async () => {
        await request(app).post('/appuser/signup').send({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123'
        });

        const res = await request(app)
            .post('/appuser/signup') // Adjusted path to match route mounting
            .send({
                name: 'Jane Doe',
                email: 'john@example.com',
                password: 'password1234'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe("Email already exists");
    });
});

afterAll(async () => {
    await sequelize.close();
});
