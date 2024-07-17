<?php

namespace App\Repository;

use App\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 *
 * @method Product|null find($id, $lockMode = null, $lockVersion = null)
 * @method Product|null findOneBy(array $criteria, array $orderBy= null)
 = null, $limit = null, $offset = null)
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    /**
     * @return Product[] Returns an array of Product objects
     */
    public function findByFilters(?string $name = null, ?string $description = null): array
    {
        $qb = $this->createQueryBuilder('p');

        if ($name) {
            $qb->andWhere('p.name LIKE :name')
                ->setParameter('name', '%' . $name . '%'); // Ricerca parziale nel nome
        }

        if ($description) {
            $qb->andWhere('p.description LIKE :description')
                ->setParameter('description', '%' . $description . '%'); // Ricerca parziale nella descrizione
        }

        return $qb->getQuery()->getResult();
    }
}
