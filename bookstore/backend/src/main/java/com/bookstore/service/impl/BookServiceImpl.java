package com.bookstore.service.impl;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.dto.book.BookRequestDTO;
import com.bookstore.entity.Book;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BookRepository;
import com.bookstore.service.BookService;

@Service
@Transactional(readOnly = true)
public class BookServiceImpl implements BookService {

    private static final Logger logger = LoggerFactory.getLogger(BookServiceImpl.class);

    private final BookRepository bookRepository;

    public BookServiceImpl(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    public List<Book> getAllActiveBooks() {
        logger.debug("Fetching all active books");
        return bookRepository.findByActiveTrue();
    }

    @Override
    public List<Book> getAllBooksForAdmin() {
        logger.debug("Fetching all books for admin");
        return bookRepository.findAll();
    }

    @Override
    public Optional<Book> getBookById(Long bookId) {
        logger.debug("Fetching book by id: {}", bookId);
        return bookRepository.findById(bookId);
    }

    @Override
    public List<Book> searchBooks(String keyword) {
        logger.debug("Searching books with keyword: {}", keyword);

        if (keyword == null || keyword.trim().isEmpty()) {
            return bookRepository.findByActiveTrue();
        }

        return bookRepository.findByTitleContainingIgnoreCase(keyword.trim());
    }

    @Override
    @Transactional
    public Book createBook(BookRequestDTO request) {
        logger.info("Creating new book with title: {}", request.getTitle());

        Book book = new Book();
        applyBookRequest(book, request, true);
        return bookRepository.save(book);
    }

    @Override
    @Transactional
    public Book updateBook(Long bookId, BookRequestDTO request) {
        logger.info("Updating book with id: {}", bookId);

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        applyBookRequest(book, request, false);
        return bookRepository.save(book);
    }

    @Override
    @Transactional
    public void softDeleteBook(Long bookId) {
        logger.info("Soft deleting book with id: {}", bookId);

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        book.setActive(false);
        bookRepository.save(book);
    }

    @Override
    @Transactional
    public void hardDeleteBook(Long bookId) {
        logger.info("Hard deleting book with id: {}", bookId);

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        try {
            bookRepository.delete(book);
            bookRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException(
                    "This book cannot be deleted permanently because it is already linked to existing orders, progress, or reviews.");
        }
    }

    private void applyBookRequest(Book book, BookRequestDTO request, boolean creating) {
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setDescription(request.getDescription());
        book.setPrice(request.getPrice());
        book.setPreviewPageCount(request.getPreviewPageCount() != null ? request.getPreviewPageCount() : 0);
        book.setFullPageCount(request.getFullPageCount() != null ? request.getFullPageCount() : 0);

        if (request.getActive() != null) {
            book.setActive(request.getActive());
        } else if (creating) {
            book.setActive(true);
        }
    }
}
