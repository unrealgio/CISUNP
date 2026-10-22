const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const { CATEGORIAS_ARQUIVO } = require("../utils/arquivos");

const Arquivo = sequelize.define(
  "Arquivo",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cpf: { type: DataTypes.STRING, allowNull: false },
    nome: { type: DataTypes.STRING, allowNull: false },
    categoria: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [CATEGORIAS_ARQUIVO] },
    },
    tipoMime: { type: DataTypes.STRING, allowNull: false },
    tamanho: { type: DataTypes.INTEGER, allowNull: false },
    caminho: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "arquivos",
    timestamps: true,
    defaultScope: { attributes: { exclude: ["caminho"] } },
  },
);

module.exports = Arquivo;
