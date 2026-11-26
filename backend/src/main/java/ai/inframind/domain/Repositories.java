package ai.inframind.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    List<User> findByRole(Role role);
    List<User> findByRoleIn(Collection<Role> roles);
}

interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByAssignedEngineerId(Long userId);
    Optional<Asset> findByAssetCodeIgnoreCase(String assetCode);
}

interface WorkItemRepository extends JpaRepository<WorkItem, Long> {
    List<WorkItem> findByReporterIdOrderByCreatedAtDesc(Long userId);
    List<WorkItem> findByAssigneeIdOrderByCreatedAtDesc(Long userId);
    List<WorkItem> findByStatusOrderByCreatedAtDesc(String status);
    List<WorkItem> findByKindOrderByCreatedAtDesc(String kind);
    List<WorkItem> findAllByOrderByCreatedAtDesc();
}

interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findTop20ByRequestedByIdOrderByCreatedAtDesc(Long userId);
    List<Prediction> findTop20ByAssetIdOrderByCreatedAtDesc(Long assetId);
    List<Prediction> findAllByOrderByCreatedAtDesc();
}

interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop30ByUserIdOrderByCreatedAtDesc(Long userId);
}
