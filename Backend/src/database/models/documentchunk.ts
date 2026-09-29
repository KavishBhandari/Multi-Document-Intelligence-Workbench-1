import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface DocumentChunkAttributes {
  id: number;
  document_id: number;
  chunk_index: number;
  page_number: number | null;
  text: string;
  char_start: number;
  char_end: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DocumentChunkCreationAttributes
  extends Optional<DocumentChunkAttributes, 'id' | 'page_number' | 'createdAt' | 'updatedAt'> {}

class DocumentChunk
  extends Model<DocumentChunkAttributes, DocumentChunkCreationAttributes>
  implements DocumentChunkAttributes
{
  declare id: number;
  declare document_id: number;
  declare chunk_index: number;
  declare page_number: number | null;
  declare text: string;
  declare char_start: number;
  declare char_end: number;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof DocumentChunk {
    DocumentChunk.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        document_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        chunk_index: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        page_number: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        text: {
          type: DataTypes.TEXT('long'),
          allowNull: false,
        },
        char_start: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        char_end: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'DocumentChunk',
        tableName: 'DocumentChunk',
        timestamps: true,
      }
    );
    return DocumentChunk;
  }

  static associateModel(): void {
    const models = DocumentChunk.sequelize!.models;
    DocumentChunk.belongsTo(models.Document as any, { foreignKey: 'document_id', as: 'document' });
  }
}

export default DocumentChunk;
