<?php
namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderProduct;
use App\Repository\OrderRepository;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;

#[Route('/api/orders')]
class OrderController extends AbstractController
{
    public function __construct(
        private OrderRepository $orderRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('/', name: 'app_order_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        try {
            $customerName = $request->query->get('customerName');
            $description = $request->query->get('description');
            $startDate = $request->query->get('startDate');
            $endDate = $request->query->get('endDate');

            $orders = $this->orderRepository->findByFilters($customerName, $description, $startDate, $endDate);

            return $this->json($orders, 200, [], ['groups' => 'order']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'An error occurred while fetching orders'], 500);
        }
    }

    #[Route('/new', name: 'app_order_new', methods: ['POST'])]
    public function new(Request $request, ProductRepository $productRepository, SerializerInterface $serializer): JsonResponse
    {
        try{
            $orderData = json_decode($request->getContent(), true);

            // Validazione dei dati dell'ordine
            $orderConstraints = new Assert\Collection([
                'customerName' => [new Assert\NotBlank(), new Assert\Length(['min' => 2])],
                'products' => [new Assert\NotBlank(), new Assert\Type('array'), new Assert\Count(['min' => 1])],
                'orderDate' => [new Assert\NotBlank(), new Assert\DateTime()],  // Aggiungi validazione per orderDate
                'description' => [
                    new Assert\Optional(),
                    new Assert\Length(['max' => 255]),
                    new Assert\AtLeastOneOf([
                        new Assert\Type('string'),
                        new Assert\Type(TextareaType::class)
                    ])
                ] // Accetta sia stringhe che TextareaType
            ]);
            $errors = $this->validator->validate($orderData, $orderConstraints);
            if (count($errors) > 0) {
                return $this->json(['errors' => $errors], 422);
            }

            $order = new Order();
            $order->setCustomerName($orderData['customerName']);
            $order->setOrderDate(new \DateTimeImmutable($orderData['orderDate'])); 
            $order->setDescription($orderData['description'] ?? ''); 

            $productConstraints = new Assert\All([ // Assert\All per validare gli elementi dell'array
                new Assert\Collection([
                    'id' => [new Assert\NotBlank(), new Assert\Type('integer'), new Assert\Positive()],
                    'quantity' => [new Assert\NotBlank(), new Assert\Type('integer'), new Assert\Positive()],
                ])
            ]);

            $errors = $this->validator->validate($orderData['products'], $productConstraints); // Passa l'array products alla validazione
            if (count($errors) > 0) {
                return $this->json(['errors' => $errors], 422);
            }

            foreach ($orderData['products'] as $productData) {
                $productId = $productData['id'];
                $quantity = $productData['quantity'];

                $product = $productRepository->find($productId);
                if (!$product) {
                    return $this->json(['error' => 'Product not found'], 404);
                }

                $orderProduct = new OrderProduct();
                $orderProduct->setProduct($product);
                $orderProduct->setQuantity($quantity);
                $order->addOrderProduct($orderProduct);
            }

            $this->entityManager->persist($order);
            $this->entityManager->flush();

            // Serializzazione dell'ordine
            $jsonContent = $serializer->serialize($order, 'json', ['groups' => 'order']);

            return new JsonResponse($jsonContent, 201, [], true);
        } catch (\Exception $e) {
            return $this->json(['error' => 'An error occurred while creating the order'], 500);
        }
    }

    #[Route('/{id}', name: 'app_order_show', methods: ['GET'])]
    public function show(Order $order): JsonResponse
    {
        try {
            return $this->json($order, 200, [], ['groups' => ['order', 'order_details', 'product']]);
        } catch (\Doctrine\ORM\EntityNotFoundException $e) {
            return $this->json(['error' => 'Order not found'], 404);
        } catch (\Exception $e) {
            return $this->json(['error' => 'An error occurred'], 500);
        }
    }

    #[Route('/{id}/edit', name: 'app_order_edit', methods: ['PUT', 'PATCH'])]
    public function edit(Request $request, Order $order): JsonResponse
    {
        try {
            $order = $this->serializer->deserialize($request->getContent(), Order::class, 'json', [
                'object_to_populate' => $order,
            ]);

            // Validazione
            $errors = $this->validator->validate($order);
            if (count($errors) > 0) {
                return $this->json(['errors' => $errors], 422);
            }

            $this->entityManager->flush();

            return $this->json($order, 200, [], ['groups' => 'order']);
        } catch (\Doctrine\ORM\EntityNotFoundException $e) {
            return $this->json(['error' => 'Order not found'], 404);
        } catch (\Exception $e) {
            return $this->json(['error' => 'An error occurred while updating the order'], 500);
        }
    }

    #[Route('/{id}', name: 'app_order_delete', methods: ['DELETE'])]
    public function delete(Order $order): JsonResponse
    {
        try {
            // Rimuovi le associazioni nella tabella order_product
            foreach ($order->getOrderProducts() as $orderProduct) {
                $this->entityManager->remove($orderProduct);
            }
            $this->entityManager->flush(); // Salva le modifiche intermedie

            // Rimuovi l'ordine
            $this->entityManager->remove($order);
            $this->entityManager->flush();

            return $this->json(['message' => 'Order deleted'], 204);
        } catch (\Doctrine\ORM\EntityNotFoundException $e) {
            return $this->json(['error' => 'Order not found'], 404);
        } catch (\Exception $e) {
            return $this->json(['error' => 'An error occurred while deleting the order'], 500);
        }
    }
}
