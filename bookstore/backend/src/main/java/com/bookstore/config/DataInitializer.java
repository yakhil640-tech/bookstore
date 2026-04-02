package com.bookstore.config;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.bookstore.entity.Book;
import com.bookstore.entity.Role;
import com.bookstore.entity.SubscriptionPlan;
import com.bookstore.entity.User;
import com.bookstore.entity.enums.UserStatus;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.RoleRepository;
import com.bookstore.repository.SubscriptionPlanRepository;
import com.bookstore.repository.UserRepository;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private static final String ROLE_USER = "ROLE_USER";
    private static final String ROLE_SUBSCRIBER = "ROLE_SUBSCRIBER";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String DEFAULT_ADMIN_EMAIL = "admin@bookstore.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "Admin@123";
    private static final BigDecimal DEFAULT_SUBSCRIPTION_PRICE = new BigDecimal("299.00");

    @Bean
    public CommandLineRunner seedData(RoleRepository roleRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            SubscriptionPlanRepository subscriptionPlanRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            Role userRole = getOrCreateRole(roleRepository, ROLE_USER);
            getOrCreateRole(roleRepository, ROLE_SUBSCRIBER);
            Role adminRole = getOrCreateRole(roleRepository, ROLE_ADMIN);

            seedAdminUser(userRepository, passwordEncoder, userRole, adminRole);
            seedSubscriptionPlan(subscriptionPlanRepository);
            seedBooks(bookRepository);
        };
    }

    private void seedAdminUser(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            Role userRole,
            Role adminRole) {
        User admin = userRepository.findByEmailIgnoreCase(DEFAULT_ADMIN_EMAIL)
                .orElseGet(User::new);

        admin.setFullName("Bookstore Admin");
        admin.setEmail(DEFAULT_ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
        admin.setPhoneNumber("9999999999");
        admin.setEnabled(true);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setRoles(new HashSet<>(List.of(userRole, adminRole)));

        userRepository.save(admin);
        logger.info("Default admin user synced with email {}", DEFAULT_ADMIN_EMAIL);
    }

    private void seedSubscriptionPlan(SubscriptionPlanRepository subscriptionPlanRepository) {
        SubscriptionPlan plan = subscriptionPlanRepository.findFirstByActiveTrue()
                .orElseGet(SubscriptionPlan::new);
        plan.setName("Monthly Plan");
        plan.setDurationDays(30);
        plan.setPrice(DEFAULT_SUBSCRIPTION_PRICE);
        plan.setActive(true);
        subscriptionPlanRepository.save(plan);

        logger.info("Default subscription plan synced at price {}", DEFAULT_SUBSCRIPTION_PRICE);
    }

    private void seedBooks(BookRepository bookRepository) {
        List<Book> desiredBooks = List.of(
                buildBook("Clean Code", "Robert C. Martin", "A practical guide to writing clean and maintainable code.", "399.00", 20, 450, "uploads/previews/clean-code-preview.pdf", "uploads/full/clean-code.pdf"),
                buildBook("Spring in Action", "Craig Walls", "A beginner-friendly guide to building applications with Spring.", "499.00", 18, 520, "uploads/previews/spring-in-action-preview.pdf", "uploads/full/spring-in-action.pdf"),
                buildBook("Effective Java", "Joshua Bloch", "Best practices for writing robust Java applications.", "449.00", 15, 410, "uploads/previews/effective-java-preview.pdf", "uploads/full/effective-java.pdf"),
                buildBook("Java Concurrency in Practice", "Brian Goetz", "Understand threads, concurrency, and safe Java programming.", "429.00", 12, 380, "uploads/previews/java-concurrency-preview.pdf", "uploads/full/java-concurrency.pdf"),
                buildBook("Head First Design Patterns", "Eric Freeman", "Learn design patterns with simple examples and visuals.", "469.00", 16, 490, "uploads/previews/design-patterns-preview.pdf", "uploads/full/design-patterns.pdf"),
                buildBook("Refactoring", "Martin Fowler", "Improve existing code structure without changing behavior.", "489.00", 14, 470, "uploads/previews/refactoring-preview.pdf", "uploads/full/refactoring.pdf"));

        List<Book> existingBooks = bookRepository.findAll();
        List<Book> booksToSave = new ArrayList<>();

        for (Book desiredBook : desiredBooks) {
            Book book = existingBooks.stream()
                    .filter(existingBook -> existingBook.getTitle() != null
                            && existingBook.getTitle().equalsIgnoreCase(desiredBook.getTitle()))
                    .findFirst()
                    .orElseGet(Book::new);

            book.setTitle(desiredBook.getTitle());
            book.setAuthor(desiredBook.getAuthor());
            book.setDescription(desiredBook.getDescription());
            book.setPrice(desiredBook.getPrice());
            book.setPreviewPageCount(desiredBook.getPreviewPageCount());
            book.setFullPageCount(desiredBook.getFullPageCount());
            book.setPreviewFilePath(desiredBook.getPreviewFilePath());
            book.setFullFilePath(desiredBook.getFullFilePath());

            if (book.getActive() == null) {
                book.setActive(true);
            }

            booksToSave.add(book);
        }

        bookRepository.saveAll(booksToSave);
        logger.info("Seeded or synced {} sample books", booksToSave.size());
    }

    private Book buildBook(String title,
            String author,
            String description,
            String price,
            int previewPageCount,
            int fullPageCount,
            String previewFilePath,
            String fullFilePath) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setDescription(description);
        book.setPrice(new BigDecimal(price));
        book.setPreviewPageCount(previewPageCount);
        book.setFullPageCount(fullPageCount);
        book.setPreviewFilePath(previewFilePath);
        book.setFullFilePath(fullFilePath);
        book.setActive(true);
        return book;
    }

    private Role getOrCreateRole(RoleRepository roleRepository, String roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleName);
                    return roleRepository.save(role);
                });
    }
}
