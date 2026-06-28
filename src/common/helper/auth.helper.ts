import { ForbiddenException } from '@nestjs/common';

export class AuthHelper {
  /**
   * Fungsi sakti buat ngecek kepemilikan data atau apakah dia Admin
   * @param ownerId ID pemilik data asli (bisa ID user atau authorId berita)
   * @param loggedInUserId ID user yang lagi login dari JWT
   * @param userRole Role user yang lagi login
   * @param resourceName Nama data yang diakses (buat variasi pesan error)
   */
  static checkOwnershipOrAdmin(
    ownerId: string,
    loggedInUserId: string,
    userRole: string,
    resourceName: string = 'data'
  ) {
    if (ownerId !== loggedInUserId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        `Woi bro, lu nggak berhak ngubah/ngapus ${resourceName} orang lain!`
      );
    }
  }

  static checkIsAdmin(userRole: string, resourceName: string = 'data ini') {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException(`Woi bro! Akses ditolak. Cuma Admin yang boleh ngotak-ngatik ${resourceName}!`);
    }
  }
}