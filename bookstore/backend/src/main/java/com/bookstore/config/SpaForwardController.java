package com.bookstore.config;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Profile("render")
public class SpaForwardController {

    @GetMapping(value = {
            "/",
            "/{path:^(?!api$|error$)[^.]+}",
            "/{path:^(?!api$|error$)[^.]+}/**/{subpath:[^.]+}"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
