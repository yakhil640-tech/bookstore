package com.bookstore.mapper;

import org.springframework.stereotype.Component;

import com.bookstore.dto.book.BookResponseDTO;
import com.bookstore.entity.Book;

@Component
public class BookMapper {

    private static final int PREVIEW_PAGE_LIMIT = 10;

    public BookResponseDTO toBookResponseDTO(Book book) {
        return new BookResponseDTO(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getDescription(),
                book.getPrice(),
                book.getPreviewPageCount(),
                book.getFullPageCount(),
                book.getActive(),
                hasPreview(book),
                hasFullContent(book),
                null,
                null,
                null);
    }

    public BookResponseDTO toPreviewResponseDTO(Book book, String message) {
        int previewPageCount = Math.min(resolvePageCount(book.getPreviewPageCount()), PREVIEW_PAGE_LIMIT);

        return new BookResponseDTO(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                null,
                null,
                previewPageCount,
                null,
                book.getActive(),
                hasPreview(book),
                false,
                "PREVIEW",
                previewPageCount,
                message);
    }

    public BookResponseDTO toFullAccessResponseDTO(Book book, String message) {
        return new BookResponseDTO(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                null,
                null,
                book.getPreviewPageCount(),
                book.getFullPageCount(),
                book.getActive(),
                hasPreview(book),
                hasFullContent(book),
                "FULL",
                book.getFullPageCount(),
                message);
    }

    private boolean hasPreview(Book book) {
        return book.getPreviewFilePath() != null && !book.getPreviewFilePath().isBlank();
    }

    private boolean hasFullContent(Book book) {
        return book.getFullFilePath() != null && !book.getFullFilePath().isBlank();
    }

    private int resolvePageCount(Integer pageCount) {
        return pageCount == null ? 0 : Math.max(pageCount, 0);
    }
}
