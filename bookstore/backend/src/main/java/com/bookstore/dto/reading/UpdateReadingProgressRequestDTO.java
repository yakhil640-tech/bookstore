package com.bookstore.dto.reading;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class UpdateReadingProgressRequestDTO {

    @NotNull(message = "Last page is required")
    @PositiveOrZero(message = "Last page must be zero or positive")
    private Integer lastPage;

    public UpdateReadingProgressRequestDTO() {
    }

    public UpdateReadingProgressRequestDTO(Integer lastPage) {
        this.lastPage = lastPage;
    }

    public Integer getLastPage() {
        return lastPage;
    }

    public void setLastPage(Integer lastPage) {
        this.lastPage = lastPage;
    }
}
