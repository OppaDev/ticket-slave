'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const hashedPassword = await bcrypt.hash('password', 10);

    // --- 1. Crear Roles ---
    const createdRoles = await queryInterface.bulkInsert('roles', [
      { nombre: 'admin', descripcion: 'Acceso total al sistema', created_at: now },
      { nombre: 'organizer', descripcion: 'Puede crear y gestionar eventos', created_at: now },
      { nombre: 'customer', descripcion: 'Puede comprar tickets y ver eventos', created_at: now },
    ], { returning: true });

    const roleMap = createdRoles.reduce((acc, role) => {
      acc[role.nombre] = role.id;
      return acc;
    }, {});

    // --- 2. Crear Permisos (para toda la aplicación) ---
    const permissionsData = [
      // Usuarios y RBAC (ms-usuarios)
      { nombre: 'users:read', descripcion: 'Leer lista de usuarios', created_at: now },
      { nombre: 'users:update:any', descripcion: 'Actualizar cualquier usuario', created_at: now },
      { nombre: 'users:assign-role', descripcion: 'Asignar rol a un usuario', created_at: now },
      { nombre: 'rbac:manage', descripcion: 'Gestionar roles y permisos', created_at: now },

      // Eventos (ms-eventos)
      { nombre: 'events:create', descripcion: 'Crear nuevos eventos', created_at: now },
      { nombre: 'events:read:own', descripcion: 'Leer eventos propios', created_at: now },
      { nombre: 'events:update:own', descripcion: 'Actualizar eventos propios', created_at: now },
      { nombre: 'events:delete:own', descripcion: 'Eliminar eventos propios', created_at: now },
      { nombre: 'events:publish:own', descripcion: 'Publicar eventos propios', created_at: now },

      // Tickets y Compras (ms-tickets)
      { nombre: 'cart:manage:own', descripcion: 'Gestionar el propio carrito de compras', created_at: now },
      { nombre: 'orders:create:own', descripcion: 'Crear pedidos propios', created_at: now },
      { nombre: 'orders:read:own', descripcion: 'Ver historial de pedidos propios', created_at: now },
      { nombre: 'tickets:read:own', descripcion: 'Ver tickets propios', created_at: now },
      { nombre: 'tickets:validate', descripcion: 'Validar tickets en la puerta (check-in)', created_at: now },
    ];
    const createdPermissions = await queryInterface.bulkInsert('permissions', permissionsData, { returning: true });

    const permMap = createdPermissions.reduce((acc, perm) => {
      acc[perm.nombre] = perm.id;
      return acc;
    }, {});


    // --- 3. Asociar Permisos a Roles ---
    const roleHasPermissionsData = [];

    // El admin tiene TODOS los permisos
    for (const permId of Object.values(permMap)) {
      roleHasPermissionsData.push({
        role_id: roleMap.admin,
        permission_id: permId,
        created_at: now
      });
    }

    // El organizer tiene permisos para gestionar eventos y validar tickets
    [
      'events:create', 'events:read:own', 'events:update:own',
      'events:delete:own', 'events:publish:own', 'tickets:validate'
    ].forEach(permName => {
      roleHasPermissionsData.push({
        role_id: roleMap.organizer,
        permission_id: permMap[permName],
        created_at: now
      });
    });

    // El customer tiene permisos para comprar y ver sus cosas
    [
      'cart:manage:own', 'orders:create:own',
      'orders:read:own', 'tickets:read:own'
    ].forEach(permName => {
      roleHasPermissionsData.push({
        role_id: roleMap.customer,
        permission_id: permMap[permName],
        created_at: now
      });
    });

    await queryInterface.bulkInsert('role_has_permissions', roleHasPermissionsData, {});

    // --- 4. Crear Usuarios ---
    await queryInterface.bulkInsert('users', [
      {
        nombre: 'Admin',
        apellido: 'User',
        email: 'admin@test.com',
        password: hashedPassword,
        status: 'active',
        fechaNacimiento: '1990-01-01',
        pais: 'EC',
        aceptaTerminos: true,
        role_id: roleMap.admin,
        created_at: now
      },
      {
        nombre: 'Organizer',
        apellido: 'User',
        email: 'organizer@test.com',
        password: hashedPassword,
        status: 'active',
        fechaNacimiento: '1992-05-15',
        pais: 'EC',
        aceptaTerminos: true,
        role_id: roleMap.organizer,
        created_at: now
      },
      {
        nombre: 'Customer',
        apellido: 'User',
        email: 'customer@test.com',
        password: hashedPassword,
        status: 'active',
        fechaNacimiento: '1995-10-20',
        pais: 'CO',
        aceptaTerminos: true,
        role_id: roleMap.customer,
        created_at: now
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // El orden de borrado es inverso al de creación para evitar conflictos de FK
    await queryInterface.bulkDelete('role_has_permissions', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};
