import Sequelize, { Options } from "sequelize";
import configs from "./config/config"
import { library } from "../utils/library";

export default {
  load: async function(): Promise<boolean> {
    try {
      const config = configs as { [key: string]: Options };
      const sequelize = new Sequelize.Sequelize({
        ...config,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        // logging: process.env.NODE_ENV === 'development', // true / false
        logQueryParameters: process.env.NODE_ENV === "development",
        logging:
          process.env.NODE_ENV === "production"
            ? false
            : (query, time) => {
              console.log(time + "ms" + " " + query);
            },
        benchmark: true,
      });

      await sequelize.authenticate().then(() => {
        console.log(
          `${config.database as string} : Database Connected Successfully ...`,
        );
      });

      const modelsDir = library.path.join(__dirname, "models");

      const modelFiles = library.fs
        .readdirSync(modelsDir)
        .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      library.db = { sequelize };

      modelFiles.forEach((file) => {
        const modelPath = library.path.join(modelsDir, file);
        const imported = require(modelPath);
        const model = imported.default || imported;

        if (model && model.initModel) {
          model.initModel(sequelize);
        }

        const modelName =
          (model && model.name) || library.path.basename(file, library.path.extname(file));

        library.db[modelName] = model;
      });

      Object.keys(library.db.sequelize.models).forEach((modelName) => {
        if (library.db.sequelize.models[modelName].associateModel) {
          library.db.sequelize.models[modelName].associateModel();
        }
      });

      // Synchronize tables with database
      await sequelize.sync();
      console.log("Database models synchronized successfully.");

      return true;
    } catch (error) {
      console.error("error load models :: ", error);
      console.error("Error in Load Models");

      return false;
    }
  },
};