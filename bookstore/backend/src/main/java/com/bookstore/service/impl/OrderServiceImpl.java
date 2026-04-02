package com.bookstore.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.entity.Book;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.User;
import com.bookstore.entity.enums.OrderStatus;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderItemRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.service.OrderService;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    public OrderServiceImpl(OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            UserRepository userRepository,
            BookRepository bookRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    @Override
    public Order createOrder(Long userId, List<Long> bookIds) {
        logger.info("Creating order for user id: {}", userId);

        if (userId == null) {
            throw new BadRequestException("User id is required");
        }

        if (bookIds == null || bookIds.isEmpty()) {
            throw new BadRequestException("At least one book is required to create an order");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Set<Long> uniqueBookIds = new LinkedHashSet<>();
        for (Long bookId : bookIds) {
            if (bookId != null) {
                uniqueBookIds.add(bookId);
            }
        }

        if (uniqueBookIds.isEmpty()) {
            throw new BadRequestException("Valid book ids are required to create an order");
        }

        List<Book> books = bookRepository.findAllById(uniqueBookIds);
        if (books.size() != uniqueBookIds.size()) {
            throw new ResourceNotFoundException("One or more books were not found");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Book book : books) {
            validateBookAvailability(book);
            validateDuplicateOrderRules(userId, book);
            totalAmount = totalAmount.add(book.getPrice());
        }

        Order order = new Order();
        order.setPurchaser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = new ArrayList<>();
        for (Book book : books) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setBook(book);
            orderItem.setUnitPrice(book.getPrice());
            orderItems.add(orderItem);
        }

        savedOrder.setOrderItems(orderItems);
        orderItemRepository.saveAll(orderItems);

        logger.info("Order created successfully for user id: {} with {} books", userId, orderItems.size());
        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUserId(Long userId) {
        logger.debug("Fetching orders for user id: {}", userId);
        return orderRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getCompletedOrdersByUserId(Long userId) {
        logger.debug("Fetching completed orders for user id: {}", userId);
        return orderRepository.findCompletedOrdersWithItemsByPurchaserId(userId, OrderStatus.COMPLETED);
    }

    private void validateBookAvailability(Book book) {
        if (!Boolean.TRUE.equals(book.getActive())) {
            throw new BadRequestException("Book is not available for purchase: " + book.getTitle());
        }
    }

    private void validateDuplicateOrderRules(Long userId, Book book) {
        if (orderItemRepository.existsCompletedPurchaseByUserIdAndBookId(userId, book.getId())) {
            throw new BadRequestException("Book is already purchased: " + book.getTitle());
        }

        if (orderItemRepository.existsPendingOrderByUserIdAndBookId(userId, book.getId())) {
            throw new BadRequestException("Book already exists in a pending order: " + book.getTitle());
        }
    }
}
