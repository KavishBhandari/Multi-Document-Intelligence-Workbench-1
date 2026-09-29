'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Document', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      original_name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      stored_name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      mime_type: {
        type: Sequelize.STRING,
        allowNull:false
      },
      size_bytes: {
        type: Sequelize.BIGINT
      },
      sha256: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      error_code: {
        type: Sequelize.STRING
      },
      error_message: {
        type: Sequelize.TEXT
      },
      page_count: {
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
    await queryInterface.dropTable('Document');
  }
};