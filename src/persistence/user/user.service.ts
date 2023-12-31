import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from 'src/application/repositories/business/user.repository';
import { UpdateUserAddressDTO, UpdateUserDTO } from 'src/application/dto/user.dto';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { getDataByPage, getImagePublicId } from 'src/shared/utils/custom-functions/custom-response';
import { CACHE_MANAGER } from '@nestjs/cache-manager/dist';
import { Cache } from 'cache-manager'
import { PrismaEnum } from 'src/domain/enums/prisma.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { CloudinaryService } from 'src/infrastructure/common/cloudinary/cloudinary.service';
import { UserCache } from 'src/domain/enums/cache.enum';
import { User } from '@prisma/client';

@Injectable()
export class UserService implements UserRepository {
  constructor(private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    @Inject(CACHE_MANAGER) private cache: Cache) {
  }

  async getListUser(pageNumber: number = 1, pageSize: number = 10): Promise<any> {
    const getCache = await this.cache.get(UserCache.ListUser)
    const totalRecord = Math.ceil(await this.prisma.usePrisma().user.count({
      where: {
        id: {
          gt: 0,
        },
        is_deleted: false
      }
    }))
    if (getCache) {
      return getDataByPage(pageNumber, pageSize, totalRecord, getCache)
    } else {
      const listUser = await this.prisma.usePrisma().user.findMany({
        where: {
          id: {
            gt: 0
          },
          is_deleted: false
        },
      })
      await this.cache.set(UserCache.ListUser, listUser)
      return getDataByPage(pageNumber, pageSize, totalRecord, listUser)
    }
  }

  async getListDeletedUser(pageNumber: number = 1, pageSize: number = 8): Promise<any> {
    const getCache = await this.cache.get(UserCache.ListDeletedUser)
    const totalRecord = Math.ceil(await this.prisma.usePrisma().user.count({
      where: {
        id: {
          gt: 0,
        },
        is_deleted: true
      }
    }))
    if (getCache) {
      return getDataByPage(pageNumber, pageSize, totalRecord, getCache)
    } else {
      const listDeletedUser = await this.prisma.usePrisma().user.findMany({
        where: {
          id: {
            gt: 0
          },
          is_deleted: true
        },
      })
      await this.cache.set(UserCache.ListDeletedUser, listDeletedUser)
      return getDataByPage(pageNumber, pageSize, totalRecord, listDeletedUser)
    }
  }


  async getUserDetail(id: number): Promise<any> {
    const getCache = await this.cache.get(UserCache.UserDetail + id)
    if (getCache) {
      return getCache
    } else {
      const userDetail = await this.prisma.usePrisma().user.findFirst({
        where: {
          id,
        },
        include: {
          Address: true,
        },
      })
      await this.cache.set(UserCache.UserDetail + id, userDetail, { ttl: 30 } as any)
      return userDetail
    }
  }

  async searchUserByEmail(email: string, pageNumber = 1, pageSize = 8): Promise<any> {
    const getCache: any[] = await this.cache.get(UserCache.ListUser)
    const searchArray = []
    getCache.map(item => {
      if (item.email.includes(email)) {
        searchArray.push(item)
      }
    })
    return getDataByPage(pageNumber, pageSize, searchArray.length, searchArray)

  }

  async updateUserInformation(body: UpdateUserDTO, userIdToUpdate: number): Promise<any> {
    await this.prisma.usePrisma().user.update({
      where: {
        id: userIdToUpdate,
      },
      data: body
    })
    const data = await this.prisma.usePrisma().user.findFirst({
      where: {
        id: userIdToUpdate,
      },
      include: {
        Address: true,
      },
    })
    const listUser = await this.prisma.usePrisma().user.findMany({
      where: {
        id: {
          gt: 0
        },
        is_deleted: false
      },
    })
    await this.cache.set(UserCache.ListUser, listUser)
    return await this.cache.set(UserCache.UserDetail + userIdToUpdate, data, { ttl: 30 } as any)
  }

