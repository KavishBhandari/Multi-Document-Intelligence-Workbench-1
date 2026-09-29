import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface FindingAttributes {
  id: number;
  result_id: number;
  type: string;
  title: string;
  description: string;
  classification: string;
  severity: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FindingCreationAttributes
  extends Optional<FindingAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Finding
  extends Model<FindingAttributes, FindingCreationAttributes>
  implements FindingAttributes
{
  declare id: number;
  declare result_id: number;
  declare type: string;
  declare title: string;
  declare description: string;
  declare classification: string;
  declare severity: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Finding {
    Finding.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        result_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        type: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        classification: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        severity: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: 'info',
        },
      },
      {
        sequelize,
        modelName: 'Finding',
        tableName: 'Finding',
        timestamps: true,
      }
    );
    return Finding;
  }

  static associateModel(): void {
    const models = Finding.sequelize!.models;
    Finding.belongsTo(models.AnalysisResult as any, { foreignKey: 'result_id', as: 'result' });
    Finding.hasMany(models.FindingEvidence as any, { foreignKey: 'finding_id', as: 'evidences' });
  }
}

export default Finding;
