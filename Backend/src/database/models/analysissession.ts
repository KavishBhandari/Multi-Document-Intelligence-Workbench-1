import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface AnalysisSessionAttributes {
  id: number;
  prompt: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AnalysisSessionCreationAttributes
  extends Optional<AnalysisSessionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class AnalysisSession
  extends Model<AnalysisSessionAttributes, AnalysisSessionCreationAttributes>
  implements AnalysisSessionAttributes
{
  declare id: number;
  declare prompt: string;
  declare status: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof AnalysisSession {
    AnalysisSession.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        prompt: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: 'created',
        },
      },
      {
        sequelize,
        modelName: 'AnalysisSession',
        tableName: 'AnalysisSession',
        timestamps: true,
      }
    );
    return AnalysisSession;
  }

  static associateModel(): void {
    const models = AnalysisSession.sequelize!.models;
    AnalysisSession.hasMany(models.Document as any, { foreignKey: 'session_id', as: 'documents' });
    AnalysisSession.hasMany(models.AnalysisResult as any, { foreignKey: 'session_id', as: 'results' });
  }
}

export default AnalysisSession;
