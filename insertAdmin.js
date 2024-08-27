const AppUser = require('./models/AppUser');
const sequelize = require('./config/database');

(async () => {
    try {
        await sequelize.sync(); // Ensure the database is synced

        // Check if admin user already exists
        const adminExists = await AppUser.findOne({ where: { email: 'admin@gmail.com' } });
        if (!adminExists) {
            // Create an admin user
            const admin = await AppUser.create({
                name: 'Admin',
                email: 'admin@gmail.com',
                password: 'admin',  // The password will be automatically hashed by the Sequelize hook
                status: 'active',
                role: 'admin'
            });

            console.log('Admin user created:', admin.toJSON());
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        sequelize.close(); // Close the connection
    }
})();
