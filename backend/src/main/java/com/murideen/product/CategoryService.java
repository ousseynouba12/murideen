package com.murideen.product;

import com.murideen.product.dto.CategoryDto;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Cacheable("categories")
    public List<CategoryDto> listAll() {
        return categoryRepository.findAllByOrderByOrdreAsc().stream().map(CategoryDto::from).toList();
    }
}
