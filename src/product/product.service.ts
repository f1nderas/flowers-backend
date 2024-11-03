import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { ProductDto } from "./dto/product.dto";

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async getAllForUser(searchTerm?: string) {
    return searchTerm
      ? this.getSearchTermFilterForUser(searchTerm)
      : this.findAllProductsForUser();
  }
  async getAll(searchTerm?: string) {
    return searchTerm
      ? this.getSearchTermFilter(searchTerm)
      : this.findAllProducts();
  }

  private async findAllProductsForUser() {
    return this.prisma.product.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: "desc" },
      include: this.defaultProductInclude(),
    });
  }

  private async findAllProducts() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: this.defaultProductInclude(),
    });
  }

  private defaultProductInclude() {
    return { category: true };
  }
  private async getSearchTermFilterForUser(searchTerm: string) {
    return this.prisma.product.findMany({
      where: {
        isVisible: true,
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: this.defaultProductInclude(),
    });
  }

  private async getSearchTermFilter(searchTerm: string) {
    return this.prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: this.defaultProductInclude(),
    });
  }

  async getById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: { include: { user: true } },
      },
    });

    if (!product) throw new NotFoundException("Товар не найден");

    return product;
  }

  async getByCategory(categoryId: string) {
    const products = await this.prisma.product.findMany({
      where: { category: { id: categoryId } },
      include: this.defaultProductInclude(),
    });

    if (!products) throw new NotFoundException("Товары не найдены");

    return products;
  }

  async getMostPopular() {
    const popularProductIds = await this.prisma.orderItem
      .groupBy({
        by: ["productId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      })
      .then((results) => results.map((r) => r.productId));

    return this.prisma.product.findMany({
      where: { id: { in: popularProductIds } },
      include: this.defaultProductInclude(),
    });
  }

  async getSimilar(id: string) {
    const currentProduct = await this.getById(id);

    return this.prisma.product.findMany({
      where: {
        category: { title: currentProduct.category.title },
        NOT: { id: currentProduct.id },
      },
      orderBy: { createdAt: "desc" },
      include: this.defaultProductInclude(),
    });
  }

  async create(dto: ProductDto) {
    return this.prisma.product.create({
      data: { ...dto },
    });
  }

  async update(id: string, dto: ProductDto) {
    await this.getById(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.getById(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async toggleVisibility(id: string, isVisible: boolean) {
    await this.getById(id);
    return this.prisma.product.update({
      where: { id },
      data: { isVisible },
    });
  }
}
