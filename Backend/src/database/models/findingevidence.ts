import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface FindingEvidenceAttributes {
  id: number;
  finding_id: number;
  document_id: number;
  chunk_id: number | null;
  quote: string;
  page_number: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FindingEvidenceCreationAttributes
  extends Optional<FindingEvidenceAttributes, 'id' | 'chunk_id' | 'page_number' | 'createdAt' | 'updatedAt'> {}

class FindingEvidence
  extends Model<FindingEvidenceAttributes, FindingEvidenceCreationAttributes>
  implements FindingEvidenceAttributes
{
  declare id: number;
  declare finding_id: number;
  declare document_id: number;
  declare chunk_id: number | null;
  declare quote: string;
  declare page_number: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof FindingEvidence {
    FindingEvidence.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        finding_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        document_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        chunk_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        quote: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        page_number: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'FindingEvidence',
        tableName: 'FindingEvidence',
        timestamps: true,
      }
    );
    return FindingEvidence;
  }

  static associateModel(): void {
    const models = FindingEvidence.sequelize!.models;
    FindingEvidence.belongsTo(models.Finding as any, { foreignKey: 'finding_id', as: 'finding' });
    FindingEvidence.belongsTo(models.Document as any, { foreignKey: 'document_id', as: 'document' });
    FindingEvidence.belongsTo(models.DocumentChunk as any, { foreignKey: 'chunk_id', as: 'chunk' });
  }
}

export default FindingEvidence;
