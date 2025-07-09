'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    // Asumimos el ID del usuario organizador del ms-usuarios
    const organizerId = 2;

    // --- 1. Crear Categorías ---
    const createdCategories = await queryInterface.bulkInsert('categories', [
      { nombre: 'Música', descripcion: 'Conciertos, festivales y recitales.', created_at: now },
      { nombre: 'Deportes', descripcion: 'Partidos, torneos y competencias.', created_at: now },
      { nombre: 'Teatro y Comedia', descripcion: 'Obras de teatro, stand-up y espectáculos de comedia.', created_at: now },
      { nombre: 'Cursos y Talleres', descripcion: 'Eventos educativos y de formación.', created_at: now },
    ], { returning: true });

    const categoryMap = createdCategories.reduce((acc, cat) => {
      acc[cat.nombre.split(' ')[0]] = cat.id; // 'Música' -> 'Música', 'Teatro y Comedia' -> 'Teatro'
      return acc;
    }, {});

    // --- 2. Crear Recintos (Venues) ---
    const createdVenues = await queryInterface.bulkInsert('venues', [
      {
        nombre: 'Estadio Olímpico Atahualpa',
        direccion: 'Av. 6 de Diciembre y Naciones Unidas',
        ciudad: 'Quito',
        pais: 'EC',
        latitud: -0.1764,
        longitud: -78.4784,
        organizer_id: organizerId,
        created_at: now
      },
      {
        nombre: 'Ágora de la Casa de la Cultura',
        direccion: 'Av. Patria y 6 de Diciembre',
        ciudad: 'Quito',
        pais: 'EC',
        latitud: -0.2075,
        longitud: -78.4907,
        organizer_id: organizerId,
        created_at: now
      },
    ], { returning: true });

    const venueMap = createdVenues.reduce((acc, venue) => {
      acc[venue.nombre.split(' ')[0]] = venue.id; // 'Estadio' -> 'Estadio', 'Ágora' -> 'Ágora'
      return acc;
    }, {});


    // --- 3. Crear Zonas para cada Recinto ---
    await queryInterface.bulkInsert('zones', [
      // Zonas para el Estadio
      { nombre: 'General', capacidad: 15000, venue_id: venueMap.Estadio, created_at: now },
      { nombre: 'Preferencia', capacidad: 10000, venue_id: venueMap.Estadio, created_at: now },
      { nombre: 'Tribuna', capacidad: 8000, venue_id: venueMap.Estadio, created_at: now },
      { nombre: 'Palco', capacidad: 2000, venue_id: venueMap.Estadio, created_at: now },
      // Zonas para el Ágora
      { nombre: 'VIP', capacidad: 500, venue_id: venueMap.Ágora, created_at: now },
      { nombre: 'Preferencia', capacidad: 1500, venue_id: venueMap.Ágora, created_at: now },
      { nombre: 'General', capacidad: 2000, venue_id: venueMap.Ágora, created_at: now },
    ], {});


    // --- 4. Crear Eventos ---
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    await queryInterface.bulkInsert('events', [
      // Evento publicado
      {
        nombre: 'Concierto de Rock Sinfónico',
        descripcion: 'Una noche única donde el rock clásico se encuentra con la majestuosidad de una orquesta sinfónica. Revive los grandes éxitos de Queen, Led Zeppelin y más.',
        fecha_inicio: nextWeek,
        fecha_fin: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000), // 2 horas de duración
        imagen_url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
        status: 'PUBLICADO',
        category_id: categoryMap.Música,
        venue_id: venueMap.Ágora,
        organizer_id: organizerId,
        created_at: now
      },
      // Evento en borrador
      {
        nombre: 'Final del Campeonato Nacional',
        descripcion: 'El partido decisivo que coronará al nuevo campeón del fútbol nacional. ¡No te quedes fuera!',
        fecha_inicio: nextMonth,
        fecha_fin: new Date(nextMonth.getTime() + 2 * 60 * 60 * 1000),
        imagen_url: 'https://images.pexels.com/photos/270085/pexels-photo-270085.jpeg',
        status: 'BORRADOR',
        category_id: categoryMap.Deportes,
        venue_id: venueMap.Estadio,
        organizer_id: organizerId,
        created_at: now
      },
       // Otro evento publicado
       {
        nombre: 'Stand-up de Noche: Riendo a Carcajadas',
        descripcion: 'Los mejores comediantes del país se reúnen en una noche para hacerte reír sin parar.',
        fecha_inicio: tomorrow,
        fecha_fin: new Date(tomorrow.getTime() + 1.5 * 60 * 60 * 1000), // 1.5 horas
        imagen_url: 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg',
        status: 'PUBLICADO',
        category_id: categoryMap.Teatro,
        venue_id: venueMap.Ágora,
        organizer_id: organizerId,
        created_at: now
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // El orden de borrado es inverso al de creación
    await queryInterface.bulkDelete('events', null, {});
    await queryInterface.bulkDelete('zones', null, {});
    await queryInterface.bulkDelete('venues', null, {});
    await queryInterface.bulkDelete('categories', null, {});
  }
};
