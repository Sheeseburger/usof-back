const Sequelize = require('sequelize');

const sequelize = new Sequelize('usof', 'monyshchen', 'securepass', {
    host: 'localhost',
    dialect: 'mysql',
});

sequelize
    // .sync({ alter: true })
    .authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
        // addStarWarsCards();
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });
module.exports = sequelize;
