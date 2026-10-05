import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('logout', () => {
    it('should remove jwt_token and username from localStorage', () => {
      // Arrange
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

      // Act
      service.logout();

      // Assert
      expect(removeItemSpy).toHaveBeenCalledWith('jwt_token');
      expect(removeItemSpy).toHaveBeenCalledWith('username');
    });
  });
});
