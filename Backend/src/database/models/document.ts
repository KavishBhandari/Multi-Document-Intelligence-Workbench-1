import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface DocumentAttributes {
  id: number;
  session_id: number;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: number;
  sha256: string | null;
  status: string;
  error_code: string | null;
  error_message: string | null;
  page_count: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DocumentCreationAttributes
  extends Optional<DocumentAttributes, 'id' | 'sha256' | 'error_code' | 'error_message' | 'page_count' | 'createdAt' | 'updatedAt'> {}

class Document
  extends Model<DocumentAttributes, DocumentCreationAttributes>
  implements DocumentAttributes
{
  declare id: number;
  declare session_id: number;
  declare original_name: string;
  declare stored_name: string;
  declare mime_type: string;
  declare size_bytes: number;
  declare sha256: string | null;
  declare status: string;
  declare error_code: string | null;
  declare error_message: string | null;
  declare page_count: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Document {
    Document.init(
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
        original_name: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        stored_name: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        mime_type: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        size_bytes: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        sha256: {
          type: DataTypes.STRING(64),
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: 'pending',
        },
        error_code: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        error_message: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        page_count: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Document',
        tableName: 'Document',
        timestamps: true,
      }
    );
    return Document;
  }

  static associateModel(): void {
    const models = Document.sequelize!.models;
    Document.belongsTo(models.AnalysisSession as any, { foreignKey: 'session_id', as: 'session' });
    Document.hasMany(models.DocumentChunk as any, { foreignKey: 'document_id', as: 'chunks' });
    Document.hasMany(models.FindingEvidence as any, { foreignKey: 'document_id', as: 'evidences' });
  }
}

export default Document;
