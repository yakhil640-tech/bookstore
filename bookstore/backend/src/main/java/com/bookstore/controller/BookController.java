package com.bookstore.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.dto.book.BookResponseDTO;
import com.bookstore.entity.Book;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.mapper.BookMapper;
import com.bookstore.response.ApiResponse;
import com.bookstore.service.BookService;
import com.bookstore.service.ReviewService;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final BookMapper bookMapper;
    private final ReviewService reviewService;

    public BookController(BookService bookService, BookMapper bookMapper, ReviewService reviewService) {
        this.bookService = bookService;
        this.bookMapper = bookMapper;
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookResponseDTO>>> getAllBooks() {
        List<BookResponseDTO> books = bookService.getAllActiveBooks()
                .stream()
                .map(bookMapper::toBookResponseDTO)
                .map(this::applyReviewSummary)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Books fetched successfully", books));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookResponseDTO>> getBookById(@PathVariable Long id) {
        Book book = bookService.getBookById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        BookResponseDTO responseDTO = applyReviewSummary(bookMapper.toBookResponseDTO(book));
        return ResponseEntity.ok(ApiResponse.success("Book details fetched successfully", responseDTO));
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<ApiResponse<BookResponseDTO>> getBookPreview(@PathVariable Long id) {
        Book book = bookService.getBookById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        BookResponseDTO responseDTO = applyReviewSummary(bookMapper.toPreviewResponseDTO(book,
                "Preview access is public. File streaming will be added in a later step."));
        return ResponseEntity.ok(ApiResponse.success("Book preview fetched successfully", responseDTO));
    }

    private BookResponseDTO applyReviewSummary(BookResponseDTO dto) {
        dto.setAverageRating(reviewService.getAverageRating(dto.getId()));
        dto.setReviewCount(reviewService.getReviewCount(dto.getId()));
        return dto;
    }
}
