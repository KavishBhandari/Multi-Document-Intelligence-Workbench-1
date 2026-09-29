import {
    Attributes,
    FindAttributeOptions,
    IncludeOptions,
    Model,
    ModelStatic,
    OrderItem,
    Transaction,
    WhereOptions,
} from "sequelize";
import { ApiError } from "../utils/apiError";
import { messages, statusCode } from "../utils/contant";


const getData = async (
    Model: ModelStatic<Model>,
    column: FindAttributeOptions,
    condition: WhereOptions ,
    findOne: boolean
) => {
    try {
        const response = findOne
            ? await Model.findOne({
                attributes: column,
                ...condition,
            })
            : await Model.findAll({
                attributes: column,
                ...condition,
            });
        if (findOne) {
            if (!Array.isArray(response)) {
                return response?.get({ plain: true });
            }
        }
        return response;
    } catch (error) {
        console.error("Error fetching data ::::::::", error);
        throw new ApiError(statusCode.BAD_REQUEST, messages.INTERNAL_SERVER_ERROR);
    }
};

const updateData = async (
    Model: ModelStatic<Model>,
    data: Attributes<Model>,
    condition: WhereOptions,
    transaction: Transaction
) => {
    try {
        return await Model.update(data, {
            where: condition,
            transaction: transaction,
        });
    } catch (error) {
        console.error("Error updating data ::::::::", error);
        throw new ApiError(statusCode.BAD_REQUEST, messages.INTERNAL_SERVER_ERROR);
    }
};

const deleteData = async (
    Model: ModelStatic<Model>,
    condition: WhereOptions,
    transaction: Transaction
) => {
    try {
        return await Model.destroy({
            where: condition,
            transaction: transaction,
        });
    } catch (error) {
        console.error("Error deleting data ::::::::", error);
        throw new ApiError(statusCode.BAD_REQUEST, messages.INTERNAL_SERVER_ERROR);
    }
};

const createData = async (
    Model: ModelStatic<Model>,
    data: Attributes<Model>,
    insertMany: boolean = false,
    transaction?: Transaction
) => {
    const options = transaction ? { transaction } : {};
    return insertMany
        ? await Model.bulkCreate(data, options)
        : await Model.create(data, options);
};

export const DBHelper = {
    getData,
    updateData,
    deleteData,
    createData,
};