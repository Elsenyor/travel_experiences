-- Newsletter Seed Data
-- Description: Sample data for newsletter system testing
-- Date: 2024-01-20
-- Author: System

-- Insert sample newsletter subscribers
INSERT INTO newsletter_subscribers (email, preferred_language, status, subscription_date) VALUES
('test1@example.com', 'es', 'active', NOW()),
('test2@example.com', 'en', 'active', NOW()),
('test3@example.com', 'es', 'active', NOW()),
('test4@example.com', 'en', 'active', NOW()),
('test5@example.com', 'es', 'active', NOW()),
('inactive@example.com', 'es', 'inactive', NOW()),
('spanish@example.com', 'es', 'active', NOW()),
('english@example.com', 'en', 'active', NOW());

-- Insert sample newsletter campaigns
INSERT INTO newsletter_campaigns (language, subject, content, created_at) VALUES
('es', 'Bienvenidos a Asia Experiences', '¡Hola! Te damos la bienvenida a nuestra newsletter donde compartiremos las mejores experiencias de viaje en Asia.', NOW()),
('en', 'Welcome to Asia Experiences', 'Hello! Welcome to our newsletter where we will share the best travel experiences in Asia.', NOW()),
('es', 'Ofertas Especiales de Verano', 'Descubre nuestras ofertas especiales para viajes de verano en Asia con descuentos increíbles.', NOW()),
('en', 'Special Summer Offers', 'Discover our special offers for summer travel in Asia with incredible discounts.', NOW());

-- Insert sample newsletter sends (for the first campaign)
INSERT INTO newsletter_sends (campaign_id, subscriber_id, status, sent_date, created_at) VALUES
(1, 1, 'sent', NOW(), NOW()),
(1, 3, 'sent', NOW(), NOW()),
(1, 5, 'sent', NOW(), NOW()),
(1, 7, 'sent', NOW(), NOW()),
(2, 2, 'sent', NOW(), NOW()),
(2, 4, 'sent', NOW(), NOW()),
(2, 8, 'sent', NOW(), NOW()),
(3, 1, 'pending', NULL, NOW()),
(3, 3, 'pending', NULL, NOW()),
(3, 5, 'pending', NULL, NOW()),
(3, 7, 'pending', NULL, NOW()),
(4, 2, 'pending', NULL, NOW()),
(4, 4, 'pending', NULL, NOW()),
(4, 8, 'pending', NULL, NOW());

-- Mark first two campaigns as sent
UPDATE newsletter_campaigns SET sent_date = NOW() WHERE id IN (1, 2);
