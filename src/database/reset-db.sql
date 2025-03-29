-- Desabilita verificações de chave estrangeira temporariamente
SET session_replication_role = 'replica';

-- Drop todas as tabelas
DROP TABLE IF EXISTS migrations_typeorm CASCADE;
DROP TABLE IF EXISTS migrations CASCADE;
DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS appointment_service CASCADE;
DROP TABLE IF EXISTS appointment_product CASCADE;
DROP TABLE IF EXISTS appointment CASCADE;
DROP TABLE IF EXISTS working_hours CASCADE;
DROP TABLE IF EXISTS employee_service CASCADE;
DROP TABLE IF EXISTS employee CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS service CASCADE;
DROP TABLE IF EXISTS phone CASCADE;
DROP TABLE IF EXISTS address CASCADE;
DROP TABLE IF EXISTS barbershop_enterprise CASCADE;
DROP TABLE IF EXISTS barbershop CASCADE;
DROP TABLE IF EXISTS profile CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Drop todos os tipos ENUM
DROP TYPE IF EXISTS profile_type CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS day_of_week CASCADE;

-- Reabilita verificações de chave estrangeira
SET session_replication_role = 'origin'; 