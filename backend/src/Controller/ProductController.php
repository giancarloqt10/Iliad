<?php

namespace App\Controller;

use App\Entity\Product;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/products')]
class ProductController extends AbstractController
{
    public function __construct(
        private ProductRepository $productRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('/', name: 'app_product_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $name = $request->query->get('name');
        $description = $request->query->get('description');

        $products = $this->productRepository->findByFilters($name, $description);

        return $this->json($products, 200, [], ['groups' => 'product']);
    }

    #[Route('/new', name: 'app_product_new', methods: ['POST'])]
    public function new(Request $request): JsonResponse
    {
        $product = $this->serializer->deserialize($request->getContent(), Product::class, 'json');

        // Validazione
        $errors = $this->validator->validate($product);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], 422);
        }

        $this->entityManager->persist($product);
        $this->entityManager->flush();

        return $this->json($product, 201, [], ['groups' => 'product']);
    }

    #[Route('/{id}', name: 'app_product_show', methods: ['GET'])]
    public function show(Product $product): JsonResponse
    {
        return $this->json($product, 200, [], ['groups' => 'product']);
    }

    #[Route('/{id}/edit', name: 'app_product_edit', methods: ['PUT', 'PATCH'])]
    public function edit(Request $request, Product $product): JsonResponse
    {
        $product = $this->serializer->deserialize($request->getContent(), Product::class, 'json', [
            'object_to_populate' => $product,
        ]);

        // Validazione
        $errors = $this->validator->validate($product);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], 422);
        }

        $this->entityManager->flush();

        return $this->json($product, 200, [], ['groups' => 'product']);
    }

    #[Route('/{id}', name: 'app_product_delete', methods: ['DELETE'])]
    public function delete(Product $product): JsonResponse
    {
        $this->entityManager->remove($product);
        $this->entityManager->flush();

        return $this->json(['message' => 'Product deleted'], 204);
    }
}
