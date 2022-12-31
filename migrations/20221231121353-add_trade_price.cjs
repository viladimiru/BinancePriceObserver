'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Prices',
        'tradePrice',
        {
          type: Sequelize.NUMBER,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'TempPairs',
        'tradePrice',
        {
          type: Sequelize.NUMBER,
          allowNull: true
        }
      ),
    ]);
  },

  async down (queryInterface) {
    return Promise.all([
      queryInterface.removeColumn('Prices', 'tradePrice'),
      queryInterface.removeColumn('TempPairs', 'tradePrice')
    ]);
  }
};
