-- Seed: Test trips
-- Description: Creates sample trips with translations and dates

-- Create test trip
INSERT INTO trips (
    destination,
    trip_type,
    price,
    featured,
    created_by
) VALUES (
    'Tokyo',
    'cultural',
    2499.99,
    true,
    1  -- Admin user
);

-- Add translations
INSERT INTO trip_translations (
    trip_id,
    language,
    title,
    description,
    itinerary
) VALUES 
-- Spanish
(1, 'es',
 'Descubre Tokyo: La Ciudad del Futuro',
 'Sumérgete en la fascinante mezcla de tradición y modernidad de Tokyo. Este viaje te llevará a través de antiguos templos, jardines zen y rascacielos futuristas.',
 'Día 1: Llegada y visita al templo Senso-ji\nDía 2: Distrito de Akihabara y Torre Skytree\nDía 3: Jardines del Palacio Imperial\nDía 4: Shibuya y Harajuku\nDía 5: Monte Fuji (excursión opcional)'
),
-- English
(1, 'en',
 'Discover Tokyo: The City of the Future',
 'Immerse yourself in Tokyo''s fascinating blend of tradition and modernity. This journey will take you through ancient temples, zen gardens, and futuristic skyscrapers.',
 'Day 1: Arrival and Senso-ji Temple visit\nDay 2: Akihabara District and Skytree Tower\nDay 3: Imperial Palace Gardens\nDay 4: Shibuya and Harajuku\nDay 5: Mount Fuji (optional tour)'
);

-- Add trip images
INSERT INTO trip_images (
    trip_id,
    url,
    description
) VALUES 
(1, 'https://storage.asiaexperiences.com/trips/tokyo-skyline.jpg', 'Tokyo skyline at night'),
(1, 'https://storage.asiaexperiences.com/trips/senso-ji.jpg', 'Senso-ji Temple');

-- Add available dates
INSERT INTO available_dates (
    trip_id,
    start_date,
    end_date,
    available_spots
) VALUES 
(1, '2024-07-15', '2024-07-20', 15),
(1, '2024-08-10', '2024-08-15', 15),
(1, '2024-09-05', '2024-09-10', 15);
