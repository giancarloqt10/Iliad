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
        try {
            $name = $request->query->get('name');
            $description = $request->query->get('description');

            $products = $this->productRepository->findByFilters($name, $description);

            return $this->json($products, 200, [], ['groups' => 'product']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'An error occurred while fetching products'], 500);
        }
    }

    #[Route('/new', name: 'app_product_new', methods: ['POST'])]
    public function new(Request $request): JsonResponse
    {
        try {
            $product = $this->serializer->deserialize($request->getContent(), Product::class, 'json');

            // Validazione
            $errors = $this->validator->validate($product);
            if (count($errors) > 0) {
                return $this->json(['errors' => $errors], 422);
            }

            $this->entityManager->persist($product);
            $this->entityManager->flush();

            return $this->json($product, 201, [], ['groups' => 'product']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'An error occurred while creating the product'], 500);
        }
    }

    #[Route('/{id}', name: 'app_product_show', methods: ['GET'])]
    public function show(Product $product): JsonResponse
    {
        try {
            return $this->json($product, 200, [], ['groups' => 'product']);
        } catch (\Doctrine\ORM\EntityNotFoundException $e) {
            return $this->json(['error' => 'Product not found'], 404);
        } catch (\Exception $e) {
            return $this->json(['error' => 'An error occurred'], 500);
        }
    }

    #[Route('/{id}/edit', name: 'app_product_edit', methods: ['PUT', 'PATCH'])]
    public function edit(Request $request, Product $product): JsonResponse
    {
        try {
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
        } catch (\Doctrine\ORM\EntityNotFoundException $e) {
            return $this->json(['error' => 'Product not found'], 404);
        } catch (\Exception $e) {
            return $this->json(['error' => 'An error occurred while updating the product'], 500);
        }
    }

    #[Route('/{id}', name: 'app_product_delete', methods: ['DELETE'])]
    public function delete(Product $product): JsonResponse
    {
        try {
            $this->entityManager->remove($product);
            $this->entityManager->flush();

            return $this->json(['message' => 'Product deleted'], 204);
        } catch (\Doctrine\ORM\EntityNotFoundException $e) {
            return $this->json(['error' => 'Product not found'], 404);
        } catch (\Exception $e) {
            return $this->json(['error' => 'An error occurred while deleting the product'], 500);
        }
    }
}
