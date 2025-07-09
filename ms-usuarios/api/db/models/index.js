const { Role, RoleSchema } = require('./role.model');
const { Permission, PermissionSchema } = require('./permission.model');
const { RoleHasPermission, RoleHasPermissionSchema } = require('./role_has_permission.model');
const { User, UserSchema } = require('./user.model');

function setupModels(sequelize) {
  User.init(UserSchema, User.config(sequelize));
  Role.init(RoleSchema, Role.config(sequelize)); // inicializa el modelo Role
  Permission.init(PermissionSchema, Permission.config(sequelize));
  RoleHasPermission.init(RoleHasPermissionSchema, RoleHasPermission.config(sequelize));

  User.associate(sequelize.models);
  Role.associate(sequelize.models); // asocia el modelo Role con el modelo Permission
  Permission.associate(sequelize.models);
  RoleHasPermission.associate(sequelize.models); // asocia el modelo RoleHasPermission con
}

module.exports = { setupModels };
