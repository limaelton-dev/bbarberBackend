import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1743269094800 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE profile_type AS ENUM ('client', 'barbershop');
            CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
            CREATE TYPE day_of_week AS ENUM ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');

            CREATE TABLE "user" (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
            );

            -- Profiles table
            CREATE TABLE profile (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
            type profile_type NOT NULL,
            full_name TEXT NOT NULL,
            avatar_url TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
            );

            -- Barbershops table
            CREATE TABLE barbershop (
            id SERIAL PRIMARY KEY,
            profile_id INTEGER NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            logo_url TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
            );

            CREATE TABLE barbershop_enterprise (
                id SERIAL PRIMARY KEY,
                barbershop_id INTEGER NOT NULL REFERENCES barbershop(id) ON DELETE CASCADE,
                company_name TEXT,
                cnpj TEXT UNIQUE,
                state_registration TEXT UNIQUE,
                trade_name TEXT UNIQUE,
                municipal_registration TEXT UNIQUE
            );

            -- Addresses table
            CREATE TABLE address (
            id SERIAL PRIMARY KEY,    
            barbershop_id INTEGER REFERENCES barbershop(id) ON DELETE CASCADE,
            profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
            street TEXT NOT NULL,
            number TEXT NOT NULL,
            complement TEXT,
            district TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            postal_code TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            CONSTRAINT address_owner CHECK (
                (barbershop_id IS NOT NULL AND profile_id IS NULL) OR
                (barbershop_id IS NULL AND profile_id IS NOT NULL)
            )
            );

            -- Phones table
            CREATE TABLE phone (
                id SERIAL PRIMARY KEY,
                barbershop_id INTEGER REFERENCES barbershop(id) ON DELETE CASCADE,
                profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
                number TEXT NOT NULL,
                is_primary BOOLEAN DEFAULT false,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now(),
                CONSTRAINT phone_owner CHECK (
                    (barbershop_id IS NOT NULL AND profile_id IS NULL) OR
                    (barbershop_id IS NULL AND profile_id IS NOT NULL)
                )
            );

            -- Services table
            CREATE TABLE service (
            id SERIAL PRIMARY KEY,
            barbershop_id INTEGER NOT NULL REFERENCES barbershop(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
            duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
            );

            -- Products table
            CREATE TABLE product (
            id SERIAL PRIMARY KEY,
            barbershop_id INTEGER NOT NULL REFERENCES barbershop(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
            cost_price DECIMAL(10,2) NOT NULL CHECK (cost_price >= 0),
            image_url TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
            );

            -- Employees table
            CREATE TABLE employee (
            id SERIAL PRIMARY KEY,
            barbershop_id INTEGER NOT NULL REFERENCES barbershop(id) ON DELETE CASCADE,
            commission_rate DECIMAL(5,2) CHECK (commission_rate >= 0 AND commission_rate <= 100), -- percentage
            base_salary DECIMAL(10,2) CHECK (base_salary >= 0),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
            );

            -- Employee Service (junction table)
            CREATE TABLE employee_service (
            employee_id INTEGER REFERENCES employee(id) ON DELETE CASCADE,
            service_id INTEGER REFERENCES service(id) ON DELETE CASCADE,
            PRIMARY KEY (employee_id, service_id)
            );

            CREATE TABLE working_hours (
                id SERIAL PRIMARY KEY,
                barbershop_id INTEGER REFERENCES barbershop(id) ON DELETE CASCADE,
                employee_id INTEGER REFERENCES employee(id) ON DELETE CASCADE,
                day_of_week day_of_week NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now(),
                CONSTRAINT working_hours_owner CHECK (
                    (barbershop_id IS NOT NULL AND employee_id IS NULL) OR
                    (barbershop_id IS NULL AND employee_id IS NOT NULL)
                ),
                CONSTRAINT valid_time_range CHECK (end_time > start_time)
            );

            -- Appointments table
            CREATE TABLE appointment (
            id SERIAL PRIMARY KEY,
            barbershop_id INTEGER NOT NULL REFERENCES barbershop(id) ON DELETE CASCADE,
            client_id INTEGER NOT NULL REFERENCES profile(id),
            employee_id INTEGER NOT NULL REFERENCES employee(id),
            date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            status appointment_status DEFAULT 'pending',
            total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            CONSTRAINT valid_appointment_time CHECK (end_time > start_time)
            );

            CREATE TABLE appointment_product (
                id SERIAL PRIMARY KEY,
                appointment_id INTEGER NOT NULL REFERENCES appointment(id) ON DELETE CASCADE,
                product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
                quantity INTEGER NOT NULL CHECK (quantity > 0)
            );

            CREATE TABLE appointment_service (
                id SERIAL PRIMARY KEY,
                appointment_id INTEGER NOT NULL REFERENCES appointment(id) ON DELETE CASCADE,
                service_id INTEGER NOT NULL REFERENCES service(id) ON DELETE CASCADE
            );

            -- Reviews table
            CREATE TABLE review (
            id SERIAL PRIMARY KEY,
            barbershop_id INTEGER NOT NULL REFERENCES barbershop(id) ON DELETE CASCADE,
            client_id INTEGER NOT NULL REFERENCES profile(id),
            appointment_id INTEGER REFERENCES appointment(id),
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
            );

            -- Create indexes
            CREATE INDEX idx_profiles_type ON profile(type);
            CREATE INDEX idx_barbershops_owner ON barbershop(profile_id);
            CREATE INDEX idx_addresses_barbershop ON address(barbershop_id);
            CREATE INDEX idx_addresses_profile ON address(profile_id);
            CREATE INDEX idx_phone_barbershop ON phone(barbershop_id);
            CREATE INDEX idx_phone_profile ON phone(profile_id);
            CREATE INDEX idx_service_barbershop ON service(barbershop_id);
            CREATE INDEX idx_product_barbershop ON product(barbershop_id);
            CREATE INDEX idx_employee_barbershop ON employee(barbershop_id);
            CREATE INDEX idx_working_hours_barbershop ON working_hours(barbershop_id);
            CREATE INDEX idx_working_hours_employee ON working_hours(employee_id);
            CREATE INDEX idx_appointment_barbershop ON appointment(barbershop_id);
            CREATE INDEX idx_appointment_client ON appointment(client_id);
            CREATE INDEX idx_appointment_employee ON appointment(employee_id);
            CREATE INDEX idx_appointment_date ON appointment(date);
            CREATE INDEX idx_appointment_product_appointment_id ON appointment_product(appointment_id);
            CREATE INDEX idx_appointment_product_product_id ON appointment_product(product_id);
            CREATE INDEX idx_appointment_service_appointment_id ON appointment_service(appointment_id);
            CREATE INDEX idx_appointment_service_service_id ON appointment_service(service_id);
            CREATE INDEX idx_review_barbershop ON review(barbershop_id);
            CREATE INDEX idx_review_client ON review(client_id);

            -- Create functions for updated_at
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = now();
                RETURN NEW;
            END;
            $$ LANGUAGE 'plpgsql';

            -- Create triggers for updated_at
            CREATE TRIGGER update_profile_updated_at
                BEFORE UPDATE ON profile
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            CREATE TRIGGER update_barbershops_updated_at
                BEFORE UPDATE ON barbershop
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- Drop triggers
            DROP TRIGGER IF EXISTS update_barbershops_updated_at ON barbershop;
            DROP TRIGGER IF EXISTS update_profile_updated_at ON profile;
            
            -- Drop function
            DROP FUNCTION IF EXISTS update_updated_at_column();
            
            -- Drop indexes
            DROP INDEX IF EXISTS idx_review_client;
            DROP INDEX IF EXISTS idx_review_barbershop;
            DROP INDEX IF EXISTS idx_appointment_service_service_id;
            DROP INDEX IF EXISTS idx_appointment_service_appointment_id;
            DROP INDEX IF EXISTS idx_appointment_product_product_id;
            DROP INDEX IF EXISTS idx_appointment_product_appointment_id;
            DROP INDEX IF EXISTS idx_appointment_date;
            DROP INDEX IF EXISTS idx_appointment_employee;
            DROP INDEX IF EXISTS idx_appointment_client;
            DROP INDEX IF EXISTS idx_appointment_barbershop;
            DROP INDEX IF EXISTS idx_working_hours_employee;
            DROP INDEX IF EXISTS idx_working_hours_barbershop;
            DROP INDEX IF EXISTS idx_employee_barbershop;
            DROP INDEX IF EXISTS idx_product_barbershop;
            DROP INDEX IF EXISTS idx_service_barbershop;
            DROP INDEX IF EXISTS idx_phone_profile;
            DROP INDEX IF EXISTS idx_phone_barbershop;
            DROP INDEX IF EXISTS idx_addresses_profile;
            DROP INDEX IF EXISTS idx_addresses_barbershop;
            DROP INDEX IF EXISTS idx_barbershops_owner;
            DROP INDEX IF EXISTS idx_profiles_type;
            
            -- Drop tables
            DROP TABLE IF EXISTS review;
            DROP TABLE IF EXISTS appointment_service;
            DROP TABLE IF EXISTS appointment_product;
            DROP TABLE IF EXISTS appointment;
            DROP TABLE IF EXISTS working_hours;
            DROP TABLE IF EXISTS employee_service;
            DROP TABLE IF EXISTS employee;
            DROP TABLE IF EXISTS product;
            DROP TABLE IF EXISTS service;
            DROP TABLE IF EXISTS phone;
            DROP TABLE IF EXISTS address;
            DROP TABLE IF EXISTS barbershop_enterprise;
            DROP TABLE IF EXISTS barbershop;
            DROP TABLE IF EXISTS profile;
            DROP TABLE IF EXISTS "user";
            
            -- Drop types
            DROP TYPE IF EXISTS day_of_week;
            DROP TYPE IF EXISTS appointment_status;
            DROP TYPE IF EXISTS profile_type;
        `);
    }
}
