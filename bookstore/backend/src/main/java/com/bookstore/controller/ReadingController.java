package com.bookstore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.dto.book.BookResponseDTO;
import com.bookstore.dto.reading.ReadingProgressResponseDTO;
import com.bookstore.dto.reading.UpdateReadingProgressRequestDTO;
import com.bookstore.entity.Book;
import com.bookstore.entity.ReadingProgress;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.exception.UnauthorizedException;
import com.bookstore.mapper.BookMapper;
import com.bookstore.response.ApiResponse;
import com.bookstore.security.CustomUserDetails;
import com.bookstore.service.BookService;
import com.bookstore.service.ReadingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reading")
public class ReadingController {

    private static final int PREVIEW_PAGE_LIMIT = 10;

    private final ReadingService readingService;
    private final BookService bookService;
    private final BookMapper bookMapper;

    public ReadingController(ReadingService readingService, BookService bookService, BookMapper bookMapper) {
        this.readingService = readingService;
        this.bookService = bookService;
        this.bookMapper = bookMapper;
    }

    @GetMapping("/books/{bookId}")
    public ResponseEntity<ApiResponse<BookResponseDTO>> readBook(
            @PathVariable Long bookId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required to read full content");
        }

        Book book = bookService.getBookById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        if (readingService.canAccessBook(currentUser.getUserId(), bookId)) {
            return ResponseEntity.ok(ApiResponse.success("Full book access granted",
                    bookMapper.toFullAccessResponseDTO(book, "Full book access granted")));
        }

        return ResponseEntity.ok(ApiResponse.success("Preview content returned",
                bookMapper.toPreviewResponseDTO(book,
                        "Full access denied. Returning preview content for this user")));
    }

    @GetMapping("/books/{bookId}/progress")
    public ResponseEntity<ApiResponse<ReadingProgressResponseDTO>> getReadingProgress(
            @PathVariable Long bookId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required to view reading progress");
        }

        ReadingProgress progress = readingService.getReadingProgress(currentUser.getUserId(), bookId);
        return ResponseEntity.ok(ApiResponse.success("Reading progress fetched successfully",
                toReadingProgressResponseDTO(progress, currentUser.getUserId(), bookId)));
    }

    @PutMapping("/books/{bookId}/progress")
    public ResponseEntity<ApiResponse<ReadingProgressResponseDTO>> saveReadingProgress(
            @PathVariable Long bookId,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody UpdateReadingProgressRequestDTO request) {
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required to save reading progress");
        }

        ReadingProgress progress = readingService.saveReadingProgress(currentUser.getUserId(), bookId, request.getLastPage());
        return ResponseEntity.ok(ApiResponse.success("Reading progress saved successfully",
                toReadingProgressResponseDTO(progress, currentUser.getUserId(), bookId)));
    }

    private ReadingProgressResponseDTO toReadingProgressResponseDTO(ReadingProgress progress, Long userId, Long bookId) {
        Book book = bookService.getBookById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        boolean hasFullAccess = readingService.canAccessBook(userId, bookId);
        Integer maxPage = hasFullAccess
                ? book.getFullPageCount()
                : Math.min(book.getPreviewPageCount() == null ? 0 : Math.max(book.getPreviewPageCount(), 0), PREVIEW_PAGE_LIMIT);

        return new ReadingProgressResponseDTO(
                bookId,
                progress.getLastPage(),
                progress.getProgressPercent(),
                maxPage,
                progress.getLastReadAt());
    }
}
