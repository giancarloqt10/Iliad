<?php

namespace App\Repository;

use App\Entity\Order;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Order>
 *
 * @method Order|null find($id, $lockMode = null, $lockVersion = null)
 * @method Order|null findOneBy(array $criteria, array $orderBy = null)
 * @method Order[]    findAll()
 * @method Order[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class OrderRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Order::class);
    }

    public function findByFilters(?string $customerName, ?string $description, ?string $startDate, ?string $endDate): array
    {
        $qb = $this->createQueryBuilder('o');

        if ($customerName) {
            $qb->andWhere('o.customerName LIKE :customerName')
                ->setParameter('customerName', '%' . $customerName . '%');
        }

        if ($description) {
            $qb->andWhere('o.description LIKE :description')
                ->setParameter('description', '%' . $description . '%');
        }

        if ($startDate) {
            $qb->andWhere('o.orderDate >= :startDate')
                ->setParameter('startDate', new \DateTime($startDate));
        }

        if ($endDate) {
            $qb->andWhere('o.orderDate <= :endDate')
                ->setParameter('endDate', new \DateTime($endDate));
        }

        return $qb->getQuery()->getResult();
    }
}
