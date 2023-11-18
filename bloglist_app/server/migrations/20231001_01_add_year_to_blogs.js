const { DataTypes } = require('../utils/database.js')

// 13.18 - add migration
module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('blogs', 'year', {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1991,
        max: new Date().getFullYear()
      }
    }
    )
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('blogs', 'year')
  }
}