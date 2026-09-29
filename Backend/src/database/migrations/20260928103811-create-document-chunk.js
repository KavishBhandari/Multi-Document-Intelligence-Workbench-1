'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DocumentChunk', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      document_id: {
        type: Sequelize.INTEGER,
         allowNull: false,
      },
      chunk_index: {
        type: Sequelize.INTEGER
      },
      page_number: {
        type: Sequelize.INTEGER
      },
      text: {
        type: Sequelize.TEXT
      },
      char_start: {
        type: Sequelize.INTEGER
      },
      char_end: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DocumentChunk');
  }
};