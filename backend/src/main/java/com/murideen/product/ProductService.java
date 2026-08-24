package com.murideen.product;

import com.murideen.common.ApiException;
import com.murideen.config.RevalidationService;
import com.murideen.product.dto.ProductDto;
import com.murideen.product.dto.ProductUpsertRequest;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final RevalidationService revalidationService;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository,
                           RevalidationService revalidationService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.revalidationService = revalidationService;
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> listPublic(String category, String search, String sort, int page, int size) {
        Sort sortOrder = switch (sort == null ? "" : sort) {
            case "prix_asc" -> Sort.by("prix").ascending();
            case "prix_desc" -> Sort.by("prix").descending();
            case "nouveautes" -> Sort.by("createdAt").descending();
            default -> Sort.by("createdAt").descending();
        };
        Pageable pageable = PageRequest.of(page, size, sortOrder);
        return productRepository.search(ProductStatus.ACTIF, category, search, pageable).map(ProductDto::from);
    }

    @Transactional(readOnly = true)
    public ProductDto getBySlug(String slug) {
        Product product = productRepository.findBySlugAndStatut(slug, ProductStatus.ACTIF)
                .orElseThrow(() -> ApiException.notFound("Produit introuvable."));
        return ProductDto.from(product);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "bestSellers", key = "'top8'")
    public List<ProductDto> bestSellers() {
        return new ArrayList<>(productRepository.findByStatutOrderByNbVentesDesc(ProductStatus.ACTIF, PageRequest.of(0, 8))
                .map(ProductDto::from).getContent());
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> listAdmin(String category, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.searchAdmin(category, search, pageable).map(ProductDto::from);
    }

    @Transactional(readOnly = true)
    public ProductDto getByIdAdmin(Long id) {
        return ProductDto.from(findById(id));
    }

    @Transactional
    @CacheEvict(value = {"bestSellers", "products"}, allEntries = true)
    public ProductDto create(ProductUpsertRequest request) {
        Product product = new Product();
        applyRequest(product, request);
        product.setSlug(uniqueSlug(request.nom(), null));
        productRepository.save(product);
        revalidationService.revalidateProduct(product.getSlug());
        return ProductDto.from(product);
    }

    @Transactional
    @CacheEvict(value = {"bestSellers", "products"}, allEntries = true)
    public ProductDto update(Long id, ProductUpsertRequest request) {
        Product product = findById(id);
        applyRequest(product, request);
        productRepository.save(product);
        revalidationService.revalidateProduct(product.getSlug());
        return ProductDto.from(product);
    }

    @Transactional
    @CacheEvict(value = {"bestSellers", "products"}, allEntries = true)
    public void delete(Long id) {
        Product product = findById(id);
        String slug = product.getSlug();
        productRepository.delete(product);
        revalidationService.revalidateProduct(slug);
    }

    private void applyRequest(Product product, ProductUpsertRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> ApiException.badRequest("Catégorie invalide."));
        product.setNom(request.nom());
        product.setDescription(request.description());
        product.setPrix(request.prix());
        product.setCategory(category);
        product.setImages(request.images() == null ? List.of() : request.images());
        product.setStatut("ACTIF".equalsIgnoreCase(request.statut()) ? ProductStatus.ACTIF : ProductStatus.BROUILLON);

        if (request.variantes() != null) {
            List<ProductVariant> updated = new ArrayList<>();
            for (ProductUpsertRequest.VariantRequest vr : request.variantes()) {
                ProductVariant variant = product.getVariants().stream()
                        .filter(v -> vr.id() != null && v.getId().equals(vr.id()))
                        .findFirst()
                        .orElseGet(ProductVariant::new);
                variant.setProduct(product);
                variant.setTaille(vr.taille());
                variant.setCouleur(vr.couleur());
                variant.setStock(vr.stock());
                updated.add(variant);
            }
            product.getVariants().clear();
            product.getVariants().addAll(updated);
        }
    }

    private Product findById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> ApiException.notFound("Produit introuvable."));
    }

    private String uniqueSlug(String nom, Long excludeId) {
        String base = slugify(nom);
        String candidate = base;
        int i = 1;
        while (productRepository.findBySlug(candidate).filter(p -> !p.getId().equals(excludeId)).isPresent()) {
            candidate = base + "-" + (++i);
        }
        return candidate;
    }

    private String slugify(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String noAccents = Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
        return noAccents.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");
    }
}
