import dbPool from "../utils/database.pool.js";

class UserModel {
	// Obtener usuario por ID
	static async findById(id) {
		const query = "SELECT id, name, email, role, created_at FROM users WHERE id = ?";
		try {
			const user = await dbPool.executeQuery(query, [id]);
			return user[0] || null; // Devuelve null si no encuentra el usuario
		} catch (error) {
			throw new Error(`Error finding user: ${error.message}`);
		}
	}

	// Crear nuevo usuario (con transacción para asegurar la integridad)
	static async create({ name, email, password, role = "user" }) {
		const queries = [
			// Primero verificamos si el email ya existe
			["SELECT id FROM users WHERE email = ?", [email]],
			// Si no existe, insertamos el nuevo usuario
			["INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, password, role]],
		];

		try {
			const results = await dbPool.executeTransaction(queries);
			// Si encontramos un usuario existente con ese email
			if (results[0].length > 0) {
				throw new Error("Email already exists");
			}
			// Retornamos el ID del usuario creado
			return results[1].insertId;
		} catch (error) {
			throw new Error(`Error creating user: ${error.message}`);
		}
	}

	// Actualizar usuario
	static async update(id, updateData) {
		const allowedFields = ["name", "email", "role"];
		const updates = [];
		const values = [];

		// Construir query dinámica solo con los campos proporcionados
		Object.keys(updateData).forEach((key) => {
			if (allowedFields.includes(key)) {
				updates.push(`${key} = ?`);
				values.push(updateData[key]);
			}
		});

		if (updates.length === 0) return null;

		values.push(id); // Añadir el ID para el WHERE
		const query = `UPDATE users SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

		try {
			const result = await dbPool.executeQuery(query, values);
			return result.affectedRows > 0;
		} catch (error) {
			throw new Error(`Error updating user: ${error.message}`);
		}
	}

	// Eliminar usuario
	static async delete(id) {
		const query = "DELETE FROM users WHERE id = ?";
		try {
			const result = await dbPool.executeQuery(query, [id]);
			return result.affectedRows > 0;
		} catch (error) {
			throw new Error(`Error deleting user: ${error.message}`);
		}
	}

	// Ejemplo de query más compleja: buscar usuarios por criterios múltiples
	static async findByFilters({ role, searchTerm, limit = 10, offset = 0 }) {
		let query = "SELECT id, name, email, role, created_at FROM users WHERE 1=1";
		const values = [];

		if (role) {
			query += " AND role = ?";
			values.push(role);
		}

		if (searchTerm) {
			query += " AND (name LIKE ? OR email LIKE ?)";
			values.push(`%${searchTerm}%`, `%${searchTerm}%`);
		}

		query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
		values.push(limit, offset);

		try {
			return await dbPool.executeQuery(query, values);
		} catch (error) {
			throw new Error(`Error searching users: ${error.message}`);
		}
	}

	// Ejemplo de uso del checkPoolStatus
	static async checkConnection() {
		return dbPool.checkPoolStatus();
	}
}

export default UserModel;
