package com.murideen.product;

import com.murideen.product.dto.CategoryDto;
import com.murideen.product.dto.ProductDto;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;
    private final CategoryService categoryService;

    public ProductController(ProductService productService, CategoryService categoryService) {
        this.productService = productService;
        this.categoryService = categoryService;
    }

    @GetMapping("/products")
    public Page<ProductDto> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.listPublic(category, search, sort, page, size);
    }

    @GetMapping("/products/best-sellers")
    public List<ProductDto> bestSellers() {
        return productService.bestSellers();
    }

    @GetMapping("/products/{slug}")
    public ResponseEntity<ProductDto> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getBySlug(slug));
    }

    @GetMapping("/categories")
    public List<CategoryDto> categories() {
        return categoryService.listAll();
    }
}
