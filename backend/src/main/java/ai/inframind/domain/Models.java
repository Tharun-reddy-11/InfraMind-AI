package ai.inframind.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name="users")
class User {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    Long id;

    @Column(name="full_name", nullable=false)
    String fullName;

    @Column(unique=true, nullable=false)
    String email;

    String mobile;
    String address;
    String city;
    String state;

    @Column(name="pin_code")
    String pinCode;

    @Column(name="password_hash", nullable=false)
    String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    Role role;

    boolean active = true;

    @Column(name="created_at", nullable=false)
    Instant createdAt = Instant.now();
}

enum Role {
    ADMIN,
    MUNICIPAL_ENGINEER,
    INFRASTRUCTURE_ENGINEER,
    MAINTENANCE_TEAM,
    CITIZEN
}

@Entity
@Table(name="assets")
class Asset {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    Long id;

    @Column(name="asset_code", unique=true, nullable=false)
    String assetCode;

    @Column(nullable=false)
    String name;

    @Column(nullable=false)
    String category;

    @Column(name="location_text", nullable=false)
    String locationText;

    Double latitude;
    Double longitude;

    @Column(name="construction_year")
    Integer constructionYear;

    String department;

    @Column(name="displacement_baseline")
    Double displacementBaseline = 0.0;

    @Column(name="structural_health")
    Integer structuralHealth = 85;

    @Column(name="image_url", columnDefinition="LONGTEXT")
    String imageUrl;

    @Column(nullable=false)
    String status = "ACTIVE";

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="owner_id", nullable=false)
    User owner;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="assigned_engineer_id")
    User assignedEngineer;

    @Column(name="created_at", nullable=false)
    Instant createdAt = Instant.now();
}

@Entity
@Table(name="work_items")
class WorkItem {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    Long id;

    @Column(nullable=false)
    String kind; // COMPLAINT, MAINTENANCE_REQUEST, INSPECTION, REPAIR_ORDER

    @Column(nullable=false)
    String title;

    @Column(columnDefinition="TEXT", nullable=false)
    String description;

    @Column(nullable=false)
    String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable=false)
    String status = "SUBMITTED"; // SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, ASSIGNED, IN_PROGRESS, COMPLETED, VERIFIED, CLOSED

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="asset_id")
    Asset asset;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="reporter_id", nullable=false)
    User reporter;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="reviewer_id")
    User reviewer;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="assignee_id")
    User assignee;

    @Column(name="due_date")
    LocalDate dueDate;

    @Column(name="evidence_photo_url", columnDefinition="LONGTEXT")
    String evidencePhotoUrl;

    @Column(name="completion_photo_url", columnDefinition="LONGTEXT")
    String completionPhotoUrl;

    @Column(name="work_performed", columnDefinition="TEXT")
    String workPerformed;

    @Column(name="materials_used", columnDefinition="TEXT")
    String materialsUsed;

    @Column(name="completion_remarks", columnDefinition="TEXT")
    String completionRemarks;

    @Column(name="reviewer_remarks", columnDefinition="TEXT")
    String reviewerRemarks;

    @Column(name="created_at", nullable=false)
    Instant createdAt = Instant.now();

    @Column(name="updated_at", nullable=false)
    Instant updatedAt = Instant.now();

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}

@Entity
@Table(name="predictions")
class Prediction {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="asset_id")
    Asset asset;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="requested_by", nullable=false)
    User requestedBy;

    @Column(name="model_name", nullable=false)
    String modelName;

    @Column(name="model_version")
    String modelVersion;

    @Column(nullable=false)
    String status;

    @Column(name="result_json", columnDefinition="json")
    String resultJson;

    @Column(name="created_at", nullable=false)
    Instant createdAt = Instant.now();
}

@Entity
@Table(name="notifications")
class Notification {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false)
    User user;

    @Column(nullable=false)
    String title;

    @Column(nullable=false)
    String message;

    @Column(name="read_at")
    Instant readAt;

    @Column(name="created_at", nullable=false)
    Instant createdAt = Instant.now();
}
