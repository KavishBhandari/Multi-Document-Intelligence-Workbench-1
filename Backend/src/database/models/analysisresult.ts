import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface AnalysisResultAttributes {
  id: number;
  session_id: number;
  result_json: object;
  model: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AnalysisResultCreationAttributes
  extends Optional<AnalysisResultAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class AnalysisResult
  extends Model<AnalysisResultAttributes, AnalysisResultCreationAttributes>
  implements AnalysisResultAttributes
{
  declare id: number;
  declare session_id: number;
  declare result_json: object;
  declare model: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof AnalysisResult {
    AnalysisResult.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        session_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        result_json: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        model: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: 'mock-ai-v1',
        },
      },
      {
        sequelize,
        modelName: 'AnalysisResult',
        tableName: 'AnalysisResult',
        timestamps: true,
      }
    );
    return AnalysisResult;
  }

  static associateModel(): void {
    const models = AnalysisResult.sequelize!.models;
    AnalysisResult.belongsTo(models.AnalysisSession as any, { foreignKey: 'session_id', as: 'session' });
    AnalysisResult.hasMany(models.Finding as any, { foreignKey: 'result_id', as: 'findings' });
  }
}

export default AnalysisResult;
