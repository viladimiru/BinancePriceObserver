'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.changeColumn('Prices', 'price', {
				type: Sequelize.NUMBER,
				allowNull: true,
			}),
			queryInterface.changeColumn('TempPairs', 'price', {
				type: Sequelize.NUMBER,
				allowNull: true,
			}),
		]);
	},

	async down(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.changeColumn('Prices', 'price', {
				type: Sequelize.NUMBER,
			}),
			queryInterface.changeColumn('TempPairs', 'price', {
				type: Sequelize.NUMBER,
			}),
		]);
	},
};
