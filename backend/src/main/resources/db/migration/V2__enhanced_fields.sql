ALTER TABLE assets ADD COLUMN construction_year INT NULL;
ALTER TABLE assets ADD COLUMN department VARCHAR(120) NULL;
ALTER TABLE assets ADD COLUMN displacement_baseline DECIMAL(8,3) DEFAULT 0.0;
ALTER TABLE assets ADD COLUMN structural_health INT DEFAULT 85;

ALTER TABLE work_items ADD COLUMN due_date DATE NULL;
ALTER TABLE work_items ADD COLUMN evidence_photo_url VARCHAR(1000) NULL;
ALTER TABLE work_items ADD COLUMN completion_photo_url VARCHAR(1000) NULL;
ALTER TABLE work_items ADD COLUMN work_performed TEXT NULL;
ALTER TABLE work_items ADD COLUMN materials_used TEXT NULL;
ALTER TABLE work_items ADD COLUMN completion_remarks TEXT NULL;
ALTER TABLE work_items ADD COLUMN reviewer_remarks TEXT NULL;
