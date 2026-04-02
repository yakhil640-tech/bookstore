package com.bookstore.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookstore.entity.Book;

public interface BookRepository extends JpaRepository<Book, Long> {

    long countByActiveTrue();

    List<Book> findByActiveTrue();

    List<Book> findByTitleContainingIgnoreCase(String keyword);
}
