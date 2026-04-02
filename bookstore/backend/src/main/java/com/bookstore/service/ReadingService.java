package com.bookstore.service;

import java.util.List;

import com.bookstore.entity.ReadingProgress;

public interface ReadingService {

    boolean canAccessBook(Long userId, Long bookId);

    ReadingProgress getReadingProgress(Long userId, Long bookId);

    ReadingProgress saveReadingProgress(Long userId, Long bookId, Integer lastPage);
}
