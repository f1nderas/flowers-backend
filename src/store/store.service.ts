import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { UpdateStoreDto } from "./dto/update-store.dto";

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async get() {
    const store = await this.prisma.store.findFirst();

    if (!store) throw new NotFoundException("Магазин не найден");

    return store;
  }

  async create(dto: UpdateStoreDto) {
    return this.prisma.store.create({
      data: dto,
    });
  }

  async update(dto: UpdateStoreDto) {
    const store = await this.get();

    return this.prisma.store.update({
      where: { id: store.id },
      data: {
        ...dto,
      },
    });
  }
}
