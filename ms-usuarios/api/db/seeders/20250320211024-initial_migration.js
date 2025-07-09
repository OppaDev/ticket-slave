'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar usuarios
    const users = await queryInterface.bulkInsert('users', [
      {
        name: 'Admin User',
        email: 'cristianchoacalo@gmail.com',
        password: '$2b$10$H42uY6RINBSPzsQa7NhyoeRLo9NNrJnNGamnKcSrKAYi3cNp5A5XS',
        role: 'admin',
        created_at: new Date(),
      },
      {
        name: 'Customer User',
        email: 'acalodeveloper@gmail.com',
        password: '$2b$10$H42uY6RINBSPzsQa7NhyoeRLo9NNrJnNGamnKcSrKAYi3cNp5A5XS',
        role: 'customer',
        created_at: new Date(),
      },
    ], { returning: true });

    const customerUser = users.find(user => user.email === 'acalodeveloper@gmail.com');

    // Insertar customer
    const customers = await queryInterface.bulkInsert('customers', [
      {
        name: 'Alex',
        lastname: 'Calo',
        phone: '0987654321',
        adress: 'Calle Falsa 123',
        user_id: customerUser.id, // Asociar el customer con el usuario de tipo customer
        created_at: new Date(),
      }
    ], { returning: true });

    // Insertar categorías
    const categories = await queryInterface.bulkInsert('categories', [
      { name: 'Electrónica', image: 'https://www.eluniverso.com/resizer/v2/IJLSKMNQANH2NEGXXKWZXRT37Y.png', description: 'Productos electrónicos', created_at: new Date() },
      { name: 'Ropa', image: 'https://sopotey.com/blog/wp-content/uploads/2024/04/ropa-de-marca-original-para-mujer.jpg', description: 'Ropa y accesorios', created_at: new Date() },
      { name: 'Hogar', image: 'https://unilimpio.com/static/a3929000b57b1d0cf3e20104bd5507a0/d00ff/productos-de-limpieza-para-tu-hogar.jpg', description: 'Productos para el hogar', created_at: new Date() },
      { name: 'Deportes', image: 'https://www.datasur.com/wordpress/wp-content/uploads/elementor/thumbs/importaciones-deportivas-datasur-qggoyjwnrlxvxnuatqny4fnrgqvk51a1foucrodyio.png', description: 'Artículos deportivos', created_at: new Date() },
      { name: 'Juguetes', image: 'https://img.interempresas.net/fotos/4144079.jpeg', description: 'Juguetes para niños', created_at: new Date() },
      { name: 'Belleza', image: 'https://img.freepik.com/foto-gratis/coleccion-productos-belleza-cosmeticos-sobre-fondo-blanco_23-2147878830.jpg', description: 'Productos de belleza', created_at: new Date() },
    ], { returning: true });

    // Mapear IDs de categorías
    const catMap = {
      electronica: categories.find(c => c.name === 'Electrónica').id,
      ropa: categories.find(c => c.name === 'Ropa').id,
      hogar: categories.find(c => c.name === 'Hogar').id,
      deportes: categories.find(c => c.name === 'Deportes').id,
      juguetes: categories.find(c => c.name === 'Juguetes').id,
      belleza: categories.find(c => c.name === 'Belleza').id,
    };

    // Insertar productos
    await queryInterface.bulkInsert('products', [
      { name: 'Laptop Gamer', price: 1500, description: 'Potente laptop para gaming', image: 'https://www.graco.com/content/dam/graco/industry-solutions/electronics/thermal-interface/cell-phone-laptop.jpg', category_id: catMap.electronica, created_at: new Date() },
      { name: 'Smartphone', price: 900, description: 'Última tecnología en telefonía', image: 'https://www.upb.edu.co/es/imagenes/img-raee-blog-sostenibilidad-1464231652905.jpeg', category_id: catMap.electronica, created_at: new Date() },
      { name: 'Camiseta Deportiva', price: 25, description: 'Camiseta cómoda y transpirable', image: 'https://static01.nyt.com/images/2016/03/26/business/26athleisure1/26athleisure1-articleLarge.jpg', category_id: catMap.ropa, created_at: new Date() },
      { name: 'Sillón Moderno', price: 200, description: 'Sillón elegante para el hogar', image: 'https://s1.elespanol.com/2021/02/23/imprescindibles/561204746_173721307_1024x576.jpg', category_id: catMap.hogar, created_at: new Date() },
      { name: 'Balón de Fútbol', price: 30, description: 'Balón profesional para juegos', image: 'https://nortexpres.com/wp-content/uploads/2020/03/sport-1283791_960_720.jpg', category_id: catMap.deportes, created_at: new Date() },
      { name: 'Muñeca Interactiva', price: 40, description: 'Juguete educativo para niños', image: 'https://www.reasonwhy.es/media/cache/destacada/zalando-juguetes.jpg', category_id: catMap.juguetes, created_at: new Date() },
      { name: 'Kit de Maquillaje', price: 50, description: 'Set completo de maquillaje profesional', image: 'https://notidex.com/wp-content/uploads/2024/01/productos-maquillaje.jpg', category_id: catMap.belleza, created_at: new Date() },
    ]);

    // Insertar órdenes (solo los customers pueden hacer órdenes)
    const customerId = customers[0].id;
    const orders = await queryInterface.bulkInsert('orders', [
      { customer_id: customerId, status: 'pendiente', created_at: new Date() }
    ], { returning: true });

    // Insertar productos en la orden
    const orderId = orders[0].id;
    await queryInterface.bulkInsert('orders_products', [
      { order_id: orderId, product_id: 1, quantity: 1, created_at: new Date() },
      { order_id: orderId, product_id: 3, quantity: 2, created_at: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('orders_products', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('customers', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
}