  async uploadAvatar(data: UploadApiResponse | UploadApiErrorResponse, id: number): Promise<any> {
    const { url } = data
    const user: User = await this.prisma.findOne(PrismaEnum.User, id)
    if (user.avatar !== null) {
      const publicId = getImagePublicId(user.avatar)
      await this.cloudinary.deleteFile(publicId)
      await this.prisma.usePrisma().user.update({
        where: {
          id,
        }, data: {
          avatar: url
        }
      })
    } else {
      await this.prisma.usePrisma().user.update({
        where: {
          id,
        }, data: {
          avatar: url
        }
      })
    }
    const userDetailCache = await this.prisma.usePrisma().user.findFirst({
      where: {
        id,
      },
      include: {
        Address: true,
      },
    })
    return await this.cache.set(UserCache.UserDetail + id, userDetailCache, { ttl: 30 } as any)
  }


  async updateUserAddress(body: UpdateUserAddressDTO, userIdToUpdate: number): Promise<any> {
    const isAddressExisted = await this.prisma.usePrisma().address.findFirst({
      where: {
        user_id: userIdToUpdate
      }
    })
    if (isAddressExisted !== null) {
      await this.prisma.usePrisma().address.update({
        where: {
          user_id: userIdToUpdate
        },
        data: body
      })
    } else {
      await this.prisma.usePrisma().address.create({
        data: {
          ...body,
          user_id: userIdToUpdate
        }
      })
    }
    const userDetail = await this.prisma.usePrisma().user.findFirst({
      where: {
        id: userIdToUpdate,
      },
      include: {
        Address: true,
      },
    })
    const listUser = await this.prisma.usePrisma().user.findMany({
      where: {
        id: {
          gt: 0
        },
        is_deleted: false
      },
    })
    await this.cache.set(UserCache.ListUser, listUser)
    return await this.cache.set(UserCache.UserDetail + userIdToUpdate, userDetail, { ttl: 30 } as any)
  }

  async blockUser(id: number): Promise<any> {
    const user: User = await this.prisma.findOne(PrismaEnum.User, id)
    await this.prisma.usePrisma().user.update({
      where: {
        id,
      }, data: {
        is_banned: !user.is_banned
      }
    })
    const listUser = await this.prisma.usePrisma().user.findMany({
      where: {
        id: {
          gt: 0
        },
        is_deleted: false
      },
    })
    await this.cache.set(UserCache.ListUser, listUser)
  }

  async updateUserRole(id: number, role: string): Promise<any> {
    await this.prisma.usePrisma().user.update({
      where: {
        id,
      }, data: {
        role,
      }
    })
    const listUser = await this.prisma.usePrisma().user.findMany({
      where: {
        id: {
          gt: 0
        }, is_deleted: false
      },
    })
    const userDetail = await this.prisma.usePrisma().user.findFirst({
      where: {
        id,
      },
      include: {
        Address: true,
      },
    })
    await this.cache.set(UserCache.ListUser, listUser)
    await this.cache.set(UserCache.UserDetail + id, userDetail, { ttl: 30 } as any)
  }

  async changePassword(userId: number, body: any): Promise<any> {
    const hashPassword = await bcrypt.hash(body.password, 10)
    return await this.prisma.usePrisma().user.update({
      where: {
        id: userId
      },
      data: {
        password: hashPassword
      }
    })
  }

  async restoreUserAccount(id: number): Promise<any> {
    await this.prisma.usePrisma().user.update({
      where: {
        id,
      },
      data: {
        is_deleted: false
      }
    })
    const listUser = await this.prisma.usePrisma().user.findMany({
      where: {
        id: {
          gt: 0
        },
        is_deleted: false
      },
    })
    const listDeletedUser = await this.prisma.usePrisma().user.findMany({
      where: {
        id: {
          gt: 0
        },
        is_deleted: true
      },
    })
    await this.cache.set(UserCache.ListDeletedUser, listDeletedUser)
    return await this.cache.set(UserCache.ListUser, listUser)
  }

  async deleteUser(id: number, action: string = "temporary"): Promise<any> {
    if (action === "permanently") {
      await this.prisma.delete(PrismaEnum.User, id)
    } else {
      await this.prisma.usePrisma().user.update({
        where: {
          id,
        }, data: {
          is_deleted: true
        }
      })
    }
    const listDeletedUser = await this.prisma.usePrisma().user.findMany({
      where: {
        id: {
          gt: 0
        },
        is_deleted: true
      },
    })
    await this.cache.set(UserCache.ListDeletedUser, listDeletedUser)
    const listUser = await this.prisma.usePrisma().user.findMany({
      where: {
        id: {
          gt: 0
        },
        is_deleted: false
      },
    })
    return await this.cache.set(UserCache.ListUser, listUser)
  }
}


