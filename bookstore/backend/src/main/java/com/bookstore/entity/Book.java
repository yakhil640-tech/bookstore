package com.bookstore.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.ToString;

@Entity
@Table(name = "books")
@ToString(exclude = { "categories", "orderItems", "readingProgressList", "bookmarks", "reviews" })
public class Book extends BaseEntity {

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String author;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Size(max = 500)
    @Column(length = 500)
    private String previewFilePath;

    @Size(max = 500)
    @Column(length = 500)
    private String fullFilePath;

    @PositiveOrZero
    @Column(nullable = false)
    private Integer previewPageCount = 0;

    @PositiveOrZero
    @Column(nullable = false)
    private Integer fullPageCount = 0;

    @Column(nullable = false)
    private Boolean active = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "book_categories", joinColumns = @JoinColumn(name = "book_id"), inverseJoinColumns = @JoinColumn(name = "category_id"))
    private Set<Category> categories = new HashSet<>();

    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY)
    private List<ReadingProgress> readingProgressList = new ArrayList<>();

    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY)
    private List<Bookmark> bookmarks = new ArrayList<>();

    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY)
    private List<Review> reviews = new ArrayList<>();


    public Book() {
    }

    public Book(String title, String author, String description, BigDecimal price, String previewFilePath, String fullFilePath, Integer previewPageCount, Integer fullPageCount, Boolean active, Set<Category> categories, List<OrderItem> orderItems, List<ReadingProgress> readingProgressList, List<Bookmark> bookmarks, List<Review> reviews) {
        this.title = title;
        this.author = author;
        this.description = description;
        this.price = price;
        this.previewFilePath = previewFilePath;
        this.fullFilePath = fullFilePath;
        this.previewPageCount = previewPageCount;
        this.fullPageCount = fullPageCount;
        this.active = active;
        this.categories = categories;
        this.orderItems = orderItems;
        this.readingProgressList = readingProgressList;
        this.bookmarks = bookmarks;
        this.reviews = reviews;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getPreviewFilePath() {
        return previewFilePath;
    }

    public void setPreviewFilePath(String previewFilePath) {
        this.previewFilePath = previewFilePath;
    }

    public String getFullFilePath() {
        return fullFilePath;
    }

    public void setFullFilePath(String fullFilePath) {
        this.fullFilePath = fullFilePath;
    }

    public Integer getPreviewPageCount() {
        return previewPageCount;
    }

    public void setPreviewPageCount(Integer previewPageCount) {
        this.previewPageCount = previewPageCount;
    }

    public Integer getFullPageCount() {
        return fullPageCount;
    }

    public void setFullPageCount(Integer fullPageCount) {
        this.fullPageCount = fullPageCount;
    }

    public Boolean isActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Set<Category> getCategories() {
        return categories;
    }

    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    public List<ReadingProgress> getReadingProgressList() {
        return readingProgressList;
    }

    public void setReadingProgressList(List<ReadingProgress> readingProgressList) {
        this.readingProgressList = readingProgressList;
    }

    public List<Bookmark> getBookmarks() {
        return bookmarks;
    }

    public void setBookmarks(List<Bookmark> bookmarks) {
        this.bookmarks = bookmarks;
    }

    public List<Review> getReviews() {
        return reviews;
    }

    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }

    public Boolean getActive() {
        return active;
    }

}

