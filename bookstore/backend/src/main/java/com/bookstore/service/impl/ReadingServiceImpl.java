package com.bookstore.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.entity.Book;
import com.bookstore.entity.ReadingProgress;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderItemRepository;
import com.bookstore.repository.ReadingProgressRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.service.ReadingService;
import com.bookstore.service.SubscriptionService;

@Service
@Transactional
public class ReadingServiceImpl implements ReadingService {

    private static final Logger logger = LoggerFactory.getLogger(ReadingServiceImpl.class);
    private static final int PREVIEW_PAGE_LIMIT = 10;

    private final OrderItemRepository orderItemRepository;
    private final SubscriptionService subscriptionService;
    private final ReadingProgressRepository readingProgressRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    public ReadingServiceImpl(OrderItemRepository orderItemRepository,
            SubscriptionService subscriptionService,
            ReadingProgressRepository readingProgressRepository,
            UserRepository userRepository,
            BookRepository bookRepository) {
        this.orderItemRepository = orderItemRepository;
        this.subscriptionService = subscriptionService;
        this.readingProgressRepository = readingProgressRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canAccessBook(Long userId, Long bookId) {
        logger.debug("Checking full book access for user id: {} and book id: {}", userId, bookId);

        if (userId == null || bookId == null) {
            return false;
        }

        boolean hasCompletedPurchase = orderItemRepository.existsCompletedPurchaseByUserIdAndBookId(userId, bookId);
        if (hasCompletedPurchase) {
            logger.debug("User {} can access book {} because the purchase is completed", userId, bookId);
            return true;
        }

        boolean hasActiveSubscription = subscriptionService.isSubscriptionActive(userId);
        if (hasActiveSubscription) {
            logger.debug("User {} can access book {} because subscription is active", userId, bookId);
            return true;
        }

        logger.debug("User {} cannot access full content of book {}", userId, bookId);
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public ReadingProgress getReadingProgress(Long userId, Long bookId) {
        Book book = getBook(bookId);
        int maxPage = resolveMaxReadablePage(userId, book);

        return readingProgressRepository.findByUserIdAndBookId(userId, bookId)
                .orElseGet(() -> new ReadingProgress(
                        getUser(userId),
                        book,
                        0,
                        BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                        null));
    }

    @Override
    public ReadingProgress saveReadingProgress(Long userId, Long bookId, Integer lastPage) {
        if (lastPage == null || lastPage < 0) {
            throw new BadRequestException("Last page must be zero or positive");
        }

        User user = getUser(userId);
        Book book = getBook(bookId);
        int maxPage = resolveMaxReadablePage(userId, book);

        if (maxPage <= 0) {
            throw new BadRequestException("This book does not have readable pages configured");
        }

        int sanitizedLastPage = Math.min(lastPage, maxPage);
        BigDecimal progressPercent = BigDecimal.valueOf(sanitizedLastPage)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(maxPage), 2, RoundingMode.HALF_UP);

        ReadingProgress progress = readingProgressRepository.findByUserIdAndBookId(userId, bookId)
                .orElseGet(ReadingProgress::new);

        progress.setUser(user);
        progress.setBook(book);
        progress.setLastPage(sanitizedLastPage);
        progress.setProgressPercent(progressPercent);
        progress.setLastReadAt(LocalDateTime.now());

        return readingProgressRepository.save(progress);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private Book getBook(Long bookId) {
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
    }

    private int resolveMaxReadablePage(Long userId, Book book) {
        boolean hasFullAccess = canAccessBook(userId, book.getId());
        Integer maxPage = hasFullAccess ? book.getFullPageCount() : Math.min(PREVIEW_PAGE_LIMIT, safePageCount(book.getPreviewPageCount()));
        return maxPage == null ? 0 : Math.max(maxPage, 0);
    }

    private int safePageCount(Integer pageCount) {
        return pageCount == null ? 0 : Math.max(pageCount, 0);
    }
}
