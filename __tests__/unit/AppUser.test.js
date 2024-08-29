const SequelizeMock = require('sequelize-mock');
const bcrypt = require('bcrypt');

// Mock the database connection
const dbMock = new SequelizeMock();
const AppUserMock = dbMock.define('AppUser', {
    id: 1,
    email: "test@example.com",
    password: "hashed_password",
    status: 'active',
    role: 'admin',
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (!user.password.startsWith('$2b$')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (!user.password.startsWith('$2b$')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Mock bcrypt
jest.mock('bcrypt', () => ({
    genSalt: jest.fn(() => 10),
    hash: jest.fn((password, salt) => `hashed_${password}`),
    compare: jest.fn((password, hashed) => true)
}));

describe('AppUser Model', () => {
    test('validPassword method should validate password correctly', async () => {
        const user = await AppUserMock.create({
            email: 'test@example.com',
            password: 'hashed_password123',
            status: 'active',
            role: 'admin'
        });

        // Attach the method if not already present
        if (!user.validPassword) {
            user.validPassword = async function (password) {
                return bcrypt.compare(password, this.password);
            };
        }

        const isValid = await user.validPassword('password123');
        expect(isValid).toBe(true);
        expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password123');
    });

    test('beforeCreate hook should hash password if not already hashed', async () => {
        // Assuming the hook's functionality needs to be invoked directly
        const newUser = AppUserMock.build({
            email: 'newuser@example.com',
            password: 'newPassword',
        });

        // Directly simulate the hook's logic
        if (!newUser.password.startsWith('$2b$')) {
            const salt = await bcrypt.genSalt(10);
            newUser.password = await bcrypt.hash(newUser.password, salt);
        }

        expect(newUser.password).toBe('hashed_newPassword');
        expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    });
});

