package ai.inframind.domain;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AssetRepository assets;
    private final JdbcTemplate jdbc;

    DataInitializer(UserRepository users, PasswordEncoder passwordEncoder, AssetRepository assets, JdbcTemplate jdbc) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.assets = assets;
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        try {
            seedExactRoles();
            ensureLongtextColumns();
            seedDefaultAssets();
        } catch (Exception e) {
            log.error("Error during initial municipal user provisioning: {}", e.getMessage(), e);
        }
    }

    private void ensureLongtextColumns() {
        try {
            jdbc.execute("ALTER TABLE assets MODIFY COLUMN image_url LONGTEXT");
            jdbc.execute("ALTER TABLE work_items MODIFY COLUMN evidence_photo_url LONGTEXT");
            jdbc.execute("ALTER TABLE work_items MODIFY COLUMN completion_photo_url LONGTEXT");
            log.info("Verified LONGTEXT column definitions for photo uploads.");
        } catch (Exception e) {
            log.debug("Note on column alteration: {}", e.getMessage());
        }
    }

    private void seedDefaultAssets() {
        if (assets.count() > 0) {
            log.info("Assets table already contains {} records. Skipping default seeding.", assets.count());
            return;
        }

        User municipalOfficer = users.findByEmailIgnoreCase("btharunreddy26@gmail.com").orElse(null);
        User infraEngineer = users.findByEmailIgnoreCase("btharunreddy30@gmail.com").orElse(null);

        if (municipalOfficer == null || infraEngineer == null) {
            log.warn("Cannot seed assets: municipalOfficer or infraEngineer user not found.");
            return;
        }

        // 1. Garuda Varadhi Elevated Corridor
        Asset garuda = new Asset();
        garuda.assetCode = "TIR-BRG-2026-01";
        garuda.name = "Garuda Varadhi Elevated Corridor";
        garuda.category = "BRIDGE";
        garuda.locationText = "Tirupati Central Bus Station to Alipiri Bypass Corridor, Tirupati";
        garuda.latitude = 13.6358;
        garuda.longitude = 79.4244;
        garuda.constructionYear = 2021;
        garuda.department = "Bridge & Arterial Corridors Division";
        garuda.displacementBaseline = 11.8;
        garuda.structuralHealth = 82;
        garuda.imageUrl = "/cards/feature_1.png";
        garuda.status = "ACTIVE";
        garuda.owner = municipalOfficer;
        garuda.assignedEngineer = infraEngineer;
        assets.save(garuda);

        // 2. Alipiri Swamy Pushkarini Flyover
        Asset alipiri = new Asset();
        alipiri.assetCode = "TIR-FLY-2026-02";
        alipiri.name = "Alipiri Swamy Pushkarini Flyover";
        alipiri.category = "OVERPASS";
        alipiri.locationText = "Alipiri Link Road, Foot of Tirumala Hills, Tirupati";
        alipiri.latitude = 13.6521;
        alipiri.longitude = 79.4012;
        alipiri.constructionYear = 2018;
        alipiri.department = "Bridge & Arterial Corridors Division";
        alipiri.displacementBaseline = 9.4;
        alipiri.structuralHealth = 88;
        alipiri.imageUrl = "/cards/feature_2.png";
        alipiri.status = "ACTIVE";
        alipiri.owner = municipalOfficer;
        alipiri.assignedEngineer = infraEngineer;
        assets.save(alipiri);

        // 3. Renigunta Junction Overpass
        Asset renigunta = new Asset();
        renigunta.assetCode = "TIR-OVP-2026-03";
        renigunta.name = "Renigunta Junction Overpass";
        renigunta.category = "OVERPASS";
        renigunta.locationText = "Renigunta Railway Junction Interchange NH-71, Tirupati";
        renigunta.latitude = 13.6492;
        renigunta.longitude = 79.5120;
        renigunta.constructionYear = 2016;
        renigunta.department = "Highways & Expressways Division";
        renigunta.displacementBaseline = 12.5;
        renigunta.structuralHealth = 71;
        renigunta.imageUrl = "/cards/infra_card_2.png";
        renigunta.status = "ACTIVE";
        renigunta.owner = municipalOfficer;
        renigunta.assignedEngineer = infraEngineer;
        assets.save(renigunta);

        log.info("Default Tirupati municipal assets seeded successfully: Garuda Varadhi, Alipiri Flyover, Renigunta Overpass.");
    }

    private void seedExactRoles() {
        String password = "Tharun@30";

        // 1. Municipal Officer
        upsertUser("btharunreddy26@gmail.com", "B. Tharun Reddy (Municipal Officer)", Role.MUNICIPAL_ENGINEER, password, "+91 98765 26001", "Municipal Engineering Directorate");

        // 2. Infrastructure Officer
        upsertUser("btharunreddy30@gmail.com", "B. Tharun Reddy (Infrastructure Officer)", Role.INFRASTRUCTURE_ENGINEER, password, "+91 98765 30002", "Structural Health & Bridge Monitoring Cell");

        // 3. Maintenance Officer
        upsertUser("btharunreddy3006@gmail.com", "B. Tharun Reddy (Maintenance Officer)", Role.MAINTENANCE_TEAM, password, "+91 98765 30006", "Civil Infrastructure Rapid Repair Wing");

        // 4. Admin
        upsertUser("btharunreddy11@gmail.com", "B. Tharun Reddy (System Administrator)", Role.ADMIN, password, "+91 98765 11000", "Municipal Governance Administration");

        log.info("Provisioned exact 4 operational roles with specified credentials successfully.");
    }

    private void upsertUser(String email, String fullName, Role role, String rawPassword, String mobile, String dept) {
        User u = users.findByEmailIgnoreCase(email).orElseGet(User::new);
        u.email = email.trim().toLowerCase();
        u.fullName = fullName;
        u.role = role;
        u.mobile = mobile;
        u.city = "Tirupati";
        u.state = "Andhra Pradesh";
        u.address = dept;
        u.active = true;
        u.passwordHash = passwordEncoder.encode(rawPassword);
        users.save(u);
    }
}
