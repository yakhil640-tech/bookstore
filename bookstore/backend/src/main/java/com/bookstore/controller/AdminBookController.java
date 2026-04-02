package com.bookstore.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.dto.book.BookRequestDTO;
import com.bookstore.dto.book.BookResponseDTO;
import com.bookstore.mapper.BookMapper;
import com.bookstore.response.ApiResponse;
import com.bookstore.service.BookService;
import com.bookstore.service.ReviewService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/books")
@Validated
public class AdminBookController {

    private final BookService bookService;
    private final BookMapper bookMapper;
    private final ReviewService reviewService;

    public AdminBookController(BookService bookService, BookMapper bookMapper, ReviewService reviewService) {
        this.bookService = bookService;
        this.bookMapper = bookMapper;
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookResponseDTO>>> getAllBooksForAdmin() {
        List<BookResponseDTO> books = bookService.getAllBooksForAdmin()
                .stream()
                .map(bookMapper::toBookResponseDTO)
                .map(this::applyReviewSummary)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Admin books fetched successfully", books));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookResponseDTO>> createBook(@Valid @RequestBody BookRequestDTO request) {
        BookResponseDTO responseDTO = applyReviewSummary(bookMapper.toBookResponseDTO(bookService.createBook(request)));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book created successfully", responseDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookResponseDTO>> updateBook(@PathVariable Long id,
            @Valid @RequestBody BookRequestDTO request) {
        BookResponseDTO responseDTO = applyReviewSummary(bookMapper.toBookResponseDTO(bookService.updateBook(id, request)));
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully", responseDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> hardDeleteBook(@PathVariable Long id) {
        bookService.hardDeleteBook(id);
        return ResponseEntity.ok(ApiResponse.success("Book deleted permanently", null));
    }

    private BookResponseDTO applyReviewSummary(BookResponseDTO dto) {
        dto.setAverageRating(reviewService.getAverageRating(dto.getId()));
        dto.setReviewCount(reviewService.getReviewCount(dto.getId()));
        return dto;
    }
}
