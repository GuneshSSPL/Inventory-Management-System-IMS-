// models/index.js
import sequelize from '../config/sequelize.js';
import { DataTypes } from 'sequelize';

// Import all model factory functions
import UserModel from './User.js';
import RoleModel from './Role.js';
import DepartmentModel from './Department.js';
import PermissionModel from './Permission.js';
import RolePermissionModel from './RolePermission.js';
import CategoryModel from './Category.js';
import SupplierModel from './Supplier.js';
import MaterialModel from './Material.js';
import InventoryTransactionModel from './inventoryTransaction.js';
import EmployeeModel from './employee.js';
import WorkspaceModel from './Workspace.js';
import MailHistoryModel from './MailHistory.js';

const db = {};

// Initialize models
db.User = UserModel(sequelize, DataTypes);
db.Role = RoleModel(sequelize, DataTypes);
db.Department = DepartmentModel(sequelize, DataTypes);
db.Permission = PermissionModel(sequelize, DataTypes);
db.RolePermission = RolePermissionModel(sequelize, DataTypes);
db.Category = CategoryModel(sequelize, DataTypes);
db.Supplier = SupplierModel(sequelize, DataTypes);
db.Material = MaterialModel(sequelize, DataTypes);
db.InventoryTransaction = InventoryTransactionModel(sequelize, DataTypes);
db.Employee = EmployeeModel(sequelize, DataTypes);
db.Workspace = WorkspaceModel(sequelize, DataTypes);
db.MailHistory = MailHistoryModel(sequelize, DataTypes);

// This loop correctly calls the .associate method on each model
// This is where all your associations should be defined (inside each model file)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


db.sequelize = sequelize;
db.Sequelize = DataTypes;

export default db; // This exports the `db` object as the default export