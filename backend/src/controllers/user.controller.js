import UserModel from "../models/user.model.js";
import { AppError } from "../middlewares/error.middleware.js";

export const getUserById = async (req, res, next) => {
	try {
		const user = await UserModel.findById(req.params.id);
		if (!user) {
			throw new AppError("User not found", 404);
		}
		res.json(user);
	} catch (error) {
		next(error);
	}
};

export const createUser = async (req, res, next) => {
	try {
		const userId = await UserModel.create(req.body);
		res.status(201).json({
			status: "success",
			data: { id: userId },
		});
	} catch (error) {
		if (error.message === "Email already exists") {
			next(new AppError("Email already in use", 400));
		} else {
			next(error);
		}
	}
};

export const searchUsers = async (req, res, next) => {
	try {
		const { role, search, page = 1, limit = 10 } = req.query;
		const offset = (page - 1) * limit;

		const users = await UserModel.findByFilters({
			role,
			searchTerm: search,
			limit: parseInt(limit),
			offset: parseInt(offset),
		});

		res.json({
			status: "success",
			data: users,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
			},
		});
	} catch (error) {
		next(error);
	}
};
