package com.bookstore.config;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Profile("render")
public class SpaForwardController {

    @GetMapping(value = {
            "/",
            "/login",
            "/register",
            "/library",
            "/subscription",
            "/admin",
            "/admin/books",
            "/admin/orders",
            "/admin/users",
            "/admin/payments",
            "/books/{bookId}",
            "/reader/{bookId}"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
