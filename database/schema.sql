-- Smart Internship & Placement Portal
-- MySQL 8.4.9 schema matching the Spring Boot entities on origin/integration.

CREATE DATABASE IF NOT EXISTS placement_portal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE placement_portal;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    CONSTRAINT chk_users_role CHECK (role IN ('STUDENT', 'COMPANY', 'ADMIN'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS students (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    `year` INT,
    skills TEXT,
    resume_url VARCHAR(500),
    PRIMARY KEY (id),
    UNIQUE KEY uk_students_user_id (user_id),
    KEY idx_students_department (department),
    CONSTRAINT fk_students_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS companies (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(150),
    PRIMARY KEY (id),
    UNIQUE KEY uk_companies_user_id (user_id),
    KEY idx_companies_name (company_name),
    CONSTRAINT fk_companies_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    skills_required TEXT NOT NULL,
    location VARCHAR(150) NOT NULL,
    salary DECIMAL(12, 2),
    job_type VARCHAR(20) NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (id),
    KEY idx_jobs_company_id (company_id),
    KEY idx_jobs_status_deadline (status, deadline),
    CONSTRAINT chk_jobs_type CHECK (job_type IN ('INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'CONTRACT')),
    CONSTRAINT chk_jobs_status CHECK (status IN ('ACTIVE', 'CLOSED')),
    CONSTRAINT fk_jobs_company
        FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS applications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    application_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    status VARCHAR(20) NOT NULL DEFAULT 'APPLIED',
    PRIMARY KEY (id),
    UNIQUE KEY uk_application_student_job (student_id, job_id),
    KEY idx_applications_student_id (student_id),
    KEY idx_applications_job_id (job_id),
    KEY idx_applications_status (status),
    CONSTRAINT chk_applications_status CHECK (status IN ('APPLIED', 'SHORTLISTED', 'REJECTED')),
    CONSTRAINT fk_applications_student
        FOREIGN KEY (student_id) REFERENCES students (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_applications_job
        FOREIGN KEY (job_id) REFERENCES jobs (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

ALTER TABLE applications
    MODIFY COLUMN application_date DATE NOT NULL DEFAULT (CURRENT_DATE);
