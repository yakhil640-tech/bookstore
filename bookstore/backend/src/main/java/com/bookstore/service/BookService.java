package com.bookstore.service;

import java.util.List;
import java.util.Optional;

import com.bookstore.dto.book.BookRequestDTO;
import com.bookstore.entity.Book;

public interface BookService {

    List<Book> getAllActiveBooks();

    List<Book> getAllBooksForAdmin();

    Optional<Book> getBookById(Long bookId);

    List<Book> searchBooks(String keyword);

    Book createBook(BookRequestDTO request);

    Book updateBook(Long bookId, BookRequestDTO request);

    void softDeleteBook(Long bookId);

    void hardDeleteBook(Long bookId);
}
