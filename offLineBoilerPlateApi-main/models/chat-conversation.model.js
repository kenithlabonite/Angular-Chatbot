const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        conversationId: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        AccountId: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
        title: { 
            type: DataTypes.STRING(255), 
            allowNull: true,
            defaultValue: 'New Conversation'
        },
        createdAt: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW 
        },
        updatedAt: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW 
        }
    };

    const options = {
        timestamps: true,
        updatedAt: 'updatedAt',
        createdAt: 'createdAt'
    };

    return sequelize.define('ChatConversation', attributes, options);
}
