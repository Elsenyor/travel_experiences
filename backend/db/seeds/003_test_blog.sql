-- Seed: Test blog content
-- Description: Creates sample blog articles with translations and tags

-- Create tags
INSERT INTO tags (name) VALUES 
('culture'),
('food'),
('travel-tips'),
('destinations');

-- Create article
INSERT INTO articles (
    author_id,
    featured_image
) VALUES (
    1,  -- Admin user
    'https://storage.asiaexperiences.com/blog/japanese-food-guide.jpg'
);

-- Add article translations
INSERT INTO article_translations (
    article_id,
    language,
    title,
    content
) VALUES 
-- Spanish
(1, 'es',
 'Guía Definitiva de la Gastronomía Japonesa',
 'La gastronomía japonesa es mucho más que sushi y ramen. En esta guía completa, exploraremos los platos más emblemáticos de Japón, desde el delicado sashimi hasta el reconfortante udon.\n\n
 ## Los Fundamentos\n
 La cocina japonesa se basa en varios pilares fundamentales: arroz, pescado, verduras fermentadas y caldo dashi. Cada elemento juega un papel crucial en la creación de sabores únicos y equilibrados.\n\n
 ## Platos Imprescindibles\n
 1. Sushi: Más allá del famoso nigiri, descubre los diferentes estilos\n
 2. Ramen: Un viaje por las variedades regionales\n
 3. Tempura: El arte de la fritura perfecta\n
 4. Washoku: La tradición de la comida casera'
),
-- English
(1, 'en',
 'The Ultimate Guide to Japanese Cuisine',
 'Japanese cuisine is much more than sushi and ramen. In this comprehensive guide, we''ll explore Japan''s most iconic dishes, from delicate sashimi to comforting udon.\n\n
 ## The Fundamentals\n
 Japanese cuisine is built on several fundamental pillars: rice, fish, fermented vegetables, and dashi stock. Each element plays a crucial role in creating unique and balanced flavors.\n\n
 ## Must-Try Dishes\n
 1. Sushi: Beyond the famous nigiri, discover different styles\n
 2. Ramen: A journey through regional varieties\n
 3. Tempura: The art of perfect frying\n
 4. Washoku: The tradition of home cooking'
);

-- Link article with tags
INSERT INTO article_tags (article_id, tag_id) VALUES 
(1, 1),  -- culture
(1, 2);  -- food
